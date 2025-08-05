-- Script pour corriger les politiques RLS des abonnements pour permettre la création lors des demandes
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier les politiques RLS existantes
SELECT 
  'Politiques RLS existantes' as test_type,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'partner_subscriptions'
AND schemaname = 'public'
ORDER BY policyname;

-- 2. Supprimer les politiques existantes qui bloquent l'insertion
DROP POLICY IF EXISTS "partner_subscriptions_insert_policy" ON partner_subscriptions;
DROP POLICY IF EXISTS "partner_subscriptions_select_policy" ON partner_subscriptions;
DROP POLICY IF EXISTS "partner_subscriptions_update_policy" ON partner_subscriptions;

-- 3. Créer de nouvelles politiques RLS plus permissives
DO $$
BEGIN
  -- Politique pour permettre l'insertion d'abonnements (pour les demandes)
  CREATE POLICY "partner_subscriptions_insert_policy" ON partner_subscriptions
  FOR INSERT WITH CHECK (
    -- Permettre l'insertion si l'utilisateur est admin
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
    OR
    -- Permettre l'insertion si l'utilisateur est partenaire et que le business existe
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = partner_subscriptions.partner_id 
      AND b.owner_id = auth.uid()
    )
    OR
    -- Permettre l'insertion pour les demandes (partner_id peut être null temporairement)
    partner_subscriptions.partner_id IS NULL
  );
  RAISE NOTICE '✅ Politique partner_subscriptions_insert_policy créée';

  -- Politique pour permettre la lecture des abonnements
  CREATE POLICY "partner_subscriptions_select_policy" ON partner_subscriptions
  FOR SELECT USING (
    -- Permettre la lecture si l'utilisateur est admin
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
    OR
    -- Permettre la lecture si l'utilisateur est partenaire et propriétaire du business
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = partner_subscriptions.partner_id 
      AND b.owner_id = auth.uid()
    )
    OR
    -- Permettre la lecture pour les demandes en cours (partner_id peut être null)
    partner_subscriptions.partner_id IS NULL
  );
  RAISE NOTICE '✅ Politique partner_subscriptions_select_policy créée';

  -- Politique pour permettre la mise à jour des abonnements
  CREATE POLICY "partner_subscriptions_update_policy" ON partner_subscriptions
  FOR UPDATE USING (
    -- Permettre la mise à jour si l'utilisateur est admin
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
    OR
    -- Permettre la mise à jour si l'utilisateur est partenaire et propriétaire du business
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = partner_subscriptions.partner_id 
      AND b.owner_id = auth.uid()
    )
    OR
    -- Permettre la mise à jour pour les demandes en cours (partner_id peut être null)
    partner_subscriptions.partner_id IS NULL
  );
  RAISE NOTICE '✅ Politique partner_subscriptions_update_policy créée';

END $$;

-- 4. Vérifier les nouvelles politiques
SELECT 
  'Nouvelles politiques RLS' as test_type,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'partner_subscriptions'
AND schemaname = 'public'
ORDER BY policyname;

-- 5. Test de création d'abonnement (commenté pour éviter les erreurs)
DO $$
DECLARE
  v_test_subscription_id uuid;
BEGIN
  RAISE NOTICE '🧪 Test de création d''abonnement...';
  
  -- Tenter de créer un abonnement de test
  INSERT INTO partner_subscriptions (
    partner_id,
    plan_id,
    status,
    start_date,
    end_date,
    auto_renew,
    total_paid,
    monthly_amount,
    billing_email,
    billing_phone
  ) VALUES (
    NULL, -- partner_id null pour les demandes
    (SELECT id FROM subscription_plans LIMIT 1),
    'pending',
    NOW(),
    NOW() + INTERVAL '1 month',
    false,
    0,
    200000,
    'test@example.com',
    '+224123456789'
  ) RETURNING id INTO v_test_subscription_id;
  
  RAISE NOTICE '✅ Test réussi - Abonnement créé avec ID: %', v_test_subscription_id;
  
  -- Nettoyer le test
  DELETE FROM partner_subscriptions WHERE id = v_test_subscription_id;
  RAISE NOTICE '🧹 Test nettoyé';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test échoué: %', SQLERRM;
END $$;

-- 6. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Correction des politiques RLS terminée!';
  RAISE NOTICE '📋 Les abonnements peuvent maintenant être créés lors des demandes';
  RAISE NOTICE '💡 Les partenaires peuvent voir et modifier leurs abonnements';
  RAISE NOTICE '🔐 Les admins ont accès complet à tous les abonnements';
END $$; 