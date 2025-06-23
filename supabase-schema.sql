-- Schéma de base de données pour BraPrime
-- À exécuter dans l'éditeur SQL de Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('customer', 'partner')) NOT NULL DEFAULT 'customer',
  phone_number TEXT,
  address TEXT,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cuisine_type TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  logo TEXT NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  delivery_time TEXT NOT NULL,
  delivery_fee INTEGER NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  opening_hours TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  partner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT,
  category_id INTEGER NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  items JSONB NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled')) DEFAULT 'pending',
  total INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL,
  tax INTEGER NOT NULL,
  grand_total INTEGER NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_method TEXT CHECK (delivery_method IN ('delivery', 'pickup')) NOT NULL,
  driver_name TEXT,
  driver_phone TEXT,
  driver_location JSONB,
  estimated_delivery TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_restaurants_partner_id ON restaurants(partner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, icon, color, link) VALUES
('Restaurants', 'Utensils', 'bg-guinea-red', '/restaurants'),
('Cafés', 'Coffee', 'bg-guinea-yellow', '/cafes'),
('Marchés', 'ShoppingBasket', 'bg-guinea-green', '/markets'),
('Supermarchés', 'ShoppingCart', 'bg-blue-500', '/supermarkets'),
('Colis', 'Package', 'bg-purple-500', '/packages'),
('Cadeaux', 'Gift', 'bg-pink-500', '/gifts'),
('Pharmacie', 'Pill', 'bg-green-500', '/pharmacy'),
('Électronique', 'Tv', 'bg-indigo-500', '/electronic-stores'),
('Fournitures', 'Briefcase', 'bg-amber-500', '/supplies'),
('Documents', 'FileText', 'bg-sky-500', '/documents'),
('Beauté', 'Sparkles', 'bg-pink-400', '/beauty'),
('Bricolage', 'Hammer', 'bg-zinc-600', '/hardware'),
('Coiffure', 'Scissors', 'bg-slate-500', '/hairdressing')
ON CONFLICT DO NOTHING;

-- Insert sample restaurants
INSERT INTO restaurants (name, description, cuisine_type, cover_image, logo, rating, review_count, delivery_time, delivery_fee, address, phone, opening_hours, partner_id) VALUES
('Le Petit Baoulé', 'Découvrez les saveurs authentiques de la cuisine guinéenne traditionnelle au Petit Baoulé. Nos plats sont préparés avec des ingrédients frais et locaux par nos chefs expérimentés.', 'Cuisine Guinéenne', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 4.8, 124, '25-35 min', 15000, 'Rue KA-003, Quartier Almamya, Kaloum, Conakry', '+224 621 23 45 67', '10:00 - 22:00', NULL),
('Conakry Grill House', 'Restaurant spécialisé dans les grillades et barbecues avec une ambiance conviviale et des saveurs internationales.', 'Grillades', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 4.7, 89, '30-45 min', 20000, 'Boulevard du Commerce, Ratoma, Conakry', '+224 628 34 56 78', '11:00 - 23:00', NULL),
('Fruits de Mer Conakry', 'Spécialiste des fruits de mer frais et des plats de poisson traditionnels guinéens.', 'Fruits de Mer', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 4.6, 67, '35-50 min', 18000, 'Corniche Nord, Dixinn, Conakry', '+224 666 45 67 89', '12:00 - 22:00', NULL)
ON CONFLICT DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (restaurant_id, name, description, price, image, category_id, is_popular, is_available) VALUES
(1, 'Poulet Yassa', 'Poulet mariné avec oignons, citron et épices, servi avec du riz', 60000, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 3, TRUE, TRUE),
(1, 'Sauce Arachide', 'Ragoût traditionnel à base de pâte d''arachide avec viande et légumes', 55000, 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 3, TRUE, TRUE),
(1, 'Salade d''Avocat', 'Avocat frais avec tomates, oignons et vinaigrette', 25000, 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 2, FALSE, TRUE),
(1, 'Alloco', 'Bananes plantains frites servies avec une sauce épicée', 20000, 'https://images.unsplash.com/photo-1599955085847-adb6d06de96b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 4, TRUE, TRUE),
(1, 'Jus de Gingembre', 'Boisson rafraîchissante à base de gingembre frais', 15000, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 5, TRUE, TRUE),
(1, 'Riz au Gras', 'Riz cuit avec tomates, oignons et épices', 30000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 4, FALSE, TRUE),
(2, 'Poisson Braisé', 'Poisson frais braisé avec épices et herbes aromatiques', 75000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 3, TRUE, TRUE),
(2, 'Poulet Grillé', 'Poulet grillé au charbon avec marinade spéciale', 65000, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 3, TRUE, TRUE),
(2, 'Jus de Bissap', 'Boisson traditionnelle à base d''hibiscus', 12000, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 5, TRUE, TRUE),
(3, 'Thiof Braisé', 'Thiof frais braisé avec légumes et riz', 85000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 3, TRUE, TRUE),
(3, 'Crevettes Grillées', 'Crevettes fraîches grillées avec sauce cocktail', 95000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 3, TRUE, TRUE),
(3, 'Soupe de Poisson', 'Soupe traditionnelle de poisson avec légumes', 45000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 2, FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Restaurants policies
CREATE POLICY "Anyone can view active restaurants" ON restaurants FOR SELECT USING (is_active = true);
CREATE POLICY "Partners can manage their own restaurants" ON restaurants FOR ALL USING (partner_id = auth.uid());

-- Menu items policies
CREATE POLICY "Anyone can view available menu items" ON menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Partners can manage menu items for their restaurants" ON menu_items FOR ALL USING (
  restaurant_id IN (SELECT id FROM restaurants WHERE partner_id = auth.uid())
);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Partners can view orders for their restaurants" ON orders FOR SELECT USING (
  restaurant_id IN (SELECT id FROM restaurants WHERE partner_id = auth.uid())
);
CREATE POLICY "Partners can update orders for their restaurants" ON orders FOR UPDATE USING (
  restaurant_id IN (SELECT id FROM restaurants WHERE partner_id = auth.uid())
);

-- User addresses policies
CREATE POLICY "Users can manage their own addresses" ON user_addresses FOR ALL USING (user_id = auth.uid());

-- Reservations policies
CREATE POLICY "Users can view their own reservations" ON reservations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own reservations" ON reservations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Partners can view reservations for their restaurants" ON reservations FOR SELECT USING (
  restaurant_id IN (SELECT id FROM restaurants WHERE partner_id = auth.uid())
);
CREATE POLICY "Partners can update reservations for their restaurants" ON reservations FOR UPDATE USING (
  restaurant_id IN (SELECT id FROM restaurants WHERE partner_id = auth.uid())
);

-- Functions for automatic user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Nouvel Utilisateur'), 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 