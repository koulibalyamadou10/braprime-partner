-- Script pour corriger la liaison des abonnements après approbation
-- Cette fonction garantit que le partner_id est correctement mis à jour

-- 1. Créer une fonction robuste pour lier les abonnements
CREATE OR REPLACE FUNCTION link_subscription_after_approval(
  p_request_id uuid,
  p_business_id integer
) RETURNS boolean AS $$
DECLARE
  v_subscription_id uuid;
  v_user_email text;
  v_request_record record;
BEGIN
  -- Récupérer les informations de la demande
  SELECT metadata, user_email INTO v_request_record
  FROM requests 
  WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande non trouvée: %', p_request_id;
  END IF;
  
  -- Extraire l'ID de l'abonnement et l'email
  v_subscription_id := v_request_record.metadata->>'subscription_id';
  v_user_email := v_request_record.user_email;
  
  IF v_subscription_id IS NULL THEN
    RAISE EXCEPTION 'Aucun abonnement trouvé dans les métadonnées de la demande';
  END IF;
  
  -- Vérifier que l'abonnement existe et a partner_id = NULL
  IF NOT EXISTS (
    SELECT 1 FROM partner_subscriptions 
    WHERE id = v_subscription_id::uuid AND partner_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Abonnement non trouvé ou déjà lié: %', v_subscription_id;
  END IF;
  
  -- Mettre à jour l'abonnement avec le business_id
  UPDATE partner_subscriptions 
  SET 
    partner_id = p_business_id,
    updated_at = now()
  WHERE id = v_subscription_id::uuid;
  
  -- Mettre à jour le business avec l'ID de l'abonnement
  UPDATE businesses 
  SET 
    current_subscription_id = v_subscription_id::uuid,
    subscription_status = 'pending',
    updated_at = now()
  WHERE id = p_business_id;
  
  -- Log de l'action
  RAISE NOTICE '✅ Abonnement % lié au business % avec succès', v_subscription_id, p_business_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer une fonction pour vérifier l'état des abonnements
CREATE OR REPLACE FUNCTION check_subscription_status() RETURNS TABLE (
  subscription_id uuid,
  partner_id integer,
  status subscription_status,
  billing_email text,
  business_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.partner_id,
    ps.status,
    ps.billing_email,
    b.name as business_name
  FROM partner_subscriptions ps
  LEFT JOIN businesses b ON b.id = ps.partner_id
  ORDER BY ps.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer une fonction pour nettoyer les abonnements orphelins
CREATE OR REPLACE FUNCTION cleanup_orphaned_subscriptions() RETURNS integer AS $$
DECLARE
  v_count integer := 0;
BEGIN
  -- Compter les abonnements avec partner_id NULL
  SELECT COUNT(*) INTO v_count
  FROM partner_subscriptions 
  WHERE partner_id IS NULL;
  
  RAISE NOTICE '📊 Abonnements avec partner_id NULL: %', v_count;
  
  -- Afficher les détails
  RAISE NOTICE '📋 Détails des abonnements orphelins:';
  FOR v_subscription IN 
    SELECT id, billing_email, created_at, status
    FROM partner_subscriptions 
    WHERE partner_id IS NULL
    ORDER BY created_at DESC
  LOOP
    RAISE NOTICE '  - ID: %, Email: %, Créé: %, Statut: %', 
      v_subscription.id, 
      v_subscription.billing_email, 
      v_subscription.created_at, 
      v_subscription.status;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Test de la fonction de liaison
DO $$
DECLARE
  v_test_request_id uuid;
  v_test_business_id integer;
  v_result boolean;
BEGIN
  -- Trouver une demande partenaire récente avec abonnement
  SELECT id INTO v_test_request_id
  FROM requests 
  WHERE type = 'partner' 
    AND status = 'pending'
    AND metadata->>'subscription_id' IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_test_request_id IS NOT NULL THEN
    RAISE NOTICE '🧪 Test avec la demande: %', v_test_request_id;
    
    -- Créer un business de test
    INSERT INTO businesses (name, business_type_id, address, owner_id, is_active, requires_subscription, subscription_status)
    VALUES ('Business Test', 1, 'Adresse Test', '00000000-0000-0000-0000-000000000000', false, true, 'pending')
    RETURNING id INTO v_test_business_id;
    
    -- Tester la liaison
    SELECT link_subscription_after_approval(v_test_request_id, v_test_business_id) INTO v_result;
    
    RAISE NOTICE '✅ Test de liaison: %', v_result;
    
    -- Nettoyer le test
    DELETE FROM businesses WHERE id = v_test_business_id;
  ELSE
    RAISE NOTICE '⚠️  Aucune demande de test trouvée';
  END IF;
END $$;

-- 5. Afficher l'état actuel
SELECT 'État actuel des abonnements' as info;
SELECT * FROM check_subscription_status();

-- 6. Nettoyer les abonnements orphelins
SELECT cleanup_orphaned_subscriptions() as orphelins_count;

-- 7. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Script de correction terminé!';
  RAISE NOTICE '📋 Fonctions créées:';
  RAISE NOTICE '  - link_subscription_after_approval()';
  RAISE NOTICE '  - check_subscription_status()';
  RAISE NOTICE '  - cleanup_orphaned_subscriptions()';
  RAISE NOTICE '💡 Utilisez ces fonctions dans le service admin-requests.ts';
END $$; 