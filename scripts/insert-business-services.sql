-- =========================================================================
-- SCRIPT D'INSERTION DES DONNÉES DE TEST - SERVICES/COMMERCES
-- =========================================================================

-- (1) Insertion des rôles utilisateur
INSERT INTO user_roles (name, description) VALUES
('customer', 'Client final'),
('partner', 'Propriétaire de commerce'),
('driver', 'Chauffeur de livraison'),
('admin', 'Administrateur système')
ON CONFLICT (name) DO NOTHING;

-- (2) Insertion des types de commerce
INSERT INTO business_types (name, icon, color, description, features) VALUES
('restaurant', '🍽️', '#FF6B6B', 'Restaurants et établissements de restauration', '["delivery", "reservation", "menu"]'),
('cafe', '☕', '#4ECDC4', 'Cafés et bars', '["delivery", "reservation", "menu"]'),
('pharmacy', '💊', '#45B7D1', 'Pharmacies et parapharmacies', '["delivery", "prescription"]'),
('market', '🛒', '#96CEB4', 'Marchés et épiceries', '["delivery", "fresh_products"]'),
('supermarket', '🏪', '#FFEAA7', 'Supermarchés', '["delivery", "wide_selection"]'),
('electronics', '📱', '#DDA0DD', 'Électronique et technologie', '["delivery", "warranty"]'),
('beauty', '💄', '#FFB6C1', 'Beauté et cosmétiques', '["delivery", "appointment"]'),
('clothing', '👕', '#98D8C8', 'Vêtements et mode', '["delivery", "sizing"]'),
('books', '📚', '#F7DC6F', 'Livres et papeterie', '["delivery", "recommendations"]'),
('gifts', '🎁', '#BB8FCE', 'Cadeaux et artisanat', '["delivery", "customization"]'),
('hardware', '🔧', '#85C1E9', 'Quincaillerie et bricolage', '["delivery", "advice"]'),
('sports', '⚽', '#82E0AA', 'Sports et loisirs', '["delivery", "equipment"]'),
('documents', '📄', '#F8C471', 'Services de documents', '["delivery", "processing"]'),
('packages', '📦', '#F1948A', 'Services de colis', '["delivery", "tracking"]')
ON CONFLICT (name) DO NOTHING;

-- (3) Insertion des catégories
INSERT INTO categories (name, icon, color, link, description, is_active) VALUES
('Restaurants', '🍽️', '#FF6B6B', '/restaurants', 'Restaurants et établissements de restauration', true),
('Cafés', '☕', '#4ECDC4', '/cafes', 'Cafés et bars', true),
('Pharmacies', '💊', '#45B7D1', '/pharmacies', 'Pharmacies et parapharmacies', true),
('Marchés', '🛒', '#96CEB4', '/markets', 'Marchés et épiceries', true),
('Supermarchés', '🏪', '#FFEAA7', '/supermarkets', 'Supermarchés', true),
('Électronique', '📱', '#DDA0DD', '/electronics', 'Électronique et technologie', true),
('Beauté', '💄', '#FFB6C1', '/beauty', 'Beauté et cosmétiques', true),
('Vêtements', '👕', '#98D8C8', '/clothing', 'Vêtements et mode', true),
('Livres', '📚', '#F7DC6F', '/books', 'Livres et papeterie', true),
('Cadeaux', '🎁', '#BB8FCE', '/gifts', 'Cadeaux et artisanat', true),
('Quincaillerie', '🔧', '#85C1E9', '/hardware', 'Quincaillerie et bricolage', true),
('Sports', '⚽', '#82E0AA', '/sports', 'Sports et loisirs', true),
('Documents', '📄', '#F8C471', '/documents', 'Services de documents', true),
('Colis', '📦', '#F1948A', '/packages', 'Services de colis', true)
ON CONFLICT (name) DO NOTHING;

