-- Ajouter la colonne current_subscription_id à la table businesses
-- Cette colonne permettra de lier directement un business à son abonnement actuel

-- Ajouter la colonne current_subscription_id
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS current_subscription_id uuid REFERENCES partner_subscriptions(id);

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_businesses_current_subscription ON businesses(current_subscription_id);

-- Mettre à jour les businesses existants avec leur abonnement actuel
UPDATE businesses 
SET current_subscription_id = (
  SELECT ps.id 
  FROM partner_subscriptions ps 
  WHERE ps.partner_id = businesses.id 
  AND ps.status = 'active'
  ORDER BY ps.created_at DESC 
  LIMIT 1
)
WHERE current_subscription_id IS NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN businesses.current_subscription_id IS 'ID de l\'abonnement actuel du business (référence vers partner_subscriptions)'; 