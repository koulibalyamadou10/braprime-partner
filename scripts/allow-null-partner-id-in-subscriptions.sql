-- Permettre partner_id à être null temporairement dans partner_subscriptions
-- Cela permet de créer l'abonnement pendant l'inscription avant que le business soit créé

-- Modifier la contrainte pour permettre null
ALTER TABLE partner_subscriptions 
ALTER COLUMN partner_id DROP NOT NULL;

-- Ajouter un commentaire pour expliquer pourquoi partner_id peut être null
COMMENT ON COLUMN partner_subscriptions.partner_id IS 'ID du business partenaire. Peut être null temporairement pendant l\'inscription, sera mis à jour après approbation.';

-- Créer un index pour optimiser les requêtes avec partner_id null
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_null_partner ON partner_subscriptions(partner_id) WHERE partner_id IS NULL;

-- Créer un index pour les abonnements en attente
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_pending ON partner_subscriptions(status) WHERE status = 'pending'; 