-- (4) Insertion des statuts de commande
INSERT INTO order_statuses (name, label, color, icon, description, sort_order) VALUES
('pending', 'En attente', '#FFA500', '⏳', 'Commande en attente de confirmation', 1),
('confirmed', 'Confirmée', '#4CAF50', '✅', 'Commande confirmée par le restaurant', 2),
('preparing', 'En préparation', '#2196F3', '👨‍🍳', 'Commande en cours de préparation', 3),
('ready', 'Prête', '#9C27B0', '📦', 'Commande prête pour la livraison', 4),
('picked_up', 'Récupérée', '#FF9800', '🚗', 'Commande récupérée par le chauffeur', 5),
('delivering', 'En livraison', '#607D8B', '🛵', 'Commande en cours de livraison', 6),
('delivered', 'Livrée', '#4CAF50', '🎉', 'Commande livrée avec succès', 7),
('cancelled', 'Annulée', '#F44336', '❌', 'Commande annulée', 8)
ON CONFLICT (name) DO NOTHING;

-- (5) Insertion des méthodes de paiement
INSERT INTO payment_methods (name, icon, description, is_available) VALUES
('cash', '💵', 'Paiement en espèces à la livraison', true),
('card', '💳', 'Paiement par carte bancaire', true),
('mobile_money', '📱', 'Paiement par mobile money', true),
('bank_transfer', '🏦', 'Virement bancaire', true)
ON CONFLICT (name) DO NOTHING;

-- (6) Insertion des statuts de réservation
INSERT INTO reservation_statuses (name, label, color) VALUES
('pending', 'En attente', '#FFA500'),
('confirmed', 'Confirmée', '#4CAF50'),
('cancelled', 'Annulée', '#F44336'),
('completed', 'Terminée', '#2196F3')
ON CONFLICT (name) DO NOTHING;

-- (7) Insertion des types de notification
INSERT INTO notification_types (name, title, icon, color) VALUES
('order_update', 'Mise à jour de commande', '📦', '#2196F3'),
('delivery', 'Livraison', '🛵', '#4CAF50'),
('promotion', 'Promotion', '🎉', '#FF9800'),
('reservation', 'Réservation', '📅', '#9C27B0'),
('payment', 'Paiement', '💳', '#607D8B')
ON CONFLICT (name) DO NOTHING;

-- (8) Insertion des commerces/services (exemples) - CORRIGÉ AVEC SOUS-REQUÊTES
INSERT INTO businesses (name, description, business_type_id, category_id, cover_image, logo, rating, review_count, delivery_time, delivery_fee, address, phone, email, opening_hours, cuisine_type, latitude, longitude, is_active, is_open) VALUES

-- Restaurants
('Le Gourmet Conakry', 'Restaurant gastronomique français', 
 (SELECT id FROM business_types WHERE name = 'restaurant'), 
 (SELECT id FROM categories WHERE name = 'Restaurants'), 
 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 
 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 
 4.5, 128, '30-45 min', 5000, 'Rue du Commerce, Conakry', '+224 123 456 789', 'contact@legourmet.com', '11:00-23:00', 'Française', 9.5370, -13.6785, true, true),

('Spice Garden', 'Cuisine indienne authentique', 
 (SELECT id FROM business_types WHERE name = 'restaurant'), 
 (SELECT id FROM categories WHERE name = 'Restaurants'), 
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', 
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', 
 4.3, 95, '25-40 min', 4000, 'Avenue de la République, Conakry', '+224 123 456 790', 'info@spicegarden.com', '12:00-22:00', 'Indienne', 9.5380, -13.6790, true, true),

('Pizza Palace', 'Pizzas italiennes traditionnelles', 
 (SELECT id FROM business_types WHERE name = 'restaurant'), 
 (SELECT id FROM categories WHERE name = 'Restaurants'), 
 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', 
 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', 
 4.2, 87, '20-35 min', 3500, 'Boulevard du Commerce, Conakry', '+224 123 456 791', 'hello@pizzapalace.com', '11:00-00:00', 'Italienne', 9.5390, -13.6800, true, true),

-- Cafés
('Café Central', 'Café traditionnel guinéen', 
 (SELECT id FROM business_types WHERE name = 'cafe'), 
 (SELECT id FROM categories WHERE name = 'Cafés'), 
 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb', 
 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb', 
 4.4, 156, '15-25 min', 2000, 'Place de la République, Conakry', '+224 123 456 792', 'contact@cafecentral.com', '07:00-22:00', 'Café', 9.5400, -13.6810, true, true),

