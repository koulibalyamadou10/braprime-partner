-- ============================================================================
-- SCRIPT POUR CONFIRMER MANUELLEMENT LES UTILISATEURS
-- ============================================================================
-- Ce script confirme tous les utilisateurs non confirmés

-- ============================================================================
-- CONFIRMATION DE TOUS LES UTILISATEURS NON CONFIRMÉS
-- ============================================================================

-- Confirmer tous les utilisateurs qui ne sont pas encore confirmés
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- ============================================================================
-- VÉRIFICATION DES RÉSULTATS
-- ============================================================================

-- Voir le nombre d'utilisateurs confirmés
SELECT 
    COUNT(*) as total_users,
    COUNT(email_confirmed_at) as confirmed_users,
    COUNT(*) - COUNT(email_confirmed_at) as unconfirmed_users
FROM auth.users;

-- Voir tous les utilisateurs avec leur statut
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Non confirmé'
        ELSE '✅ Confirmé'
    END as status
FROM auth.users 
ORDER BY created_at DESC;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

-- Message de confirmation
DO $$
DECLARE
    confirmed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO confirmed_count 
    FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL;
    
    RAISE NOTICE 'Confirmation des utilisateurs terminée!';
    RAISE NOTICE 'Nombre d''utilisateurs confirmés: %', confirmed_count;
    RAISE NOTICE 'Vous pouvez maintenant vous connecter sans problème!';
END $$; 