-- Script pour activer automatiquement le business après paiement de l'abonnement
-- Ce script crée une fonction qui sera appelée après un paiement réussi

-- 1. Créer la fonction pour activer le business après abonnement
CREATE OR REPLACE FUNCTION activate_business_after_subscription(
  p_subscription_id uuid
)
RETURNS json AS $$
DECLARE
  v_subscription partner_subscriptions%ROWTYPE;
  v_business businesses%ROWTYPE;
  v_updated_businesses integer;
BEGIN
  -- Récupérer l'abonnement
  SELECT * INTO v_subscription 
  FROM partner_subscriptions 
  WHERE id = p_subscription_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Abonnement non trouvé');
  END IF;
  
  -- Vérifier que l'abonnement est actif
  IF v_subscription.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Abonnement non actif');
  END IF;
  
  -- Récupérer le business associé
  SELECT * INTO v_business 
  FROM businesses 
  WHERE id = v_subscription.partner_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Business non trouvé');
  END IF;
  
  -- Activer le business
  UPDATE businesses 
  SET 
    is_active = true,
    subscription_status = 'active',
    updated_at = now()
  WHERE id = v_subscription.partner_id;
  
  GET DIAGNOSTICS v_updated_businesses = ROW_COUNT;
  
  IF v_updated_businesses = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Erreur lors de l''activation du business');
  END IF;
  
  -- Retourner le succès
  RETURN json_build_object(
    'success', true,
    'business_id', v_subscription.partner_id,
    'subscription_id', p_subscription_id,
    'activated_at', now()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- 2. Créer un trigger pour activer automatiquement le business
CREATE OR REPLACE FUNCTION trigger_activate_business()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'abonnement devient actif, activer le business
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    PERFORM activate_business_after_subscription(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer le trigger
DROP TRIGGER IF EXISTS trigger_activate_business_on_subscription ON partner_subscriptions;
CREATE TRIGGER trigger_activate_business_on_subscription
  AFTER UPDATE ON partner_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_activate_business();

-- 4. Créer une fonction pour désactiver le business si l'abonnement expire
CREATE OR REPLACE FUNCTION deactivate_business_on_expiry()
RETURNS void AS $$
DECLARE
  v_expired_subscriptions RECORD;
BEGIN
  -- Trouver les abonnements expirés
  FOR v_expired_subscriptions IN
    SELECT ps.id, ps.partner_id
    FROM partner_subscriptions ps
    WHERE ps.status = 'active' 
    AND ps.end_date < now()
  LOOP
    -- Désactiver le business
    UPDATE businesses 
    SET 
      is_active = false,
      subscription_status = 'expired',
      updated_at = now()
    WHERE id = v_expired_subscriptions.partner_id;
    
    -- Marquer l'abonnement comme expiré
    UPDATE partner_subscriptions 
    SET 
      status = 'expired',
      updated_at = now()
    WHERE id = v_expired_subscriptions.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer une fonction pour vérifier l'état des abonnements (à exécuter périodiquement)
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS json AS $$
DECLARE
  v_active_count integer;
  v_expired_count integer;
  v_pending_count integer;
BEGIN
  -- Compter les abonnements actifs
  SELECT COUNT(*) INTO v_active_count
  FROM partner_subscriptions 
  WHERE status = 'active' AND end_date > now();
  
  -- Compter les abonnements expirés
  SELECT COUNT(*) INTO v_expired_count
  FROM partner_subscriptions 
  WHERE status = 'active' AND end_date < now();
  
  -- Compter les abonnements en attente
  SELECT COUNT(*) INTO v_pending_count
  FROM partner_subscriptions 
  WHERE status = 'pending';
  
  -- Exécuter la désactivation des abonnements expirés
  PERFORM deactivate_business_on_expiry();
  
  RETURN json_build_object(
    'active_subscriptions', v_active_count,
    'expired_subscriptions', v_expired_count,
    'pending_subscriptions', v_pending_count,
    'checked_at', now()
  );
END;
$$ LANGUAGE plpgsql;

-- 6. Vérifier les fonctions créées
SELECT '=== FONCTIONS CRÉÉES ===' as info;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name IN (
  'activate_business_after_subscription',
  'trigger_activate_business',
  'deactivate_business_on_expiry',
  'check_subscription_status'
);

-- 7. Test de la fonction de vérification
SELECT check_subscription_status();

-- 8. Commentaires
COMMENT ON FUNCTION activate_business_after_subscription(uuid) IS 'Active le business après activation d''un abonnement';
COMMENT ON FUNCTION trigger_activate_business() IS 'Trigger pour activer automatiquement le business';
COMMENT ON FUNCTION deactivate_business_on_expiry() IS 'Désactive les businesses avec des abonnements expirés';
COMMENT ON FUNCTION check_subscription_status() IS 'Vérifie et met à jour l''état des abonnements'; 