('Starbucks Conakry', 'Café international', 
 (SELECT id FROM business_types WHERE name = 'cafe'), 
 (SELECT id FROM categories WHERE name = 'Cafés'), 
 'https://images.unsplash.com/photo-1554118811-1e0d58224f24', 
 'https://images.unsplash.com/photo-1554118811-1e0d58224f24', 
 4.1, 203, '10-20 min', 2500, 'Centre Commercial, Conakry', '+224 123 456 793', 'conakry@starbucks.com', '06:00-23:00', 'Café', 9.5410, -13.6820, true, true),

-- Pharmacies
('Pharmacie Centrale', 'Pharmacie de garde 24h/24', 
 (SELECT id FROM business_types WHERE name = 'pharmacy'), 
 (SELECT id FROM categories WHERE name = 'Pharmacies'), 
 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88', 
 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88', 
 4.6, 89, '15-30 min', 3000, 'Avenue de la Santé, Conakry', '+224 123 456 794', 'contact@pharmaciecentrale.com', '24h/24', 'Pharmacie', 9.5420, -13.6830, true, true),

('Pharma Express', 'Pharmacie rapide et efficace', 
 (SELECT id FROM business_types WHERE name = 'pharmacy'), 
 (SELECT id FROM categories WHERE name = 'Pharmacies'), 
 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56', 
 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56', 
 4.3, 67, '10-20 min', 2500, 'Rue de la Pharmacie, Conakry', '+224 123 456 795', 'info@pharmaexpress.com', '08:00-20:00', 'Pharmacie', 9.5430, -13.6840, true, true),

-- Marchés
('Marché Central', 'Marché traditionnel guinéen', 
 (SELECT id FROM business_types WHERE name = 'market'), 
 (SELECT id FROM categories WHERE name = 'Marchés'), 
 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 
 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 
 4.2, 234, '20-40 min', 4000, 'Place du Marché, Conakry', '+224 123 456 796', 'contact@marchecentral.com', '06:00-18:00', 'Marché', 9.5440, -13.6850, true, true),

-- Supermarchés
('Super U Conakry', 'Supermarché français', 
 (SELECT id FROM business_types WHERE name = 'supermarket'), 
 (SELECT id FROM categories WHERE name = 'Supermarchés'), 
 'https://images.unsplash.com/photo-1542838132-92c53300491e', 
 'https://images.unsplash.com/photo-1542838132-92c53300491e', 
 4.4, 178, '25-45 min', 5000, 'Centre Commercial Kaloum, Conakry', '+224 123 456 797', 'conakry@superu.com', '08:00-21:00', 'Supermarché', 9.5450, -13.6860, true, true),

-- Électronique
('Tech Store', 'Magasin d''électronique', 
 (SELECT id FROM business_types WHERE name = 'electronics'), 
 (SELECT id FROM categories WHERE name = 'Électronique'), 
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43', 
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43', 
 4.0, 145, '30-60 min', 6000, 'Avenue de la Technologie, Conakry', '+224 123 456 798', 'contact@techstore.com', '09:00-19:00', 'Électronique', 9.5460, -13.6870, true, true),

-- Beauté
('Beauty Salon', 'Salon de beauté', 
 (SELECT id FROM business_types WHERE name = 'beauty'), 
 (SELECT id FROM categories WHERE name = 'Beauté'), 
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43', 
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43', 
 4.5, 98, '45-90 min', 8000, 'Rue de la Beauté, Conakry', '+224 123 456 799', 'info@beautysalon.com', '09:00-18:00', 'Beauté', 9.5470, -13.6880, true, true),

-- Vêtements
('Fashion Store', 'Boutique de mode', 
 (SELECT id FROM business_types WHERE name = 'clothing'), 
 (SELECT id FROM categories WHERE name = 'Vêtements'), 
 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', 
 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', 
 4.1, 112, '25-45 min', 5000, 'Avenue de la Mode, Conakry', '+224 123 456 800', 'contact@fashionstore.com', '10:00-20:00', 'Mode', 9.5480, -13.6890, true, true),

-- Livres
('Librairie Centrale', 'Librairie et papeterie', 
 (SELECT id FROM business_types WHERE name = 'books'), 
 (SELECT id FROM categories WHERE name = 'Livres'), 
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 
 4.3, 76, '20-40 min', 4000, 'Rue des Livres, Conakry', '+224 123 456 801', 'info@librairiecentrale.com', '09:00-19:00', 'Livres', 9.5490, -13.6900, true, true),

