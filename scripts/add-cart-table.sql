-- ============================================================================
-- SCRIPT POUR AJOUTER LA TABLE CART (PANIER) À BRAPRIME
-- ============================================================================
-- Ce script ajoute une table pour persister les paniers des utilisateurs
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- TABLE CART (PANIER)
-- ============================================================================

-- Table des paniers utilisateur
CREATE TABLE IF NOT EXISTS cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    business_name VARCHAR(200),
    items JSONB NOT NULL DEFAULT '[]',
    delivery_method VARCHAR(20) DEFAULT 'delivery',
    delivery_address TEXT,
    delivery_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique pour qu'un utilisateur n'ait qu'un seul panier actif
    UNIQUE(user_id)
);

-- ============================================================================
-- TABLE CART_ITEMS (ARTICLES DU PANIER)
-- ============================================================================

-- Table des articles individuels dans le panier
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    image VARCHAR(500),
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Index pour les recherches de panier par utilisateur
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_business ON cart(business_id);

-- Index pour les articles du panier
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_menu_item ON cart_items(menu_item_id);

-- ============================================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ============================================================================

-- Trigger pour mettre à jour updated_at sur cart
CREATE TRIGGER update_cart_updated_at 
    BEFORE UPDATE ON cart 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour mettre à jour updated_at sur cart_items
CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON cart_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Activer RLS sur les tables cart
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Politiques pour cart
CREATE POLICY "Users can view their own cart" ON cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cart" ON cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" ON cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart" ON cart
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour cart_items
CREATE POLICY "Users can view their own cart items" ON cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create items in their own cart" ON cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items in their own cart" ON cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items from their own cart" ON cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour calculer le total du panier
CREATE OR REPLACE FUNCTION calculate_cart_total(cart_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(ci.price * ci.quantity), 0)
    INTO total
    FROM cart_items ci
    WHERE ci.cart_id = cart_uuid;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le nombre d'articles dans le panier
CREATE OR REPLACE FUNCTION get_cart_item_count(cart_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    item_count INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(ci.quantity), 0)
    INTO item_count
    FROM cart_items ci
    WHERE ci.cart_id = cart_uuid;
    
    RETURN item_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vider le panier d'un utilisateur
CREATE OR REPLACE FUNCTION clear_user_cart(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM cart_items 
    WHERE cart_id IN (
        SELECT id FROM cart WHERE user_id = user_uuid
    );
    
    DELETE FROM cart WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VUES UTILES
-- ============================================================================

-- Vue pour afficher le panier avec les détails
CREATE OR REPLACE VIEW cart_details AS
SELECT 
    c.id as cart_id,
    c.user_id,
    c.business_id,
    c.business_name,
    c.delivery_method,
    c.delivery_address,
    c.delivery_instructions,
    c.created_at,
    c.updated_at,
    calculate_cart_total(c.id) as total,
    get_cart_item_count(c.id) as item_count,
    json_agg(
        json_build_object(
            'id', ci.id,
            'menu_item_id', ci.menu_item_id,
            'name', ci.name,
            'price', ci.price,
            'quantity', ci.quantity,
            'image', ci.image,
            'special_instructions', ci.special_instructions,
            'subtotal', ci.price * ci.quantity
        )
    ) as items
FROM cart c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
GROUP BY c.id, c.user_id, c.business_id, c.business_name, c.delivery_method, c.delivery_address, c.delivery_instructions, c.created_at, c.updated_at;

-- ============================================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ============================================================================

-- Insérer des données de test pour un utilisateur (remplacez l'UUID par un vrai user_id)
-- INSERT INTO cart (user_id, business_id, business_name, delivery_method) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 1, 'Restaurant Test', 'delivery');

-- Insérer des articles de test (remplacez l'UUID par un vrai cart_id)
-- INSERT INTO cart_items (cart_id, menu_item_id, name, price, quantity) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 1, 'Pizza Margherita', 15000, 2);

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Table cart créée avec succès!';
    RAISE NOTICE '📋 Tables créées: cart, cart_items';
    RAISE NOTICE '🔒 RLS activé et configuré';
    RAISE NOTICE '📊 Index créés pour les performances';
    RAISE NOTICE '🛠️ Fonctions utilitaires disponibles';
    RAISE NOTICE '👁️ Vue cart_details créée';
END $$; 