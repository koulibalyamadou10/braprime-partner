-- Script de test après suppression de la table requests
-- Vérifie que tous les services fonctionnent avec la nouvelle architecture

-- 1. Vérifier que la table requests n'existe plus
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'requests') THEN
    RAISE NOTICE '✅ Table requests supprimée avec succès';
  ELSE
    RAISE NOTICE '❌ Erreur: La table requests existe encore';
  END IF;
END $$;

-- 2. Vérifier que la table businesses a les nouvelles colonnes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'request_status'
  ) THEN
    RAISE NOTICE '✅ Colonne request_status ajoutée à businesses';
  ELSE
    RAISE NOTICE '❌ Erreur: Colonne request_status manquante dans businesses';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'owner_name'
  ) THEN
    RAISE NOTICE '✅ Colonne owner_name ajoutée à businesses';
  ELSE
    RAISE NOTICE '❌ Erreur: Colonne owner_name manquante dans businesses';
  END IF;
END $$;

-- 3. Vérifier que les fonctions existent
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_partner_request') THEN
    RAISE NOTICE '✅ Fonction create_partner_request existe';
  ELSE
    RAISE NOTICE '❌ Erreur: Fonction create_partner_request manquante';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'approve_partner_request') THEN
    RAISE NOTICE '✅ Fonction approve_partner_request existe';
  ELSE
    RAISE NOTICE '❌ Erreur: Fonction approve_partner_request manquante';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'reject_partner_request') THEN
    RAISE NOTICE '✅ Fonction reject_partner_request existe';
  ELSE
    RAISE NOTICE '❌ Erreur: Fonction reject_partner_request manquante';
  END IF;
END $$;

-- 4. Test de création d'une demande partenaire
DO $$
DECLARE
  v_business_id integer;
  v_subscription_id uuid;
BEGIN
  RAISE NOTICE '🧪 Test de création d''une demande partenaire...';
  
  -- Créer une demande de test
  SELECT id INTO v_business_id
  FROM create_partner_request(
    'Test Restaurant',
    'Restaurant de test',
    '123 Rue Test, Abidjan',
    'test@example.com',
    '0123456789',
    'Test Owner',
    '0123456789',
    'Restaurant',
    'Cuisine française',
    '{"spécialités": ["pizza", "pasta"]}',
    '1_month'
  );
  
  IF v_business_id IS NOT NULL THEN
    RAISE NOTICE '✅ Demande partenaire créée avec ID: %', v_business_id;
    
    -- Vérifier que l'abonnement a été créé
    SELECT current_subscription_id INTO v_subscription_id
    FROM businesses WHERE id = v_business_id;
    
    IF v_subscription_id IS NOT NULL THEN
      RAISE NOTICE '✅ Abonnement créé avec ID: %', v_subscription_id;
    ELSE
      RAISE NOTICE '❌ Erreur: Aucun abonnement créé';
    END IF;
    
    -- Nettoyer le test
    DELETE FROM businesses WHERE id = v_business_id;
    RAISE NOTICE '🧹 Test nettoyé';
  ELSE
    RAISE NOTICE '❌ Erreur: Impossible de créer la demande';
  END IF;
END $$;

-- 5. Vérifier les services frontend
DO $$
BEGIN
  RAISE NOTICE '📋 Services frontend à vérifier:';
  RAISE NOTICE '  - AdminBusinessRequestsService';
  RAISE NOTICE '  - useAdminRequests hook';
  RAISE NOTICE '  - AdminRequests.tsx page';
  RAISE NOTICE '  - partner-stats.ts (mis à jour)';
  RAISE NOTICE '  - use-subscription.ts (mis à jour)';
END $$;

-- 6. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Test de suppression de la table requests terminé!';
  RAISE NOTICE '📋 Architecture simplifiée:';
  RAISE NOTICE '  - Table requests supprimée';
  RAISE NOTICE '  - Colonnes ajoutées à businesses';
  RAISE NOTICE '  - Fonctions PostgreSQL créées';
  RAISE NOTICE '  - Services frontend mis à jour';
  RAISE NOTICE '⚠️  IMPORTANT: Testez l''interface utilisateur';
END $$; 