-- Script à exécuter dans Supabase SQL Editor
-- Créer la fonction approve_partner_request_simple

-- Fonction pour approuver une demande partenaire (sans créer de compte utilisateur)
CREATE OR REPLACE FUNCTION approve_partner_request_simple(
  p_business_id integer
) RETURNS boolean AS $$
BEGIN
  -- Mettre à jour le business (sans owner_id)
  UPDATE businesses 
  SET 
    request_status = 'approved',
    is_active = true,
    updated_at = now()
  WHERE id = p_business_id;
  
  -- Activer l'abonnement
  UPDATE partner_subscriptions 
  SET 
    status = 'pending',
    updated_at = now()
  WHERE partner_id = p_business_id;
  
  RAISE NOTICE 'Demande partenaire approuvée: Business ID %', p_business_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérifier que la fonction a été créée
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'approve_partner_request_simple') THEN
    RAISE NOTICE '✅ Fonction approve_partner_request_simple créée avec succès';
  ELSE
    RAISE NOTICE '❌ Erreur: Fonction approve_partner_request_simple non créée';
  END IF;
END $$;

-- Test de la fonction (optionnel)
DO $$
DECLARE
  v_test_business_id integer;
BEGIN
  -- Trouver un business en attente pour tester
  SELECT id INTO v_test_business_id
  FROM businesses 
  WHERE request_status = 'pending'
  LIMIT 1;
  
  IF v_test_business_id IS NOT NULL THEN
    RAISE NOTICE '🧪 Fonction prête pour le test avec le business: %', v_test_business_id;
    RAISE NOTICE '💡 Appel: approve_partner_request_simple(%)', v_test_business_id;
  ELSE
    RAISE NOTICE '⚠️  Aucun business en attente trouvé pour le test';
  END IF;
END $$; 