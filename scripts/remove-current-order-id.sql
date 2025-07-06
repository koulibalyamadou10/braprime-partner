-- Script pour supprimer définitivement la colonne current_order_id de la table drivers
-- Cette colonne n'est plus utilisée car les drivers peuvent avoir plusieurs commandes simultanées

-- 1. Vérifier si la colonne existe
SELECT '=== VÉRIFICATION COLONNE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'drivers' AND column_name = 'current_order_id';

-- 2. Supprimer la colonne si elle existe
SELECT '=== SUPPRESSION COLONNE ===' as info;
ALTER TABLE public.drivers DROP COLUMN IF EXISTS current_order_id;

-- 3. Vérifier que la colonne a été supprimée
SELECT '=== VÉRIFICATION SUPPRESSION ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'drivers' AND column_name = 'current_order_id';

-- 4. Vérifier la structure actuelle de la table drivers
SELECT '=== STRUCTURE ACTUELLE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'drivers'
ORDER BY ordinal_position;

-- 5. Message de confirmation
SELECT '✅ Colonne current_order_id supprimée avec succès!' as message;
SELECT 'ℹ️ Les drivers peuvent maintenant gérer plusieurs commandes simultanément' as info; 