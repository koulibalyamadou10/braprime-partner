-- Script pour ajouter les colonnes nécessaires à la table businesses
-- Ce script ajoute les colonnes pour gérer les abonnements partenaires

-- 1. Vérifier si les colonnes existent déjà
SELECT '=== VÉRIFICATION COLONNES ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name IN ('requires_subscription', 'subscription_status');

-- 2. Ajouter la colonne requires_subscription si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'businesses' AND column_name = 'requires_subscription'
    ) THEN
        ALTER TABLE businesses ADD COLUMN requires_subscription BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne requires_subscription ajoutée';
    ELSE
        RAISE NOTICE 'Colonne requires_subscription existe déjà';
    END IF;
END $$;

-- 3. Ajouter la colonne subscription_status si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'businesses' AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE businesses ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'none' CHECK (subscription_status IN ('none', 'pending', 'active', 'expired'));
        RAISE NOTICE 'Colonne subscription_status ajoutée';
    ELSE
        RAISE NOTICE 'Colonne subscription_status existe déjà';
    END IF;
END $$;

-- 4. Mettre à jour les businesses existants pour les partenaires
UPDATE businesses 
SET requires_subscription = true, subscription_status = 'pending'
WHERE owner_id IN (
    SELECT up.id 
    FROM user_profiles up 
    JOIN user_roles ur ON up.role_id = ur.id 
    WHERE ur.name = 'partner'
);

-- 5. Vérifier les modifications
SELECT '=== RÉSULTAT FINAL ===' as info;
SELECT 
    id,
    name,
    owner_id,
    is_active,
    requires_subscription,
    subscription_status
FROM businesses 
WHERE requires_subscription = true
LIMIT 10;

-- 6. Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_businesses_requires_subscription ON businesses(requires_subscription);
CREATE INDEX IF NOT EXISTS idx_businesses_subscription_status ON businesses(subscription_status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_subscription ON businesses(owner_id, requires_subscription, subscription_status);

-- 7. Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN businesses.requires_subscription IS 'Indique si le business nécessite un abonnement pour être actif';
COMMENT ON COLUMN businesses.subscription_status IS 'Statut de l''abonnement: none, pending, active, expired'; 