-- Cadeaux
('Gift Shop', 'Boutique de cadeaux', 
 (SELECT id FROM business_types WHERE name = 'gifts'), 
 (SELECT id FROM categories WHERE name = 'Cadeaux'), 
 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48', 
 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48', 
 4.2, 89, '30-50 min', 5000, 'Avenue des Cadeaux, Conakry', '+224 123 456 802', 'contact@giftshop.com', '10:00-19:00', 'Cadeaux', 9.5500, -13.6910, true, true),

-- Quincaillerie
('Hardware Store', 'Quincaillerie et bricolage', 
 (SELECT id FROM business_types WHERE name = 'hardware'), 
 (SELECT id FROM categories WHERE name = 'Quincaillerie'), 
 'https://images.unsplash.com/photo-1581783898377-1c85bf937427', 
 'https://images.unsplash.com/photo-1581783898377-1c85bf937427', 
 4.0, 67, '25-45 min', 5000, 'Rue de la Quincaillerie, Conakry', '+224 123 456 803', 'info@hardwarestore.com', '08:00-18:00', 'Quincaillerie', 9.5510, -13.6920, true, true),

-- Sports
('Sport Store', 'Équipements de sport', 
 (SELECT id FROM business_types WHERE name = 'sports'), 
 (SELECT id FROM categories WHERE name = 'Sports'), 
 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', 
 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', 
 4.4, 123, '20-40 min', 4500, 'Avenue du Sport, Conakry', '+224 123 456 804', 'contact@sportstore.com', '09:00-19:00', 'Sports', 9.5520, -13.6930, true, true),

-- Documents
('Document Services', 'Services de documents', 
 (SELECT id FROM business_types WHERE name = 'documents'), 
 (SELECT id FROM categories WHERE name = 'Documents'), 
 'https://images.unsplash.com/photo-1554224155-6726b3ff858f', 
 'https://images.unsplash.com/photo-1554224155-6726b3ff858f', 
 4.1, 45, '60-120 min', 10000, 'Rue des Services, Conakry', '+224 123 456 805', 'info@documentservices.com', '08:00-17:00', 'Services', 9.5530, -13.6940, true, true),

-- Colis
('Express Delivery', 'Services de livraison express', 
 (SELECT id FROM business_types WHERE name = 'packages'), 
 (SELECT id FROM categories WHERE name = 'Colis'), 
 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088', 
 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088', 
 4.3, 156, '30-90 min', 8000, 'Avenue de la Livraison, Conakry', '+224 123 456 806', 'contact@expressdelivery.com', '07:00-20:00', 'Livraison', 9.5540, -13.6950, true, true)

ON CONFLICT (id) DO NOTHING;

-- (9) Insertion des zones de livraison
INSERT INTO delivery_zones (name, delivery_fee, delivery_time, is_active) VALUES
('Zone Centre', 3000, '15-25 min', true),
('Zone Nord', 4000, '20-35 min', true),
('Zone Sud', 4500, '25-40 min', true),
('Zone Est', 5000, '30-45 min', true),
('Zone Ouest', 5500, '35-50 min', true)
ON CONFLICT (id) DO NOTHING;

-- (10) Insertion des paramètres de l'application
INSERT INTO app_settings (key, value, description) VALUES
('delivery_radius', '{"default": 10, "max": 25}', 'Rayon de livraison en km'),
('delivery_fees', '{"base": 3000, "per_km": 500}', 'Frais de livraison de base'),
('commission_rate', '{"restaurant": 0.15, "driver": 0.20}', 'Taux de commission'),
('min_order_amount', '{"default": 5000}', 'Montant minimum de commande'),
('max_delivery_time', '{"default": 90}', 'Temps de livraison maximum en minutes')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Données de test insérées avec succès!';
    RAISE NOTICE '📋 Types de commerce: 14 types';
    RAISE NOTICE '🏪 Commerces/services: 18 commerces';
    RAISE NOTICE '📂 Catégories: 14 catégories';
    RAISE NOTICE '🔧 Configuration: 5 paramètres';
    RAISE NOTICE '🚚 Zones de livraison: 5 zones';
END $$; 