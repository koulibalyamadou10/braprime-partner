-- ========================================
-- SCRIPT DE TEST POUR LES ABONNEMENTS
-- ========================================
-- Ce script désactive temporairement RLS pour permettre les tests
-- À utiliser uniquement en développement

-- Désactiver RLS temporairement pour les tests
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE partner_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_notifications DISABLE ROW LEVEL SECURITY;

-- Ou créer des politiques très permissives pour les tests
-- DROP POLICY IF EXISTS "subscription_plans_select_policy" ON subscription_plans;
-- CREATE POLICY "subscription_plans_select_policy" ON subscription_plans
--     FOR ALL USING (true);

-- DROP POLICY IF EXISTS "partner_subscriptions_select_policy" ON partner_subscriptions;
-- DROP POLICY IF EXISTS "partner_subscriptions_insert_policy" ON partner_subscriptions;
-- DROP POLICY IF EXISTS "partner_subscriptions_update_policy" ON partner_subscriptions;

-- CREATE POLICY "partner_subscriptions_all_policy" ON partner_subscriptions
--     FOR ALL USING (true);

-- DROP POLICY IF EXISTS "subscription_payments_select_policy" ON subscription_payments;
-- CREATE POLICY "subscription_payments_all_policy" ON subscription_payments
--     FOR ALL USING (true);

-- DROP POLICY IF EXISTS "subscription_invoices_select_policy" ON subscription_invoices;
-- CREATE POLICY "subscription_invoices_all_policy" ON subscription_invoices
--     FOR ALL USING (true);

-- DROP POLICY IF EXISTS "subscription_notifications_select_policy" ON subscription_notifications;
-- CREATE POLICY "subscription_notifications_all_policy" ON subscription_notifications
--     FOR ALL USING (true);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'RLS désactivé pour les tests d''abonnement';
    RAISE NOTICE 'Vous pouvez maintenant tester la création d''abonnements';
    RAISE NOTICE 'N''oubliez pas de réactiver RLS en production!';
END $$; 