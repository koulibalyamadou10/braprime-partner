-- ============================================================================
-- AJOUT DU CHAMP "POINT DE REPÈRE" À LA TABLE ORDERS
-- ============================================================================
-- Ce script ajoute un champ landmark pour les points de repère dans les commandes

-- Ajouter la colonne landmark à la table orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS landmark VARCHAR(255);

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN orders.landmark IS 'Point de repère pour faciliter la livraison (ex: près de la pharmacie, derrière la mosquée, etc.)';

-- Créer un index pour optimiser les recherches par point de repère
CREATE INDEX IF NOT EXISTS idx_orders_landmark ON orders(landmark) WHERE landmark IS NOT NULL;

-- Mettre à jour les vues existantes si nécessaire
-- (Les vues seront automatiquement mises à jour avec le nouveau champ)

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Vérifier que la colonne a été ajoutée
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'landmark';

-- Afficher la structure mise à jour de la table orders
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position; 