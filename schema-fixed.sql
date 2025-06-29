-- =========================================================================
-- SCHÉMA SQL STRUCTUREL UNIQUEMENT (SANS DONNÉES DE TEST)
-- =========================================================================

-- (1) Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- (2) Tables de base (sans dépendance)
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]',
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    link VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservation_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (3) Tables qui dépendent des précédentes
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id INTEGER REFERENCES user_roles(id) DEFAULT 1,
    phone_number VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    business_type_id INTEGER REFERENCES business_types(id),
    category_id INTEGER REFERENCES categories(id),
    cover_image VARCHAR(500),
    logo VARCHAR(500),
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    delivery_time VARCHAR(50) DEFAULT '30-45 min',
    delivery_fee INTEGER DEFAULT 5000,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    opening_hours VARCHAR(100),
    cuisine_type VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    is_open BOOLEAN DEFAULT true,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    delivery_fee INTEGER NOT NULL DEFAULT 5000,
    delivery_time VARCHAR(50) NOT NULL DEFAULT '30-45 min',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Guinée',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (4) Tables qui dépendent de businesses
CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image VARCHAR(500),
    category_id INTEGER REFERENCES menu_categories(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    is_popular BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    allergens JSONB DEFAULT '[]',
    nutritional_info JSONB DEFAULT '{}',
    preparation_time INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    current_location JSONB,
    current_order_id UUID,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_deliveries INTEGER DEFAULT 0,
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    total_earnings DECIMAL(10,2) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (5) Tables qui dépendent de businesses, user_profiles, menu_items, drivers
CREATE TABLE IF NOT EXISTS favorite_businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

CREATE TABLE IF NOT EXISTS favorite_menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, menu_item_id)
);

CREATE TABLE IF NOT EXISTS driver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_profile_id, driver_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_id INTEGER REFERENCES businesses(id) ON DELETE SET NULL,
    business_name VARCHAR(200) NOT NULL,
    items JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total INTEGER NOT NULL,
    delivery_fee INTEGER DEFAULT 0,
    tax INTEGER DEFAULT 0,
    grand_total INTEGER NOT NULL,
    delivery_method VARCHAR(20) DEFAULT 'delivery',
    delivery_address TEXT,
    delivery_instructions TEXT,
    payment_method VARCHAR(50) DEFAULT 'cash',
    payment_status VARCHAR(20) DEFAULT 'pending',
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    driver_location JSONB,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_review TEXT,
    pickup_coordinates JSONB,
    delivery_coordinates JSONB,
    estimated_pickup_time TIMESTAMP WITH TIME ZONE,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_pickup_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    offered_amount DECIMAL(10,2) NOT NULL,
    estimated_duration INTEGER,
    estimated_distance DECIMAL(8,2),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_id INTEGER REFERENCES businesses(id) ON DELETE SET NULL,
    business_name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending',
    special_requests TEXT,
    table_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS driver_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100),
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    expiry_date DATE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_earnings DECIMAL(10,2) DEFAULT 0.0,
    total_deliveries INTEGER DEFAULT 0,
    total_distance DECIMAL(8,2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    UNIQUE(user_id)
);

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

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name VARCHAR(100) NOT NULL,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Index pour les recherches de commerces
CREATE INDEX IF NOT EXISTS idx_businesses_type ON businesses(business_type_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active, is_open);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);

-- Index pour les adresses utilisateur
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);

-- Index pour les commandes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_time ON orders(estimated_pickup_time);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_time ON orders(estimated_delivery_time);

-- Index pour les réservations
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_business ON reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

-- Index pour les avis
CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Index pour les livreurs
CREATE INDEX IF NOT EXISTS idx_drivers_business ON drivers(business_id);
CREATE INDEX IF NOT EXISTS idx_drivers_current_order ON drivers(current_order_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active);

