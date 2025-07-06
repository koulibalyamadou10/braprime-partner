-- ============================================================================
-- AJOUT DU STATUT "NO_SHOW" POUR LES RÉSERVATIONS
-- ============================================================================

-- Vérifier si le statut "no_show" existe déjà dans la table reservation_statuses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reservation_statuses WHERE name = 'no_show') THEN
        INSERT INTO reservation_statuses (name, label, color) 
        VALUES ('no_show', 'Absent', 'orange');
    END IF;
END $$;

-- Mettre à jour les contraintes de la table reservations si nécessaire
-- (Cette partie peut nécessiter une migration plus complexe selon la structure actuelle)

-- Ajouter un commentaire pour documenter le nouveau statut
COMMENT ON COLUMN reservations.status IS 'Statuts possibles: pending, confirmed, cancelled, completed, no_show';

-- ============================================================================
-- MISE À JOUR DES FONCTIONS DE NOTIFICATION POUR LE STATUT NO_SHOW
-- ============================================================================

-- Fonction pour créer une notification quand une réservation est marquée comme "no_show"
CREATE OR REPLACE FUNCTION notify_reservation_no_show()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'no_show' AND OLD.status != 'no_show' THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            priority,
            data
        ) VALUES (
            NEW.user_id,
            'reservation_no_show',
            'Réservation marquée comme absente',
            'Votre réservation chez ' || NEW.business_name || ' pour le ' || NEW.date || ' à ' || NEW.time || ' a été marquée comme absente.',
            'high',
            jsonb_build_object(
                'reservation_id', NEW.id,
                'business_name', NEW.business_name,
                'date', NEW.date,
                'time', NEW.time,
                'status', NEW.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger si il n'existe pas déjà
DROP TRIGGER IF EXISTS trigger_notify_reservation_no_show ON reservations;
CREATE TRIGGER trigger_notify_reservation_no_show
    AFTER UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION notify_reservation_no_show();

-- ============================================================================
-- VUES POUR LES STATISTIQUES AVEC NO_SHOW
-- ============================================================================

-- Vue pour les statistiques de réservations par statut
CREATE OR REPLACE VIEW reservation_stats AS
SELECT 
    business_id,
    business_name,
    COUNT(*) as total_reservations,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
    COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_count,
    ROUND(
        (COUNT(CASE WHEN status = 'no_show' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
    ) as no_show_rate
FROM reservations
GROUP BY business_id, business_name;

-- ============================================================================
-- INDEX POUR OPTIMISER LES REQUÊTES PAR STATUT
-- ============================================================================

-- Index pour optimiser les requêtes par statut
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_business_status ON reservations(business_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_date_status ON reservations(date, status);

-- ============================================================================
-- FONCTION POUR CALCULER LE TAUX DE NO_SHOW
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_no_show_rate(business_id_param INTEGER, start_date DATE, end_date DATE)
RETURNS DECIMAL AS $$
DECLARE
    total_reservations INTEGER;
    no_show_count INTEGER;
    no_show_rate DECIMAL;
BEGIN
    -- Compter le total des réservations confirmées dans la période
    SELECT COUNT(*) INTO total_reservations
    FROM reservations
    WHERE business_id = business_id_param
      AND date BETWEEN start_date AND end_date
      AND status IN ('confirmed', 'completed', 'no_show');
    
    -- Compter les no-shows dans la période
    SELECT COUNT(*) INTO no_show_count
    FROM reservations
    WHERE business_id = business_id_param
      AND date BETWEEN start_date AND end_date
      AND status = 'no_show';
    
    -- Calculer le taux
    IF total_reservations > 0 THEN
        no_show_rate := (no_show_count::DECIMAL / total_reservations::DECIMAL) * 100;
    ELSE
        no_show_rate := 0;
    END IF;
    
    RETURN ROUND(no_show_rate, 2);
END;
$$ LANGUAGE plpgsql; 