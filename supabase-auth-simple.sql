-- ============================================================================
-- SCRIPT SIMPLIFIÉ POUR AUTHENTIFICATION BRAPRIME
-- ============================================================================
-- Ce script configure l'authentification de manière simple sans RLS complexe

-- ============================================================================
-- DONNÉES INITIALES POUR LES RÔLES
-- ============================================================================

-- Insérer les rôles utilisateur de base
INSERT INTO user_roles (id, name, description) VALUES
(1, 'customer', 'Client - Peut passer des commandes et faire des réservations'),
(2, 'partner', 'Partenaire - Peut gérer un commerce et ses commandes'),
(3, 'driver', 'Livreur - Peut livrer des commandes'),
(4, 'admin', 'Administrateur - Accès complet à la plateforme')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CONFIGURATION SIMPLIFIÉE RLS
-- ============================================================================

-- Désactiver RLS temporairement sur user_profiles pour permettre l'inscription
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS temporairement sur businesses
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS temporairement sur orders
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS temporairement sur reviews
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CONFIGURATION DES PERMISSIONS SUPABASE
-- ============================================================================

-- Donner les permissions nécessaires à l'utilisateur anon
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.user_profiles TO anon;
GRANT ALL ON public.user_roles TO anon;
GRANT ALL ON public.businesses TO anon;
GRANT ALL ON public.orders TO anon;
GRANT ALL ON public.reviews TO anon;
GRANT ALL ON public.menu_items TO anon;
GRANT ALL ON public.menu_categories TO anon;

-- Donner les permissions nécessaires à l'utilisateur authenticated
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.businesses TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_categories TO authenticated;

-- ============================================================================
-- SUPPRESSION DES TRIGGERS PROBLÉMATIQUES
-- ============================================================================

-- Supprimer les triggers qui peuvent causer des problèmes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Supprimer les fonctions de trigger
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_deletion();

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Configuration simplifiée BraPrime terminée!';
  RAISE NOTICE 'RLS désactivé temporairement pour permettre l''inscription.';
  RAISE NOTICE 'Triggers supprimés pour éviter les conflits.';
  RAISE NOTICE 'Permissions Supabase configurées.';
  RAISE NOTICE 'L''inscription devrait maintenant fonctionner!';
END $$; 