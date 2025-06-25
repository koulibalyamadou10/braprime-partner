-- ============================================================================
-- SCRIPT DE CONFIGURATION POUR LA CRÉATION DE COMPTES PARTENAIRES
-- ============================================================================
-- Ce script configure les données nécessaires pour la création de comptes partenaires

-- ============================================================================
-- VÉRIFICATION ET CONFIGURATION DES RÔLES
-- ============================================================================

-- Vérifier que le rôle 'partner' existe
INSERT INTO user_roles (id, name, description) VALUES
(2, 'partner', 'Partenaire - Peut gérer un commerce et ses commandes')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================================================
-- CONFIGURATION DES TYPES DE BUSINESS
-- ============================================================================

-- Supprimer les types existants pour éviter les doublons
DELETE FROM business_types WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8);

-- Insérer les types de business
INSERT INTO business_types (id, name, icon, color, description, features) VALUES
(1, 'Restaurant', '🍽️', '#FF6B6B', 'Restaurants et établissements de restauration', '["menu_management", "delivery", "reservations", "analytics"]'),
(2, 'Café', '☕', '#4ECDC4', 'Cafés et établissements de boissons', '["menu_management", "delivery", "analytics"]'),
(3, 'Marché', '🛒', '#45B7D1', 'Marchés et épiceries locales', '["inventory_management", "delivery", "analytics"]'),
(4, 'Supermarché', '🏪', '#96CEB4', 'Supermarchés et grandes surfaces', '["inventory_management", "delivery", "analytics", "loyalty_program"]'),
(5, 'Pharmacie', '💊', '#FFEAA7', 'Pharmacies et parapharmacies', '["inventory_management", "delivery", "prescription_management"]'),
(6, 'Électronique', '📱', '#DDA0DD', 'Magasins d\'électronique et technologie', '["inventory_management", "delivery", "warranty_management"]'),
(7, 'Beauté', '💄', '#FFB6C1', 'Salons de beauté et cosmétiques', '["appointment_booking", "delivery", "loyalty_program"]'),
(8, 'Autre', '🏢', '#A8E6CF', 'Autres types de commerces', '["basic_management", "delivery"]');

-- ============================================================================
-- CONFIGURATION DES CATÉGORIES DE MENU PAR DÉFAUT
-- ============================================================================

-- Créer une fonction pour créer les catégories par défaut
CREATE OR REPLACE FUNCTION create_default_menu_categories(business_id INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Supprimer les catégories existantes pour ce business
  DELETE FROM menu_categories WHERE business_id = create_default_menu_categories.business_id;
  
  -- Insérer les catégories par défaut
  INSERT INTO menu_categories (name, description, business_id, is_active, sort_order) VALUES
  ('Entrées', 'Entrées et apéritifs', business_id, true, 1),
  ('Plats principaux', 'Plats principaux', business_id, true, 2),
  ('Desserts', 'Desserts et pâtisseries', business_id, true, 3),
  ('Boissons', 'Boissons et rafraîchissements', business_id, true, 4);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CONFIGURATION DES POLITIQUES RLS POUR LES PARTENAIRES
-- ============================================================================

-- Activer RLS sur les tables nécessaires
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Partners can manage own businesses" ON businesses;
DROP POLICY IF EXISTS "Anyone can view active businesses" ON businesses;

-- Politiques pour user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour businesses
CREATE POLICY "Anyone can view active businesses" ON businesses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own businesses" ON businesses
    FOR ALL USING (
        owner_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role_id = 2
        )
    );

-- Politiques pour menu_categories
CREATE POLICY "Anyone can view menu categories" ON menu_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own menu categories" ON menu_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = menu_categories.business_id AND owner_id = auth.uid()
        )
    );

-- Politiques pour menu_items
CREATE POLICY "Anyone can view menu items" ON menu_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own menu items" ON menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = menu_items.business_id AND owner_id = auth.uid()
        )
    );

