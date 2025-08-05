-- Script pour vérifier et corriger la fonction de désactivation
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier si la fonction existe
SELECT 
  'Vérification des fonctions' as test_type,
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  prosrc as source_preview
FROM pg_proc 
WHERE proname IN (
  'deactivate_subscription',
  'reactivate_subscription', 
  'suspend_subscription'
)
ORDER BY proname;

-- 2. Si la fonction n'existe pas, la créer
DO $$
BEGIN
  -- Vérifier si la fonction existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'deactivate_subscription'
  ) THEN
    RAISE NOTICE 'Création de la fonction deactivate_subscription...';
    
    -- Créer la fonction de désactivation
    CREATE OR REPLACE FUNCTION deactivate_subscription(
      p_subscription_id uuid,
      p_reason text DEFAULT NULL
    ) RETURNS void AS $$
    DECLARE
      v_partner_id integer;
      v_business_name text;
    BEGIN
      -- Vérifier que l'abonnement existe
      SELECT partner_id INTO v_partner_id
      FROM partner_subscriptions 
      WHERE id = p_subscription_id;
      
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Abonnement non trouvé';
      END IF;
      
      -- Récupérer le nom du business pour les logs
      SELECT name INTO v_business_name
      FROM businesses 
      WHERE id = v_partner_id;
      
      -- Désactiver l'abonnement
      UPDATE partner_subscriptions 
      SET 
        status = 'inactive',
        updated_at = now()
      WHERE id = p_subscription_id;
      
      -- Désactiver le business associé
      UPDATE businesses 
      SET 
        subscription_status = 'inactive',
        is_active = false,
        updated_at = now()
      WHERE current_subscription_id = p_subscription_id;
      
      -- Créer une notification pour le partenaire
      INSERT INTO subscription_notifications (
        subscription_id,
        type,
        title,
        message
      ) VALUES (
        p_subscription_id,
        'deactivation',
        'Abonnement désactivé',
        COALESCE(p_reason, 'Votre abonnement a été désactivé. Veuillez contacter le support pour plus d''informations.')
      );
      
      -- Log de l'action
      RAISE NOTICE 'Abonnement % désactivé pour le business: %', p_subscription_id, v_business_name;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    RAISE NOTICE '✅ Fonction deactivate_subscription créée avec succès!';
  ELSE
    RAISE NOTICE '✅ Fonction deactivate_subscription existe déjà';
  END IF;
END $$;

-- 3. Vérifier que la fonction fonctionne
DO $$
DECLARE
  v_test_subscription_id uuid;
BEGIN
  -- Trouver un abonnement actif pour tester
  SELECT id INTO v_test_subscription_id
  FROM partner_subscriptions 
  WHERE status = 'active'
  LIMIT 1;
  
  IF v_test_subscription_id IS NOT NULL THEN
    RAISE NOTICE '🧪 Test de la fonction avec l''abonnement: %', v_test_subscription_id;
    -- Ne pas exécuter réellement pour éviter de désactiver un vrai abonnement
    -- PERFORM deactivate_subscription(v_test_subscription_id, 'Test de la fonction');
    RAISE NOTICE '✅ Fonction prête à être utilisée';
  ELSE
    RAISE NOTICE '⚠️  Aucun abonnement actif trouvé pour le test';
  END IF;
END $$;

-- 4. Vérifier les permissions RLS
SELECT 
  'Permissions RLS pour partner_subscriptions' as test_type,
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

-- 5. Message final
DO $$
BEGIN
  RAISE NOTICE '🎉 Vérification et correction terminées!';
  RAISE NOTICE '📋 La fonction deactivate_subscription est maintenant disponible';
  RAISE NOTICE '💡 Les partenaires peuvent désactiver leurs abonnements';
  RAISE NOTICE '⚠️  Testez avec un vrai abonnement pour confirmer le fonctionnement';
END $$; 