-- Script pour vérifier la signature exacte de la fonction deactivate_subscription
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier si la fonction existe et sa signature
SELECT 
  'Signature de la fonction' as test_type,
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  prosrc as source_code
FROM pg_proc 
WHERE proname = 'deactivate_subscription';

-- 2. Vérifier toutes les fonctions avec des noms similaires
SELECT 
  'Fonctions similaires' as test_type,
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname LIKE '%deactivate%' OR proname LIKE '%subscription%'
ORDER BY proname;

-- 3. Créer la fonction avec la signature correcte
DO $$
BEGIN
  -- Supprimer toutes les versions existantes
  DROP FUNCTION IF EXISTS deactivate_subscription(uuid, text);
  DROP FUNCTION IF EXISTS deactivate_subscription(text, uuid);
  DROP FUNCTION IF EXISTS deactivate_subscription(uuid);
  
  RAISE NOTICE 'Création de la fonction avec la signature correcte...';
  
  -- Créer la fonction avec la signature correcte
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
END $$;

-- 4. Vérifier la signature finale
SELECT 
  'Signature finale' as test_type,
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'deactivate_subscription';

-- 5. Test de la fonction (commenté pour éviter de désactiver un vrai abonnement)
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
    RAISE NOTICE '🧪 Fonction prête pour le test avec l''abonnement: %', v_test_subscription_id;
    RAISE NOTICE '📋 Signature attendue: deactivate_subscription(uuid, text)';
    RAISE NOTICE '💡 Appel correct: deactivate_subscription(''%'', ''raison'')', v_test_subscription_id;
  ELSE
    RAISE NOTICE '⚠️  Aucun abonnement actif trouvé pour le test';
  END IF;
END $$;

-- 6. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Vérification de signature terminée!';
  RAISE NOTICE '📋 Signature correcte: deactivate_subscription(uuid, text)';
  RAISE NOTICE '💡 L''ordre des paramètres est important: (subscription_id, reason)';
  RAISE NOTICE '⚠️  Vérifiez que l''appel frontend respecte cet ordre';
END $$; 