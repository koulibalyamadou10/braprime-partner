-- Script pour ajouter les colonnes statistiques à la table drivers
-- À exécuter sur la base de données existante

-- Ajout des colonnes statistiques
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Mise à jour des gains totaux basée sur les commandes livrées
UPDATE drivers 
SET total_earnings = COALESCE(
    (SELECT SUM(delivery_fee) 
     FROM orders 
     WHERE orders.driver_id = drivers.id 
     AND orders.status = 'delivered'), 
    0.0
);

-- Mise à jour du nombre total de livraisons
UPDATE drivers 
SET total_deliveries = COALESCE(
    (SELECT COUNT(*) 
     FROM orders 
     WHERE orders.driver_id = drivers.id 
     AND orders.status = 'delivered'), 
    0
);

-- Mise à jour de la note moyenne basée sur les avis
UPDATE drivers 
SET rating = COALESCE(
    (SELECT AVG(rating) 
     FROM reviews 
     WHERE reviews.order_id IN (
         SELECT id FROM orders WHERE driver_id = drivers.id
     )), 
    0.0
);

-- Commentaire sur les nouvelles colonnes
COMMENT ON COLUMN drivers.total_earnings IS 'Gains totaux du chauffeur en centimes';
COMMENT ON COLUMN drivers.is_verified IS 'Indique si le chauffeur a été vérifié par l''admin';
COMMENT ON COLUMN drivers.avatar_url IS 'URL de l''avatar du chauffeur'; 