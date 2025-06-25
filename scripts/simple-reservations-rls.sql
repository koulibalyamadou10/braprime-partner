-- ============================================================================
-- CONFIGURATION SIMPLE DES POLITIQUES RLS POUR LA TABLE RESERVATIONS
-- ============================================================================

-- Activer RLS sur la table reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUES DE BASE
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
-- POLITIQUE POUR LES PARTENAIRES (SIMPLIFIÉE)
-- ============================================================================

-- Politique pour permettre aux partenaires de voir les réservations de leur commerce
CREATE POLICY "Partners can view business reservations" ON reservations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = reservations.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- Politique pour permettre aux partenaires de mettre à jour les réservations de leur commerce
CREATE POLICY "Partners can update business reservations" ON reservations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = reservations.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Vérifier que RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'reservations';

-- Lister les politiques créées
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'reservations'
ORDER BY policyname; 