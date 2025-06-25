-- ============================================================================
-- SCRIPT POUR DÉSACTIVER LA CONFIRMATION D'EMAIL SUPABASE
-- ============================================================================
-- Ce script configure Supabase pour permettre la connexion sans confirmation d'email

-- ============================================================================
-- CONFIGURATION AUTHENTIFICATION
-- ============================================================================

-- Note: Ces paramètres doivent être configurés dans le dashboard Supabase
-- car ils ne peuvent pas être modifiés via SQL

-- ============================================================================
-- VÉRIFICATION DES UTILISATEURS NON CONFIRMÉS
-- ============================================================================

-- Voir les utilisateurs qui ne sont pas encore confirmés
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
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- ============================================================================
-- CONFIRMATION MANUELLE DES UTILISATEURS (OPTIONNEL)
-- ============================================================================

-- Pour confirmer manuellement un utilisateur spécifique (remplacez l'email)
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'test@example.com';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Script de vérification terminé!';
  RAISE NOTICE 'IMPORTANT: Désactivez la confirmation d''email dans le dashboard Supabase:';
  RAISE NOTICE '1. Allez dans Authentication > Settings';
  RAISE NOTICE '2. Désactivez "Enable email confirmations"';
  RAISE NOTICE '3. Sauvegardez les changements';
  RAISE NOTICE '4. Testez la connexion à nouveau';
END $$; 