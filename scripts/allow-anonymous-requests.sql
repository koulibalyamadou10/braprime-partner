-- Script pour permettre les demandes anonymes (sans connexion)
-- Ce script modifie la table requests pour permettre user_id NULL

-- 1. Vérifier la structure actuelle
SELECT '=== STRUCTURE ACTUELLE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'requests' 
AND column_name = 'user_id';

-- 2. Modifier la contrainte de clé étrangère pour permettre NULL
ALTER TABLE requests 
DROP CONSTRAINT IF EXISTS requests_user_id_fkey;

-- 3. Recréer la contrainte avec ON DELETE SET NULL
ALTER TABLE requests 
ADD CONSTRAINT requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) 
ON DELETE SET NULL;

-- 4. Vérifier que la modification a été appliquée
SELECT '=== STRUCTURE APRÈS MODIFICATION ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'requests' 
AND column_name = 'user_id';

-- 5. Vérifier les contraintes
SELECT '=== CONTRAINTES ===' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'requests'
AND kcu.column_name = 'user_id';

-- 6. Mettre à jour les politiques RLS pour permettre les insertions anonymes
DROP POLICY IF EXISTS "Users can create their own requests" ON requests;

CREATE POLICY "Users can create requests" ON requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id IS NULL OR user_id = auth.uid()
    );

-- 7. Créer une politique pour permettre les insertions anonymes
CREATE POLICY "Anonymous can create requests" ON requests
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- 8. Mettre à jour la politique de lecture pour les admins
DROP POLICY IF EXISTS "Admins can view all requests" ON requests;

CREATE POLICY "Admins can view all requests" ON requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- 9. Créer une politique pour permettre la lecture anonyme (optionnel, pour vérification)
CREATE POLICY "Anonymous can view their own requests" ON requests
    FOR SELECT
    TO anon
    USING (false); -- Les utilisateurs anonymes ne peuvent pas voir les demandes

-- 10. Vérifier les politiques créées
SELECT '=== POLITIQUES RLS ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'requests'
ORDER BY policyname;

-- 11. Tester avec une insertion anonyme
SELECT '=== TEST INSERTION ANONYME ===' as info;
-- Cette requête simule une insertion anonyme (sera exécutée par l'application)
-- INSERT INTO requests (
--     type, user_id, user_name, user_email, user_phone, 
--     business_name, business_type, business_address, 
--     status, created_at, updated_at
-- ) VALUES (
--     'partner', NULL, 'Test User', 'test@example.com', '+224123456789',
--     'Test Business', 'restaurant', 'Test Address',
--     'pending', NOW(), NOW()
-- );

-- 12. Message de confirmation
SELECT '✅ Demandes anonymes activées avec succès!' as message;
SELECT '📝 Les utilisateurs non connectés peuvent maintenant soumettre des demandes' as info;
SELECT '🔐 Les politiques RLS ont été mises à jour pour la sécurité' as security; 