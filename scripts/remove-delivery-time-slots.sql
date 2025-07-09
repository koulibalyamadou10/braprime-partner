-- ============================================================================
-- SUPPRESSION DES TABLES DELIVERY_TIME_SLOTS ET INTÉGRATION DANS BUSINESSES
-- ============================================================================
-- Ce script intègre les données de delivery_time_slots dans la table businesses
-- et supprime les tables delivery_time_slots et delivery_zones

-- ============================================================================
-- ÉTAPE 1: AJOUTER LES COLONNES DE LIVRAISON À LA TABLE BUSINESSES
-- ============================================================================

-- Ajouter les colonnes pour les créneaux de livraison
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS delivery_slots JSONB DEFAULT '[]';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS delivery_zones JSONB DEFAULT '[]';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS max_orders_per_slot INTEGER DEFAULT 10;

-- Commentaire pour expliquer la structure des colonnes JSONB
COMMENT ON COLUMN businesses.delivery_slots IS 'Créneaux de livraison au format JSONB: [{"day": 0, "start": "08:00", "end": "22:00", "active": true}]';
COMMENT ON COLUMN businesses.delivery_zones IS 'Zones de livraison au format JSONB: [{"name": "Zone 1", "fee": 5000, "time": "30-45 min", "active": true}]';

-- ============================================================================
-- ÉTAPE 2: MIGRER LES DONNÉES DE DELIVERY_TIME_SLOTS
-- ============================================================================

-- Fonction pour migrer les créneaux de livraison
CREATE OR REPLACE FUNCTION migrate_delivery_time_slots()
RETURNS void AS $$
DECLARE
    business_record RECORD;
    slots_array JSONB;
    slot_record RECORD;
BEGIN
    -- Parcourir tous les businesses
    FOR business_record IN SELECT id FROM businesses LOOP
        slots_array := '[]'::JSONB;
        
        -- Récupérer tous les créneaux pour ce business
        FOR slot_record IN 
            SELECT 
                day_of_week,
                start_time::text,
                end_time::text,
                is_active,
                max_orders_per_slot
            FROM delivery_time_slots 
            WHERE business_id = business_record.id
            ORDER BY day_of_week, start_time
        LOOP
            -- Ajouter le créneau au tableau JSONB
            slots_array := slots_array || jsonb_build_object(
                'day', slot_record.day_of_week,
                'start', slot_record.start_time,
                'end', slot_record.end_time,
                'active', slot_record.is_active,
                'max_orders', slot_record.max_orders_per_slot
            );
        END LOOP;
        
        -- Mettre à jour le business avec les créneaux
        UPDATE businesses 
        SET delivery_slots = slots_array
        WHERE id = business_record.id;
        
        RAISE NOTICE 'Business %: % créneaux migrés', business_record.id, jsonb_array_length(slots_array);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Exécuter la migration
SELECT migrate_delivery_time_slots();

-- ============================================================================
-- ÉTAPE 3: MIGRER LES DONNÉES DE DELIVERY_ZONES
-- ============================================================================

-- Fonction pour migrer les zones de livraison
CREATE OR REPLACE FUNCTION migrate_delivery_zones()
RETURNS void AS $$
DECLARE
    zones_array JSONB;
    zone_record RECORD;
BEGIN
    zones_array := '[]'::JSONB;
    
    -- Récupérer toutes les zones de livraison
    FOR zone_record IN 
        SELECT 
            name,
            delivery_fee,
            delivery_time,
            is_active
        FROM delivery_zones 
        WHERE is_active = true
        ORDER BY name
    LOOP
        -- Ajouter la zone au tableau JSONB
        zones_array := zones_array || jsonb_build_object(
            'name', zone_record.name,
            'fee', zone_record.delivery_fee,
            'time', zone_record.delivery_time,
            'active', zone_record.is_active
        );
    END LOOP;
    
    -- Mettre à jour tous les businesses avec les zones par défaut
    UPDATE businesses 
    SET delivery_zones = zones_array
    WHERE delivery_zones IS NULL OR delivery_zones = '[]'::JSONB;
    
    RAISE NOTICE '% zones de livraison migrées', jsonb_array_length(zones_array);
END;
$$ LANGUAGE plpgsql;

-- Exécuter la migration
SELECT migrate_delivery_zones();

-- ============================================================================
-- ÉTAPE 4: CRÉER DES FONCTIONS UTILITAIRES POUR LES CRÉNEAUX
-- ============================================================================

