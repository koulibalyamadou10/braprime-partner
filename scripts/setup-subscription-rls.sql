-- Script pour configurer les permissions RLS pour les abonnements
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
WHERE tablename IN ('partner_subscriptions', 'subscription_notifications')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. Créer les politiques RLS pour partner_subscriptions
DO $$
BEGIN
  -- Politique pour permettre aux partenaires de voir leurs propres abonnements
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'partner_subscriptions' 
    AND policyname = 'partners_can_view_own_subscriptions'
  ) THEN
    CREATE POLICY "partners_can_view_own_subscriptions" ON partner_subscriptions
    FOR SELECT USING (
      partner_id IN (
        SELECT id FROM businesses 
        WHERE owner_id = auth.uid()
      )
    );
    RAISE NOTICE '✅ Politique partners_can_view_own_subscriptions créée';
  ELSE
    RAISE NOTICE '✅ Politique partners_can_view_own_subscriptions existe déjà';
  END IF;

  -- Politique pour permettre aux partenaires de désactiver leurs propres abonnements
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'partner_subscriptions' 
    AND policyname = 'partners_can_deactivate_own_subscriptions'
  ) THEN
    CREATE POLICY "partners_can_deactivate_own_subscriptions" ON partner_subscriptions
    FOR UPDATE USING (
      partner_id IN (
        SELECT id FROM businesses 
        WHERE owner_id = auth.uid()
      )
    );
    RAISE NOTICE '✅ Politique partners_can_deactivate_own_subscriptions créée';
  ELSE
    RAISE NOTICE '✅ Politique partners_can_deactivate_own_subscriptions existe déjà';
  END IF;

  -- Politique pour permettre aux admins de tout faire
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'partner_subscriptions' 
    AND policyname = 'admins_can_manage_all_subscriptions'
  ) THEN
    CREATE POLICY "admins_can_manage_all_subscriptions" ON partner_subscriptions
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role_id = (SELECT id FROM user_roles WHERE name = 'admin')
      )
    );
    RAISE NOTICE '✅ Politique admins_can_manage_all_subscriptions créée';
  ELSE
    RAISE NOTICE '✅ Politique admins_can_manage_all_subscriptions existe déjà';
  END IF;
END $$;

-- 3. Créer les politiques RLS pour subscription_notifications
DO $$
BEGIN
  -- Politique pour permettre aux partenaires de voir leurs notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_notifications' 
    AND policyname = 'partners_can_view_own_notifications'
  ) THEN
    CREATE POLICY "partners_can_view_own_notifications" ON subscription_notifications
    FOR SELECT USING (
      subscription_id IN (
        SELECT ps.id FROM partner_subscriptions ps
        JOIN businesses b ON ps.partner_id = b.id
        WHERE b.owner_id = auth.uid()
      )
    );
    RAISE NOTICE '✅ Politique partners_can_view_own_notifications créée';
  ELSE
    RAISE NOTICE '✅ Politique partners_can_view_own_notifications existe déjà';
  END IF;

  -- Politique pour permettre aux admins de tout faire
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_notifications' 
    AND policyname = 'admins_can_manage_all_notifications'
  ) THEN
    CREATE POLICY "admins_can_manage_all_notifications" ON subscription_notifications
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role_id = (SELECT id FROM user_roles WHERE name = 'admin')
      )
    );
    RAISE NOTICE '✅ Politique admins_can_manage_all_notifications créée';
  ELSE
    RAISE NOTICE '✅ Politique admins_can_manage_all_notifications existe déjà';
  END IF;
END $$;

-- 4. Vérifier que RLS est activé
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'partner_subscriptions' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE partner_subscriptions ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS activé pour partner_subscriptions';
  ELSE
    RAISE NOTICE '✅ RLS déjà activé pour partner_subscriptions';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'subscription_notifications' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE subscription_notifications ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS activé pour subscription_notifications';
  ELSE
    RAISE NOTICE '✅ RLS déjà activé pour subscription_notifications';
  END IF;
END $$;

-- 5. Vérifier les politiques finales
SELECT 
  'Politiques RLS finales' as test_type,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('partner_subscriptions', 'subscription_notifications')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Configuration RLS terminée!';
  RAISE NOTICE '📋 Les partenaires peuvent maintenant gérer leurs abonnements';
  RAISE NOTICE '📋 Les admins ont accès à tous les abonnements';
  RAISE NOTICE '💡 Testez la désactivation avec un compte partenaire';
END $$; 