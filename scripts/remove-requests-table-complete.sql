-- Script complet pour supprimer la table requests et toutes ses références
-- ATTENTION: Ce script va supprimer définitivement la table requests

-- 1. Vérifier les données existantes dans requests
DO $$
DECLARE
  v_request_count integer;
BEGIN
  SELECT COUNT(*) INTO v_request_count FROM requests;
  RAISE NOTICE '📊 Nombre de demandes dans la table requests: %', v_request_count;
  
  IF v_request_count > 0 THEN
    RAISE NOTICE '⚠️  ATTENTION: Il y a % demandes dans la table requests', v_request_count;
    RAISE NOTICE '💡 Ces données seront perdues lors de la suppression';
  ELSE
    RAISE NOTICE '✅ Aucune donnée dans la table requests - suppression sûre';
  END IF;
END $$;

-- 2. Supprimer toutes les contraintes de clés étrangères
ALTER TABLE IF EXISTS requests DROP CONSTRAINT IF EXISTS requests_user_id_fkey;
ALTER TABLE IF EXISTS requests DROP CONSTRAINT IF EXISTS requests_reviewed_by_fkey;

-- 3. Supprimer la table requests
DROP TABLE IF EXISTS requests CASCADE;

-- 4. Vérifier que la table est bien supprimée
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'requests') THEN
    RAISE NOTICE '✅ Table requests supprimée avec succès';
  ELSE
    RAISE NOTICE '❌ Erreur: La table requests existe encore';
  END IF;
END $$;

-- 5. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Suppression de la table requests terminée!';
  RAISE NOTICE '📋 Actions effectuées:';
  RAISE NOTICE '  - Contraintes de clés étrangères supprimées';
  RAISE NOTICE '  - Table requests supprimée';
  RAISE NOTICE '⚠️  IMPORTANT: Mettez à jour les services frontend';
END $$; 