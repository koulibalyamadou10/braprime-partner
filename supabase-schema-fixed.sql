-- Schéma de base de données refactorisé pour BraPrime
-- Modèle flexible : un partenaire peut offrir différents types de services
-- À exécuter dans l'éditeur SQL de Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_types CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('customer', 'partner', 'driver', 'admin')) NOT NULL DEFAULT 'customer',
  phone_number TEXT,
  address TEXT,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_types table (Restaurant, Pharmacie, Supermarché, etc.)
CREATE TABLE IF NOT EXISTS service_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table (pour les articles/produits)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table (remplace restaurants)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  service_type_id INTEGER REFERENCES service_types(id) ON DELETE CASCADE,
  cover_image TEXT NOT NULL,
  logo TEXT,
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

-- Create menu_items table (renommé en products pour être plus générique)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table (adapté pour tous types de services)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
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

-- Create reservations table (pour les restaurants)
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_services_partner_id ON services(partner_id);
CREATE INDEX IF NOT EXISTS idx_services_service_type_id ON services(service_type_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_products_service_id ON products(service_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_service_id ON reservations(service_id);
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
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert service types
INSERT INTO service_types (name, description, icon, color) VALUES
('Restaurant', 'Services de restauration et de livraison de plats', 'Utensils', 'bg-guinea-red'),
('Pharmacie', 'Services pharmaceutiques et produits de santé', 'Pill', 'bg-green-500'),
('Supermarché', 'Produits alimentaires et articles ménagers', 'ShoppingCart', 'bg-blue-500'),
('Café', 'Boissons et pâtisseries', 'Coffee', 'bg-guinea-yellow'),
('Marché', 'Produits frais et locaux', 'ShoppingBasket', 'bg-guinea-green'),
('Électronique', 'Appareils électroniques et accessoires', 'Tv', 'bg-indigo-500'),
('Beauté', 'Produits de beauté et soins personnels', 'Sparkles', 'bg-pink-400'),
('Coiffure', 'Services de coiffure et soins capillaires', 'Scissors', 'bg-slate-500'),
('Bricolage', 'Outils et matériaux de construction', 'Hammer', 'bg-zinc-600'),
('Documents', 'Services de traitement de documents', 'FileText', 'bg-sky-500'),
('Colis', 'Services de livraison de colis', 'Package', 'bg-purple-500'),
('Cadeaux', 'Articles de cadeaux et souvenirs', 'Gift', 'bg-pink-500'),
('Fournitures', 'Fournitures de bureau et scolaires', 'Briefcase', 'bg-amber-500')
ON CONFLICT DO NOTHING;

-- Insert default categories (pour les produits/articles)
INSERT INTO categories (name, icon, color, link) VALUES
('Populaires', 'Star', 'bg-yellow-500', '/popular'),
('Entrées', 'Utensils', 'bg-green-500', '/starters'),
('Plats principaux', 'Drumstick', 'bg-red-500', '/mains'),
('Accompagnements', 'Carrot', 'bg-orange-500', '/sides'),
('Boissons', 'Coffee', 'bg-blue-500', '/drinks'),
('Desserts', 'Cake', 'bg-pink-500', '/desserts'),
('Médicaments', 'Pill', 'bg-red-500', '/medicines'),
('Soins personnels', 'Heart', 'bg-pink-500', '/personal-care'),
('Vitamines', 'Zap', 'bg-yellow-500', '/vitamins'),
('Bébé & Enfant', 'Baby', 'bg-blue-500', '/baby'),
('Équipement médical', 'Stethoscope', 'bg-green-500', '/medical-equipment'),
('Produits frais', 'Leaf', 'bg-green-500', '/fresh'),
('Conserves', 'Package', 'bg-orange-500', '/canned'),
('Électroménager', 'Zap', 'bg-blue-500', '/appliances'),
('Téléphones', 'Smartphone', 'bg-purple-500', '/phones'),
('Ordinateurs', 'Laptop', 'bg-indigo-500', '/computers')
ON CONFLICT DO NOTHING;

-- Insert sample services (remplace restaurants)
INSERT INTO services (name, description, service_type_id, cover_image, logo, rating, review_count, delivery_time, delivery_fee, address, phone, opening_hours, partner_id) VALUES
('Le Petit Baoulé', 'Découvrez les saveurs authentiques de la cuisine guinéenne traditionnelle au Petit Baoulé. Nos plats sont préparés avec des ingrédients frais et locaux par nos chefs expérimentés.', 1, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 4.8, 124, '25-35 min', 15000, 'Rue KA-003, Quartier Almamya, Kaloum, Conakry', '+224 621 23 45 67', '10:00 - 22:00', NULL),
('Pharmacie Centrale', 'Pharmacie offrant une large gamme de médicaments, produits de santé et conseils pharmaceutiques professionnels avec service de livraison rapide.', 2, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 4.8, 132, '20-35 min', 15000, 'Avenue de la République, Kaloum, Conakry', '+224 622 45 67 89', '24h/24, 7j/7', NULL),
('Supermarché Madina', 'Votre supermarché de confiance pour tous vos besoins quotidiens. Produits frais, articles ménagers et plus encore.', 3, 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 4.6, 89, '30-45 min', 12000, 'Rue KA-020, Madina, Conakry', '+224 628 34 56 78', '08:00 - 21:00', NULL),
('Le Café de Conakry', 'Un café chaleureux offrant une sélection de boissons chaudes, pâtisseries et petits déjeuners. Ambiance parfaite pour travailler ou se détendre.', 4, 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', 4.3, 64, '20-30 min', 15000, 'Rue KA-015, Quartier Camayenne, Dixinn, Conakry', '+224 628 12 34 56', '07:00 - 21:00', NULL)
ON CONFLICT DO NOTHING;

-- Insert sample products (remplace menu_items)
INSERT INTO products (service_id, name, description, price, image, category_id, is_popular, is_available) VALUES
-- Produits du restaurant
(1, 'Poulet Yassa', 'Poulet mariné avec oignons, citron et épices, servi avec du riz', 60000, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 3, TRUE, TRUE),
(1, 'Sauce Arachide', 'Ragoût traditionnel à base de pâte d''arachide avec viande et légumes', 55000, 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 3, TRUE, TRUE),
(1, 'Jus de Gingembre', 'Boisson rafraîchissante à base de gingembre frais', 15000, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 5, TRUE, TRUE),
-- Produits de la pharmacie
(2, 'Paracétamol 500mg', 'Boîte de 20 comprimés pour le soulagement de la douleur et de la fièvre', 10000, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 7, TRUE, TRUE),
(2, 'Gel hydroalcoolique', 'Flacon de 250ml pour désinfection des mains', 15000, 'https://images.unsplash.com/photo-1584483720412-ce931f4aefa8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 8, TRUE, TRUE),
(2, 'Vitamine C', 'Complément alimentaire pour renforcer le système immunitaire', 20000, 'https://images.unsplash.com/photo-1626903292519-bf576757b893?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 9, TRUE, TRUE),
-- Produits du supermarché
(3, 'Riz Basmati 5kg', 'Riz basmati de qualité premium, emballage de 5kg', 45000, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 12, TRUE, TRUE),
(3, 'Huile d''Olive Extra Vierge', 'Huile d''olive extra vierge, bouteille de 500ml', 35000, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 12, TRUE, TRUE),
(3, 'Pommes Golden', 'Pommes Golden fraîches, sachet de 1kg', 8000, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 12, TRUE, TRUE),
-- Produits du café
(4, 'Café Noir', 'Café local fraîchement torréfié', 15000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 5, TRUE, TRUE),
(4, 'Cappuccino', 'Espresso avec du lait moussé', 20000, 'https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 5, TRUE, TRUE),
(4, 'Croissant', 'Croissant au beurre frais', 10000, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 6, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Services policies
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Partners can manage their own services" ON services FOR ALL USING (auth.uid() = partner_id);

-- Products policies
CREATE POLICY "Anyone can view available products" ON products FOR SELECT USING (is_available = true);
CREATE POLICY "Partners can manage products of their services" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM services 
    WHERE services.id = products.service_id 
    AND services.partner_id = auth.uid()
  )
);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Partners can view orders for their services" ON orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM services 
    WHERE services.id = orders.service_id 
    AND services.partner_id = auth.uid()
  )
);

-- User addresses policies
CREATE POLICY "Users can manage their own addresses" ON user_addresses FOR ALL USING (auth.uid() = user_id);

-- Reservations policies
CREATE POLICY "Users can view their own reservations" ON reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reservations" ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Partners can view reservations for their services" ON reservations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM services 
    WHERE services.id = reservations.service_id 
    AND services.partner_id = auth.uid()
  )
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
