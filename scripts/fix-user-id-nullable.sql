-- Script pour corriger la contrainte NOT NULL sur user_id
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Vérifier la contrainte actuelle
SELECT '=== VÉRIFICATION CONTRAINTE ACTUELLE ===' as info;
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'requests' 
AND column_name = 'user_id';

-- 2. Supprimer la contrainte NOT NULL
ALTER TABLE requests 
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Vérifier que la modification a été appliquée
SELECT '=== CONTRAINTE APRÈS MODIFICATION ===' as info;
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'requests' 
AND column_name = 'user_id';

-- 4. Mettre à jour la contrainte de clé étrangère pour permettre NULL
ALTER TABLE requests 
DROP CONSTRAINT IF EXISTS requests_user_id_fkey;

ALTER TABLE requests 
ADD CONSTRAINT requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) 
ON DELETE SET NULL;

-- 5. Vérifier les contraintes
SELECT '=== CONTRAINTES FINALES ===' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
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

-- 6. Message de confirmation
SELECT '✅ Contrainte NOT NULL supprimée avec succès!' as message;
SELECT '📝 user_id peut maintenant être NULL pour les demandes anonymes' as info; 