-- ============================================================================
-- FONCTION POUR CRÉER UN COMPTE PARTENAIRE COMPLET
-- ============================================================================

CREATE OR REPLACE FUNCTION create_partner_account(
    p_owner_name TEXT,
    p_owner_email TEXT,
    p_owner_phone TEXT,
    p_business_name TEXT,
    p_business_type_id INTEGER,
    p_business_address TEXT,
    p_business_phone TEXT,
    p_business_email TEXT,
    p_business_description TEXT,
    p_opening_hours TEXT,
    p_cuisine_type TEXT DEFAULT NULL,
    p_delivery_radius INTEGER DEFAULT 5
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_business_id INTEGER;
    v_result JSON;
BEGIN
    -- Vérifier que l'utilisateur existe dans auth.users
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = p_owner_email 
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Utilisateur non trouvé dans auth.users'
        );
    END IF;
    
    -- Créer le profil utilisateur avec le rôle partner
    INSERT INTO user_profiles (id, name, email, role_id, phone_number, is_active)
    VALUES (v_user_id, p_owner_name, p_owner_email, 2, p_owner_phone, true)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role_id = EXCLUDED.role_id,
        phone_number = EXCLUDED.phone_number,
        is_active = EXCLUDED.is_active;
    
    -- Créer le business
    INSERT INTO businesses (
        name, description, business_type_id, address, phone, email,
        opening_hours, cuisine_type, owner_id, is_active, is_open
    )
    VALUES (
        p_business_name, p_business_description, p_business_type_id,
        p_business_address, p_business_phone, p_business_email,
        p_opening_hours, p_cuisine_type, v_user_id, true, true
    )
    RETURNING id INTO v_business_id;
    
    -- Créer les catégories de menu par défaut si c'est un restaurant
    IF p_business_type_id = 1 THEN
        PERFORM create_default_menu_categories(v_business_id);
    END IF;
    
    -- Retourner le résultat
    v_result := json_build_object(
        'success', true,
        'user_id', v_user_id,
        'business_id', v_business_id,
        'message', 'Compte partenaire créé avec succès'
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DONNÉES DE TEST POUR LES TYPES DE BUSINESS
-- ============================================================================

-- Insérer quelques exemples de commerces de test
INSERT INTO businesses (name, description, business_type_id, address, phone, email, opening_hours, owner_id, is_active, is_open) VALUES
('Restaurant Le Gourmet', 'Restaurant gastronomique spécialisé dans la cuisine française', 1, '123 Rue de la Paix, Conakry', '+224 1 23 45 67 89', 'contact@legourmet.gn', 'Lun-Dim: 12h-23h', NULL, true, true),
('Café Central', 'Café moderne avec wifi et espace de travail', 2, '456 Avenue de la République, Conakry', '+224 1 98 76 54 32', 'info@cafecentral.gn', 'Lun-Sam: 7h-22h', NULL, true, true),
('Market Fresh', 'Épicerie fine avec produits locaux et importés', 3, '789 Boulevard du Commerce, Conakry', '+224 1 11 22 33 44', 'hello@marketfresh.gn', 'Lun-Sam: 8h-20h', NULL, true, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CONFIGURATION DES PERMISSIONS
-- ============================================================================

-- Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.businesses TO anon, authenticated;
GRANT ALL ON public.business_types TO anon, authenticated;
GRANT ALL ON public.menu_categories TO anon, authenticated;
GRANT ALL ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.user_roles TO anon, authenticated;

-- Permissions pour les séquences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Configuration des comptes partenaires terminée !';
    RAISE NOTICE 'Types de business créés: %', (SELECT COUNT(*) FROM business_types);
    RAISE NOTICE 'Rôle partenaire configuré: %', (SELECT name FROM user_roles WHERE id = 2);
    RAISE NOTICE 'Fonction create_partner_account créée';
    RAISE NOTICE 'Politiques RLS configurées pour les partenaires';
END $$; 