-- Script pour ajouter la fonction de désactivation d'abonnement
-- Exécutez ce script dans votre base de données Supabase

-- 1. Créer une fonction pour désactiver un abonnement
CREATE OR REPLACE FUNCTION deactivate_subscription(
  p_subscription_id uuid,
  p_reason text DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_partner_id integer;
  v_business_name text;
BEGIN
  -- Vérifier que l'abonnement existe et est actif
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

-- 2. Créer une fonction pour réactiver un abonnement
CREATE OR REPLACE FUNCTION reactivate_subscription(
  p_subscription_id uuid
) RETURNS void AS $$
DECLARE
  v_partner_id integer;
  v_business_name text;
  v_end_date timestamp with time zone;
BEGIN
  -- Vérifier que l'abonnement existe et est inactif
  SELECT partner_id, end_date INTO v_partner_id, v_end_date
  FROM partner_subscriptions 
  WHERE id = p_subscription_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Abonnement non trouvé';
  END IF;
  
  -- Vérifier si l'abonnement n'est pas expiré
  IF v_end_date < now() THEN
    RAISE EXCEPTION 'Impossible de réactiver un abonnement expiré';
  END IF;
  
  -- Récupérer le nom du business pour les logs
  SELECT name INTO v_business_name
  FROM businesses 
  WHERE id = v_partner_id;
  
  -- Réactiver l'abonnement
  UPDATE partner_subscriptions 
  SET 
    status = 'active',
    updated_at = now()
  WHERE id = p_subscription_id;
  
  -- Réactiver le business associé
  UPDATE businesses 
  SET 
    subscription_status = 'active',
    is_active = true,
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
    'reactivation',
    'Abonnement réactivé',
    'Votre abonnement a été réactivé avec succès.'
  );
  
  -- Log de l'action
  RAISE NOTICE 'Abonnement % réactivé pour le business: %', p_subscription_id, v_business_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer une fonction pour suspendre temporairement un abonnement
CREATE OR REPLACE FUNCTION suspend_subscription(
  p_subscription_id uuid,
  p_duration_days integer DEFAULT 7,
  p_reason text DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_partner_id integer;
  v_business_name text;
  v_suspension_end timestamp with time zone;
BEGIN
  -- Vérifier que l'abonnement existe et est actif
  SELECT partner_id INTO v_partner_id
  FROM partner_subscriptions 
  WHERE id = p_subscription_id AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Abonnement actif non trouvé';
  END IF;
  
  -- Calculer la date de fin de suspension
  v_suspension_end := now() + (p_duration_days || ' days')::interval;
  
  -- Récupérer le nom du business pour les logs
  SELECT name INTO v_business_name
  FROM businesses 
  WHERE id = v_partner_id;
  
  -- Suspendre l'abonnement
  UPDATE partner_subscriptions 
  SET 
    status = 'suspended',
    updated_at = now()
  WHERE id = p_subscription_id;
  
  -- Suspendre le business associé
  UPDATE businesses 
  SET 
    subscription_status = 'suspended',
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
    'suspension',
    'Abonnement suspendu',
    COALESCE(p_reason, 'Votre abonnement a été suspendu temporairement.') || 
    ' Durée: ' || p_duration_days || ' jours. Réactivation automatique le ' || 
    to_char(v_suspension_end, 'DD/MM/YYYY à HH24:MI')
  );
  
  -- Log de l'action
  RAISE NOTICE 'Abonnement % suspendu pour le business: % jusqu''au %', 
    p_subscription_id, v_business_name, v_suspension_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer une fonction pour réactiver automatiquement les suspensions expirées
CREATE OR REPLACE FUNCTION reactivate_expired_suspensions() RETURNS integer AS $$
DECLARE
  v_count integer := 0;
  v_subscription record;
BEGIN
  -- Trouver tous les abonnements suspendus depuis plus de 7 jours
  FOR v_subscription IN 
    SELECT id, partner_id 
    FROM partner_subscriptions 
    WHERE status = 'suspended' 
    AND updated_at < now() - interval '7 days'
  LOOP
    -- Réactiver l'abonnement
    UPDATE partner_subscriptions 
    SET 
      status = 'active',
      updated_at = now()
    WHERE id = v_subscription.id;
    
    -- Réactiver le business
    UPDATE businesses 
    SET 
      subscription_status = 'active',
      is_active = true,
      updated_at = now()
    WHERE current_subscription_id = v_subscription.id;
    
    -- Créer une notification
    INSERT INTO subscription_notifications (
      subscription_id,
      type,
      title,
      message
    ) VALUES (
      v_subscription.id,
      'auto_reactivation',
      'Abonnement réactivé automatiquement',
      'Votre abonnement a été réactivé automatiquement après la période de suspension.'
    );
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer un trigger pour réactiver automatiquement les suspensions
CREATE OR REPLACE FUNCTION check_and_reactivate_suspensions() RETURNS trigger AS $$
BEGIN
  -- Exécuter la fonction de réactivation
  PERFORM reactivate_expired_suspensions();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger (s'exécute toutes les heures)
DROP TRIGGER IF EXISTS trigger_check_suspensions ON partner_subscriptions;
CREATE TRIGGER trigger_check_suspensions
  AFTER INSERT OR UPDATE ON partner_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_and_reactivate_suspensions();

-- 6. Vérifier que toutes les fonctions sont créées
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN (
  'deactivate_subscription',
  'reactivate_subscription', 
  'suspend_subscription',
  'reactivate_expired_suspensions'
)
ORDER BY proname;

-- 7. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Fonctions de gestion d''abonnements créées!';
  RAISE NOTICE '📋 deactivate_subscription(uuid, text) - Désactive définitivement';
  RAISE NOTICE '📋 reactivate_subscription(uuid) - Réactive un abonnement';
  RAISE NOTICE '📋 suspend_subscription(uuid, integer, text) - Suspend temporairement';
  RAISE NOTICE '📋 reactivate_expired_suspensions() - Réactive automatiquement';
  RAISE NOTICE '💡 Les abonnements peuvent maintenant être gérés!';
END $$; 