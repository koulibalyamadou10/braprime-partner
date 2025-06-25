-- ============================================================================
-- CONFIGURATION DES POLITIQUES RLS POUR LA TABLE RESERVATIONS
-- ============================================================================

-- Activer RLS sur la table reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUES POUR LES UTILISATEURS (CLIENTS)
-- ============================================================================

-- Politique pour permettre aux utilisateurs de voir leurs propres réservations
CREATE POLICY "Users can view their own reservations" ON reservations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres réservations
CREATE POLICY "Users can create their own reservations" ON reservations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres réservations
CREATE POLICY "Users can update their own reservations" ON reservations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres réservations
CREATE POLICY "Users can delete their own reservations" ON reservations
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- POLITIQUES POUR LES PARTENAIRES (PROPRIÉTAIRES DE COMMERCES)
-- ============================================================================

-- Politique pour permettre aux partenaires de voir les réservations de leur commerce
CREATE POLICY "Partners can view reservations for their business" ON reservations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = reservations.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- Politique pour permettre aux partenaires de mettre à jour les réservations de leur commerce
CREATE POLICY "Partners can update reservations for their business" ON reservations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = reservations.business_id 
            AND businesses.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = reservations.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- POLITIQUES POUR LES ADMINISTRATEURS
-- ============================================================================

-- Politique pour permettre aux administrateurs de voir toutes les réservations
CREATE POLICY "Admins can view all reservations" ON reservations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux administrateurs de créer des réservations
CREATE POLICY "Admins can create reservations" ON reservations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux administrateurs de mettre à jour toutes les réservations
CREATE POLICY "Admins can update all reservations" ON reservations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux administrateurs de supprimer toutes les réservations
CREATE POLICY "Admins can delete all reservations" ON reservations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- ============================================================================
-- FONCTION POUR VÉRIFIER LES POLITIQUES
-- ============================================================================

-- Fonction pour vérifier les politiques RLS
CREATE OR REPLACE FUNCTION check_reservations_policies()
RETURNS TABLE (
    policy_name text,
    policy_type text,
    is_enabled boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.policyname::text,
        p.cmd::text,
        p.permissive
    FROM pg_policies p
    WHERE p.tablename = 'reservations'
    ORDER BY p.policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTAIRES ET DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE reservations IS 'Table des réservations avec politiques RLS configurées';
COMMENT ON FUNCTION check_reservations_policies() IS 'Fonction pour vérifier les politiques RLS de la table reservations';

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier que RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'reservations';

-- Lister toutes les politiques créées
SELECT * FROM check_reservations_policies(); 