-- Index pour driver_profiles
CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_profile ON driver_profiles(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_driver ON driver_profiles(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_active ON driver_profiles(is_active);

-- Index pour le panier
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_business ON cart(business_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_menu_item ON cart_items(menu_item_id);

-- Index pour les paiements
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- Index pour les favoris
CREATE INDEX IF NOT EXISTS idx_favorite_businesses_user ON favorite_businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_businesses_business ON favorite_businesses(business_id);
CREATE INDEX IF NOT EXISTS idx_favorite_menu_items_user ON favorite_menu_items(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_menu_items_menu_item ON favorite_menu_items(menu_item_id);

-- Index pour les offres de livraison
CREATE INDEX IF NOT EXISTS idx_delivery_offers_status ON delivery_offers(status);
CREATE INDEX IF NOT EXISTS idx_delivery_offers_driver ON delivery_offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_offers_expires ON delivery_offers(expires_at);
CREATE INDEX IF NOT EXISTS idx_delivery_offers_order ON delivery_offers(order_id);

-- Index pour les documents des chauffeurs
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_status ON driver_documents(status);
CREATE INDEX IF NOT EXISTS idx_driver_documents_type ON driver_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_driver_documents_expiry ON driver_documents(expiry_date);

-- Index pour les sessions de travail
CREATE INDEX IF NOT EXISTS idx_work_sessions_driver ON work_sessions(driver_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_status ON work_sessions(status);
CREATE INDEX IF NOT EXISTS idx_work_sessions_start_time ON work_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_work_sessions_end_time ON work_sessions(end_time);

-- Index pour l'historique des statuts
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);
CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON order_status_history(status);

-- ============================================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON driver_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_offers_updated_at BEFORE UPDATE ON delivery_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_documents_updated_at BEFORE UPDATE ON driver_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_sessions_updated_at BEFORE UPDATE ON work_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FONCTIONS SPÉCIFIQUES AU DRIVER
-- ============================================================================

-- Fonction pour assigner automatiquement le rôle 'driver' à un utilisateur
CREATE OR REPLACE FUNCTION assign_driver_role()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles 
    SET role_id = (SELECT id FROM user_roles WHERE name = 'driver')
    WHERE id = NEW.user_profile_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour assigner automatiquement le rôle driver
DROP TRIGGER IF EXISTS trigger_assign_driver_role ON driver_profiles;
CREATE TRIGGER trigger_assign_driver_role
    AFTER INSERT ON driver_profiles
    FOR EACH ROW
    EXECUTE FUNCTION assign_driver_role();

-- ============================================================================
-- FONCTIONS POUR L'HISTORIQUE DES STATUTS
-- ============================================================================

-- Fonction pour créer automatiquement un historique de statut
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_status_history (order_id, status, description, created_by)
    VALUES (NEW.id, NEW.status, 'Statut mis à jour', NEW.driver_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer l'historique des statuts
CREATE TRIGGER create_order_status_history_trigger 
    AFTER UPDATE ON orders 
    FOR EACH ROW 
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION create_order_status_history();

-- ============================================================================
-- FONCTIONS POUR LES CALCULS GPS
-- ============================================================================

-- Fonction pour calculer la distance entre deux points GPS (formule de Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Rayon de la Terre en km
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlon := RADIANS(lon2 - lon1);
    lat1 := RADIANS(lat1);
    lat2 := RADIANS(lat2);
    a := SIN(dlat/2) * SIN(dlat/2) + COS(lat1) * COS(lat2) * SIN(dlon/2) * SIN(dlon/2);
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer la distance d'une commande
CREATE OR REPLACE FUNCTION get_order_distance(order_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    pickup_lat DECIMAL;
    pickup_lon DECIMAL;
    delivery_lat DECIMAL;
    delivery_lon DECIMAL;
BEGIN
    SELECT 
        (pickup_coordinates->>'lat')::DECIMAL,
        (pickup_coordinates->>'lng')::DECIMAL
    INTO pickup_lat, pickup_lon
    FROM orders 
    WHERE id = order_uuid;
    
    SELECT 
        (delivery_coordinates->>'lat')::DECIMAL,
        (delivery_coordinates->>'lng')::DECIMAL
    INTO delivery_lat, delivery_lon
    FROM orders 
    WHERE id = order_uuid;
    
    IF pickup_lat IS NOT NULL AND pickup_lon IS NOT NULL 
       AND delivery_lat IS NOT NULL AND delivery_lon IS NOT NULL THEN
        RETURN calculate_distance(pickup_lat, pickup_lon, delivery_lat, delivery_lon);
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTIONS SPÉCIFIQUES AU PANIER
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

-- ============================================================================
-- FONCTIONS SPÉCIFIQUES AUX FAVORIS
-- ============================================================================

-- Fonction pour ajouter un business aux favoris
CREATE OR REPLACE FUNCTION add_business_to_favorites(
    p_user_id UUID,
    p_business_id INTEGER
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM businesses WHERE id = p_business_id AND is_active = true) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Business non trouvé ou inactif'
        );
    END IF;
    INSERT INTO favorite_businesses (user_id, business_id)
    VALUES (p_user_id, p_business_id)
    ON CONFLICT (user_id, business_id) DO NOTHING;
    RETURN json_build_object(
        'success', true,
        'message', 'Business ajouté aux favoris'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour retirer un business des favoris
CREATE OR REPLACE FUNCTION remove_business_from_favorites(
    p_user_id UUID,
    p_business_id INTEGER
)
RETURNS JSON AS $$
BEGIN
    DELETE FROM favorite_businesses 
    WHERE user_id = p_user_id AND business_id = p_business_id;
    RETURN json_build_object(
        'success', true,
        'message', 'Business retiré des favoris'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter un menu item aux favoris
CREATE OR REPLACE FUNCTION add_menu_item_to_favorites(
    p_user_id UUID,
    p_menu_item_id INTEGER
)
RETURNS JSON AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM menu_items WHERE id = p_menu_item_id AND is_available = true) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Menu item non trouvé ou indisponible'
        );
    END IF;
    INSERT INTO favorite_menu_items (user_id, menu_item_id)
    VALUES (p_user_id, p_menu_item_id)
    ON CONFLICT (user_id, menu_item_id) DO NOTHING;
    RETURN json_build_object(
        'success', true,
        'message', 'Menu item ajouté aux favoris'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour retirer un menu item des favoris
CREATE OR REPLACE FUNCTION remove_menu_item_from_favorites(
    p_user_id UUID,
    p_menu_item_id INTEGER
)
RETURNS JSON AS $$
BEGIN
    DELETE FROM favorite_menu_items 
    WHERE user_id = p_user_id AND menu_item_id = p_menu_item_id;
    RETURN json_build_object(
        'success', true,
        'message', 'Menu item retiré des favoris'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un business est en favoris
CREATE OR REPLACE FUNCTION is_business_favorite(
    p_user_id UUID,
    p_business_id INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM favorite_businesses 
        WHERE user_id = p_user_id AND business_id = p_business_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un menu item est en favoris
CREATE OR REPLACE FUNCTION is_menu_item_favorite(
    p_user_id UUID,
    p_menu_item_id INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM favorite_menu_items 
        WHERE user_id = p_user_id AND menu_item_id = p_menu_item_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- POLITIQUES RLS POUR LES NOUVELLES TABLES
-- ============================================================================

ALTER TABLE favorite_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Politiques pour favorite_businesses
CREATE POLICY "Users can view their own favorite businesses" ON favorite_businesses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add businesses to favorites" ON favorite_businesses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove businesses from favorites" ON favorite_businesses
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour favorite_menu_items
CREATE POLICY "Users can view their own favorite menu items" ON favorite_menu_items
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add menu items to favorites" ON favorite_menu_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove menu items from favorites" ON favorite_menu_items
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour driver_profiles
CREATE POLICY "Drivers can view their own profile" ON driver_profiles
    FOR SELECT USING (
        user_profile_id IN (
            SELECT up.id 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );
CREATE POLICY "Drivers can update their own profile" ON driver_profiles
    FOR UPDATE USING (
        user_profile_id IN (
            SELECT up.id 
            FROM user_profiles up 
            WHERE up.id = auth.uid()
        )
    );
CREATE POLICY "Partners can view their drivers profiles" ON driver_profiles
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id 
            FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );
CREATE POLICY "Partners can create driver profiles" ON driver_profiles
    FOR INSERT WITH CHECK (
        driver_id IN (
            SELECT d.id 
            FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );
CREATE POLICY "System can create driver profiles" ON driver_profiles
    FOR INSERT WITH CHECK (true);

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

-- Politiques pour delivery_offers
CREATE POLICY "Drivers can view available offers" ON delivery_offers
    FOR SELECT USING (status = 'pending');
CREATE POLICY "Drivers can create offers" ON delivery_offers
    FOR INSERT WITH CHECK (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN driver_profiles dp ON d.id = dp.driver_id
            JOIN user_profiles up ON dp.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );
CREATE POLICY "Drivers can update their own offers" ON delivery_offers
    FOR UPDATE USING (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN driver_profiles dp ON d.id = dp.driver_id
            JOIN user_profiles up ON dp.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );
CREATE POLICY "Customers can view offers for their orders" ON delivery_offers
    FOR SELECT USING (
        order_id IN (
            SELECT o.id FROM orders o 
            WHERE o.user_id = auth.uid()
        )
    );

-- Politiques pour driver_documents
CREATE POLICY "Drivers can view their own documents" ON driver_documents
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN driver_profiles dp ON d.id = dp.driver_id
            JOIN user_profiles up ON dp.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );
CREATE POLICY "Drivers can create their own documents" ON driver_documents
    FOR INSERT WITH CHECK (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN driver_profiles dp ON d.id = dp.driver_id
            JOIN user_profiles up ON dp.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );
CREATE POLICY "Drivers can update their own documents" ON driver_documents
    FOR UPDATE USING (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN driver_profiles dp ON d.id = dp.driver_id
            JOIN user_profiles up ON dp.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );
CREATE POLICY "Partners can view their drivers documents" ON driver_documents
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );
CREATE POLICY "Admins can manage all documents" ON driver_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Politiques pour work_sessions
CREATE POLICY "Drivers can view their own sessions" ON work_sessions
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN driver_profiles dp ON d.id = dp.driver_id
            JOIN user_profiles up ON dp.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );
CREATE POLICY "Drivers can create their own sessions" ON work_sessions
    FOR INSERT WITH CHECK (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN driver_profiles dp ON d.id = dp.driver_id
            JOIN user_profiles up ON dp.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );
CREATE POLICY "Drivers can update their own sessions" ON work_sessions
    FOR UPDATE USING (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN driver_profiles dp ON d.id = dp.driver_id
            JOIN user_profiles up ON dp.user_profile_id = up.id
            WHERE up.id = auth.uid()
        )
    );
CREATE POLICY "Partners can view their drivers sessions" ON work_sessions
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );
CREATE POLICY "Admins can manage all sessions" ON work_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Politiques pour order_status_history
CREATE POLICY "Users can view their own order history" ON order_status_history
    FOR SELECT USING (
        order_id IN (
            SELECT o.id FROM orders o 
            WHERE o.user_id = auth.uid()
        )
    );
CREATE POLICY "Drivers can view history for their orders" ON order_status_history
    FOR SELECT USING (
        order_id IN (
            SELECT o.id FROM orders o 
            WHERE o.driver_id IN (
                SELECT d.id FROM drivers d 
                JOIN driver_profiles dp ON d.id = dp.driver_id
                JOIN user_profiles up ON dp.user_profile_id = up.id
                WHERE up.id = auth.uid()
            )
        )
    );
CREATE POLICY "Partners can view history for their business orders" ON order_status_history
    FOR SELECT USING (
        order_id IN (
            SELECT o.id FROM orders o 
            JOIN businesses b ON o.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );
CREATE POLICY "System can create history entries" ON order_status_history
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all history" ON order_status_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- ============================================================================
-- VUES UTILES
-- ============================================================================

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

CREATE OR REPLACE VIEW businesses_with_favorites AS
SELECT 
    b.*,
    CASE WHEN fb.user_id IS NOT NULL THEN true ELSE false END as is_favorite,
    fb.created_at as favorited_at
FROM businesses b
LEFT JOIN favorite_businesses fb ON b.id = fb.business_id AND fb.user_id = auth.uid()
WHERE b.is_active = true;

CREATE OR REPLACE VIEW menu_items_with_favorites AS
SELECT 
    mi.*,
    CASE WHEN fmi.user_id IS NOT NULL THEN true ELSE false END as is_favorite,
    fmi.created_at as favorited_at
FROM menu_items mi
LEFT JOIN favorite_menu_items fmi ON mi.id = fmi.menu_item_id AND fmi.user_id = auth.uid()
WHERE mi.is_available = true;

CREATE OR REPLACE VIEW user_favorite_businesses AS
SELECT 
    b.*,
    fb.created_at as favorited_at
FROM favorite_businesses fb
JOIN businesses b ON fb.business_id = b.id
WHERE fb.user_id = auth.uid() AND b.is_active = true;

CREATE OR REPLACE VIEW user_favorite_menu_items AS
SELECT 
    mi.*,
    b.name as business_name,
    b.id as business_id,
    fmi.created_at as favorited_at
FROM favorite_menu_items fmi
JOIN menu_items mi ON fmi.menu_item_id = mi.id
JOIN businesses b ON mi.business_id = b.id
WHERE fmi.user_id = auth.uid() AND mi.is_available = true AND b.is_active = true;

CREATE OR REPLACE VIEW available_delivery_offers AS
SELECT 
    doff.*,
    o.order_number,
    o.pickup_address,
    o.delivery_address,
    o.total_amount,
    b.name as business_name,
    b.address as business_address,
    up.name as customer_name,
    up.phone_number as customer_phone
FROM delivery_offers doff
JOIN orders o ON doff.order_id = o.id
JOIN businesses b ON o.business_id = b.id
JOIN user_profiles up ON o.user_id = up.id
WHERE doff.status = 'pending' AND doff.expires_at > NOW();

CREATE OR REPLACE VIEW driver_documents_with_details AS
SELECT 
    dd.*,
    d.name as driver_name,
    d.phone as driver_phone,
    d.email as driver_email,
    b.name as business_name,
    CASE 
        WHEN dd.expiry_date < CURRENT_DATE THEN 'expired'
        WHEN dd.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        ELSE 'valid'
    END as expiry_status
FROM driver_documents dd
JOIN drivers d ON dd.driver_id = d.id
LEFT JOIN businesses b ON d.business_id = b.id;

CREATE OR REPLACE VIEW work_sessions_with_details AS
SELECT 
    ws.*,
    d.name as driver_name,
    d.phone as driver_phone,
    d.email as driver_email,
    b.name as business_name,
    EXTRACT(EPOCH FROM (COALESCE(ws.end_time, NOW()) - ws.start_time)) / 3600 as hours_worked,
    CASE 
        WHEN ws.status = 'active' THEN 'En cours'
        WHEN ws.status = 'completed' THEN 'Terminée'
        WHEN ws.status = 'paused' THEN 'En pause'
        ELSE ws.status
    END as status_label
FROM work_sessions ws
JOIN drivers d ON ws.driver_id = d.id
LEFT JOIN businesses b ON d.business_id = b.id;

CREATE OR REPLACE VIEW order_status_history_with_details AS
SELECT 
    osh.*,
    o.order_number,
    o.business_name,
    up.name as customer_name,
    d.name as driver_name,
    CASE 
        WHEN osh.created_by IN (SELECT id FROM drivers) THEN 'driver'
        WHEN osh.created_by IN (SELECT owner_id FROM businesses) THEN 'business'
        ELSE 'system'
    END as updated_by_type
FROM order_status_history osh
JOIN orders o ON osh.order_id = o.id
LEFT JOIN user_profiles up ON o.user_id = up.id
LEFT JOIN drivers d ON osh.created_by = d.id
ORDER BY osh.created_at DESC;

CREATE OR REPLACE VIEW orders_with_gps AS
SELECT 
    o.*,
    get_order_distance(o.id) as distance_km,
    CASE 
        WHEN o.pickup_coordinates IS NOT NULL AND o.delivery_coordinates IS NOT NULL THEN true
        ELSE false
    END as has_gps_coordinates,
    CASE 
        WHEN o.actual_pickup_time IS NOT NULL THEN 'picked_up'
        WHEN o.estimated_pickup_time < NOW() THEN 'overdue'
        ELSE 'scheduled'
    END as pickup_status
FROM orders o;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Schéma BraPrime Mobile mis à jour avec succès!';
    RAISE NOTICE '📋 Tables ajoutées: favorite_businesses, favorite_menu_items, driver_profiles, cart, cart_items';
    RAISE NOTICE '🔒 RLS configuré pour les favoris, drivers et le panier';
    RAISE NOTICE '🛠️ Fonctions utilitaires créées pour les favoris';
    RAISE NOTICE '🚚 Système d''authentification driver configuré';
    RAISE NOTICE '🛒 Système de panier persistant configuré';
    RAISE NOTICE '⭐ Système de favoris configuré';
END $$;