-- Script pour corriger les permissions de création de businesses
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Vérifier les politiques RLS existantes pour businesses
SELECT '=== POLITIQUES RLS ACTUELLES POUR BUSINESSES ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'businesses'
ORDER BY policyname;

-- 2. Supprimer les politiques existantes qui pourraient bloquer la création
DROP POLICY IF EXISTS "Partners can manage own businesses" ON businesses;
DROP POLICY IF EXISTS "Anyone can view active businesses" ON businesses;
DROP POLICY IF EXISTS "Users can insert businesses" ON businesses;

-- 3. Créer une politique pour permettre aux admins de créer des businesses
CREATE POLICY "Admins can create businesses" ON businesses
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- 4. Créer une politique pour permettre aux admins de voir tous les businesses
CREATE POLICY "Admins can view all businesses" ON businesses
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- 5. Créer une politique pour permettre aux admins de mettre à jour tous les businesses
CREATE POLICY "Admins can update all businesses" ON businesses
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 1
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- 6. Créer une politique pour permettre aux partenaires de gérer leurs propres businesses
CREATE POLICY "Partners can manage own businesses" ON businesses
    FOR ALL
    TO authenticated
    USING (
        owner_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 2
        )
    )
    WITH CHECK (
        owner_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 2
        )
    );

-- 7. Créer une politique pour permettre à tous de voir les businesses actifs
CREATE POLICY "Anyone can view active businesses" ON businesses
    FOR SELECT
    TO authenticated, anon
    USING (is_active = true);

-- 8. Vérifier les nouvelles politiques
SELECT '=== NOUVELLES POLITIQUES CRÉÉES ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'businesses'
ORDER BY policyname;

-- 9. Tester la création d'un business (optionnel)
-- Cette requête simule la création d'un business par un admin
-- SELECT '=== TEST CRÉATION BUSINESS ===' as info;
-- INSERT INTO businesses (
--     name, description, address, phone, email, owner_id, 
--     is_active, is_open, delivery_time, delivery_fee, rating, review_count
-- ) VALUES (
--     'Test Business', 'Test Description', 'Test Address', '+224123456789', 'test@business.com',
--     '00000000-0000-0000-0000-000000000000', -- UUID de test
--     true, true, '30-45 min', 5000, 0, 0
-- );

-- 10. Message de confirmation
SELECT '✅ Permissions de création de businesses configurées avec succès!' as message;
SELECT '📝 Les admins peuvent maintenant créer des businesses pour les partenaires' as info;
SELECT '🔐 Les politiques RLS ont été mises à jour pour la sécurité' as security; 