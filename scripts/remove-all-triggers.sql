-- Script pour supprimer tous les triggers de l'application
-- Exécutez ce script dans votre base de données Supabase

-- 1. Lister tous les triggers existants
SELECT 
  n.nspname as schemaname,
  c.relname as tablename,
  t.tgname as triggername,
  t.tgtype
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY c.relname, t.tgname;

-- 2. Supprimer tous les triggers
DO $$
DECLARE
  trigger_record RECORD;
BEGIN
  FOR trigger_record IN 
    SELECT 
      n.nspname as schema_name,
      c.relname as table_name,
      t.tgname as trigger_name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
  LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE', 
        trigger_record.trigger_name, 
        trigger_record.schema_name, 
        trigger_record.table_name);
      RAISE NOTICE 'Trigger supprimé: %.%.%', 
        trigger_record.schema_name, 
        trigger_record.table_name, 
        trigger_record.trigger_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erreur lors de la suppression du trigger %.%.%: %', 
        trigger_record.schema_name, 
        trigger_record.table_name, 
        trigger_record.trigger_name, 
        SQLERRM;
    END;
  END LOOP;
END $$;

-- 3. Supprimer aussi les fonctions de triggers qui ne sont plus utilisées
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS trigger_update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_user_push_tokens_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_subscription_plans_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_partner_subscriptions_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_subscription_payments_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_subscription_invoices_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_user_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_businesses_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_orders_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_cart_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_requests_updated_at() CASCADE;

-- 4. Vérifier qu'il ne reste plus de triggers
SELECT 
  'Triggers restants:' as status,
  COUNT(*) as count
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public';

-- 5. Vérifier qu'il ne reste plus de fonctions de triggers
SELECT 
  'Fonctions de triggers restantes:' as status,
  COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname LIKE '%updated_at%'
  OR p.proname LIKE '%trigger%';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🧹 Tous les triggers ont été supprimés!';
  RAISE NOTICE '📋 La base de données est maintenant propre';
  RAISE NOTICE '💡 Vous pouvez maintenant recréer les fonctions sans conflits';
END $$; 