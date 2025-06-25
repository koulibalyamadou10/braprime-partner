-- ============================================================================
-- SCRIPT DE CORRECTION AUTHENTIFICATION BRAPRIME
-- ============================================================================
-- Ce script corrige les problèmes d'authentification et configure RLS

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
-- SUPPRESSION DES POLITIQUES EXISTANTES
-- ============================================================================

-- Supprimer les politiques existantes sur user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Supprimer les politiques existantes sur businesses
DROP POLICY IF EXISTS "Anyone can view active businesses" ON businesses;
DROP POLICY IF EXISTS "Partners can manage own businesses" ON businesses;

-- Supprimer les politiques existantes sur orders
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Partners can view business orders" ON orders;

-- Supprimer les politiques existantes sur reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;

-- ============================================================================
-- POLITIQUES RLS POUR USER_PROFILES
-- ============================================================================

-- Activer RLS sur user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre l'insertion de nouveaux profils
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 4
        )
    );

-- ============================================================================
-- POLITIQUES RLS POUR LES AUTRES TABLES
-- ============================================================================

-- Activer RLS sur businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous de voir les commerces actifs
CREATE POLICY "Anyone can view active businesses" ON businesses
    FOR SELECT USING (is_active = true);

-- Politique pour permettre aux partenaires de gérer leurs commerces
CREATE POLICY "Partners can manage own businesses" ON businesses
    FOR ALL USING (
        owner_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 2
        )
    );

-- Activer RLS sur orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux clients de voir leurs commandes
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (user_id = auth.uid());

-- Politique pour permettre aux clients de créer des commandes
CREATE POLICY "Customers can create orders" ON orders
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politique pour permettre aux partenaires de voir les commandes de leurs commerces
CREATE POLICY "Partners can view business orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = orders.business_id AND owner_id = auth.uid()
        )
    );

-- Activer RLS sur reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous de voir les avis
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

-- Politique pour permettre aux utilisateurs de créer des avis
CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- FONCTION POUR CRÉER AUTOMATIQUEMENT LE PROFIL UTILISATEUR
-- ============================================================================

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role_id, phone_number, address, profile_image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'partner' THEN 2
      ELSE 1
    END,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'address',
    COALESCE(
      NEW.raw_user_meta_data->>'profile_image',
      'https://ui-avatars.com/api/?name=' || encode_uri_component(COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur')) || '&background=random'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le profil lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FONCTION POUR SUPPRIMER LE PROFIL LORS DE LA SUPPRESSION DE L'UTILISATEUR
-- ============================================================================

-- Fonction pour supprimer le profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.user_profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour supprimer le profil lors de la suppression de l'utilisateur
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

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
-- FIN DU SCRIPT
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Configuration d''authentification BraPrime terminée!';
  RAISE NOTICE 'RLS activé et politiques configurées.';
  RAISE NOTICE 'Triggers pour création/suppression automatique des profils créés.';
  RAISE NOTICE 'Permissions Supabase configurées.';
END $$; 