-- Fonction pour vérifier si un créneau est disponible
CREATE OR REPLACE FUNCTION check_delivery_slot_availability(
    business_id_param INTEGER,
    preferred_time TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
DECLARE
    business_slots JSONB;
    day_of_week INTEGER;
    time_string TEXT;
    slot_exists BOOLEAN := FALSE;
    max_orders INTEGER;
    current_orders INTEGER;
BEGIN
    -- Récupérer les créneaux du business
    SELECT delivery_slots INTO business_slots
    FROM businesses 
    WHERE id = business_id_param;
    
    IF business_slots IS NULL OR business_slots = '[]'::JSONB THEN
        RETURN FALSE;
    END IF;
    
    -- Extraire le jour de la semaine et l'heure
    day_of_week := EXTRACT(DOW FROM preferred_time);
    time_string := TO_CHAR(preferred_time, 'HH24:MI');
    
    -- Vérifier si un créneau existe pour ce jour et cette heure
    SELECT EXISTS(
        SELECT 1 
        FROM jsonb_array_elements(business_slots) AS slot
        WHERE (slot->>'day')::INTEGER = day_of_week
        AND (slot->>'active')::BOOLEAN = TRUE
        AND (slot->>'start') <= time_string
        AND (slot->>'end') >= time_string
    ) INTO slot_exists;
    
    IF NOT slot_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Récupérer le nombre maximum de commandes pour ce créneau
    SELECT (slot->>'max_orders')::INTEGER INTO max_orders
    FROM jsonb_array_elements(business_slots) AS slot
    WHERE (slot->>'day')::INTEGER = day_of_week
    AND (slot->>'active')::BOOLEAN = TRUE
    AND (slot->>'start') <= time_string
    AND (slot->>'end') >= time_string
    LIMIT 1;
    
    -- Compter les commandes existantes dans ce créneau
    SELECT COUNT(*) INTO current_orders
    FROM orders
    WHERE business_id = business_id_param
    AND delivery_type = 'scheduled'
    AND preferred_delivery_time >= preferred_time
    AND preferred_delivery_time < preferred_time + INTERVAL '30 minutes';
    
    RETURN current_orders < max_orders;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les créneaux disponibles d'un business
CREATE OR REPLACE FUNCTION get_business_delivery_slots(business_id_param INTEGER)
RETURNS JSONB AS $$
DECLARE
    business_slots JSONB;
BEGIN
    SELECT delivery_slots INTO business_slots
    FROM businesses 
    WHERE id = business_id_param;
    
    RETURN COALESCE(business_slots, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour ajouter un créneau de livraison
CREATE OR REPLACE FUNCTION add_delivery_slot(
    business_id_param INTEGER,
    day_of_week_param INTEGER,
    start_time_param TEXT,
    end_time_param TEXT,
    is_active_param BOOLEAN DEFAULT TRUE,
    max_orders_param INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS $$
DECLARE
    current_slots JSONB;
    new_slot JSONB;
BEGIN
    -- Récupérer les créneaux actuels
    SELECT delivery_slots INTO current_slots
    FROM businesses 
    WHERE id = business_id_param;
    
    IF current_slots IS NULL THEN
        current_slots := '[]'::JSONB;
    END IF;
    
    -- Créer le nouveau créneau
    new_slot := jsonb_build_object(
        'day', day_of_week_param,
        'start', start_time_param,
        'end', end_time_param,
        'active', is_active_param,
        'max_orders', max_orders_param
    );
    
    -- Ajouter le créneau
    current_slots := current_slots || new_slot;
    
    -- Mettre à jour le business
    UPDATE businesses 
    SET delivery_slots = current_slots
    WHERE id = business_id_param;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ÉTAPE 5: SUPPRIMER LES ANCIENNES TABLES
-- ============================================================================

-- Supprimer les contraintes de clés étrangères d'abord
ALTER TABLE delivery_time_slots DROP CONSTRAINT IF EXISTS delivery_time_slots_business_id_fkey;

-- Supprimer les tables
DROP TABLE IF EXISTS delivery_time_slots CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;

-- Nettoyer les fonctions de migration
DROP FUNCTION IF EXISTS migrate_delivery_time_slots();
DROP FUNCTION IF EXISTS migrate_delivery_zones();

-- ============================================================================
-- ÉTAPE 6: CRÉER DES INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Index pour les requêtes sur les créneaux de livraison
CREATE INDEX IF NOT EXISTS idx_businesses_delivery_slots 
ON businesses USING GIN (delivery_slots);

CREATE INDEX IF NOT EXISTS idx_businesses_delivery_zones 
ON businesses USING GIN (delivery_zones);

-- ============================================================================
-- ÉTAPE 7: MISE À JOUR DU SERVICE DELIVERY MANAGEMENT
-- ============================================================================

-- Créer une vue pour faciliter les requêtes
CREATE OR REPLACE VIEW business_delivery_info AS
SELECT 
    b.id,
    b.name,
    b.delivery_slots,
    b.delivery_zones,
    b.max_orders_per_slot,
    b.delivery_time,
    b.delivery_fee
FROM businesses b
WHERE b.is_active = true;

-- ============================================================================
-- EXEMPLES D'UTILISATION
-- ============================================================================

-- Exemple 1: Vérifier si un créneau est disponible
-- SELECT check_delivery_slot_availability(1, '2024-01-15 14:30:00'::TIMESTAMP WITH TIME ZONE);

-- Exemple 2: Obtenir les créneaux d'un business
-- SELECT get_business_delivery_slots(1);

-- Exemple 3: Ajouter un créneau
-- SELECT add_delivery_slot(1, 1, '08:00', '22:00', true, 15);

-- Exemple 4: Voir les informations de livraison d'un business
-- SELECT * FROM business_delivery_info WHERE id = 1;

-- ============================================================================
-- MIGRATION DES DONNÉES EXISTANTES
-- ============================================================================

-- Si vous avez des données existantes, elles ont été migrées automatiquement
-- Vous pouvez vérifier avec:
-- SELECT id, name, delivery_slots, delivery_zones FROM businesses LIMIT 5;

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================

/*
1. Les données de delivery_time_slots ont été migrées vers businesses.delivery_slots
2. Les données de delivery_zones ont été migrées vers businesses.delivery_zones
3. Les fonctions utilitaires ont été créées pour gérer les créneaux
4. Les anciennes tables ont été supprimées
5. Les index ont été créés pour les performances

Structure des données JSONB:

delivery_slots:
[
  {
    "day": 0,
    "start": "08:00",
    "end": "22:00", 
    "active": true,
    "max_orders": 10
  }
]

delivery_zones:
[
  {
    "name": "Zone 1",
    "fee": 5000,
    "time": "30-45 min",
    "active": true
  }
]
*/ 