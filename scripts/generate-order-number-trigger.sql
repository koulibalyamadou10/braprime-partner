-- ============================================================================
-- TRIGGER POUR GÉNÉRER DES NUMÉROS DE COMMANDE FORMATÉS
-- ============================================================================
-- Ce trigger génère automatiquement un numéro de commande formaté
-- Format: [BUSINESS]-[DATE]-[ID_COURT]
-- Exemple: "RESTAURANT-2024-01-15-ABC123"

-- Fonction pour générer un numéro de commande formaté
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    business_name VARCHAR(50);
    business_prefix VARCHAR(10);
    order_date VARCHAR(10);
    short_id VARCHAR(6);
    order_number VARCHAR(100);
BEGIN
    -- Récupérer le nom du business
    SELECT name INTO business_name
    FROM businesses
    WHERE id = NEW.business_id;
    
    -- Créer un préfixe à partir du nom du business (max 10 caractères)
    business_prefix := UPPER(SUBSTRING(REPLACE(business_name, ' ', ''), 1, 10));
    
    -- Formater la date (YYYY-MM-DD)
    order_date := TO_CHAR(NEW.created_at::date, 'YYYY-MM-DD');
    
    -- Créer un ID court à partir de l'UUID (6 caractères)
    short_id := UPPER(SUBSTRING(NEW.id::text, 1, 6));
    
    -- Combiner pour créer le numéro de commande
    order_number := business_prefix || '-' || order_date || '-' || short_id;
    
    -- Mettre à jour le champ order_number
    NEW.order_number := order_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajouter la colonne order_number si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'order_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN order_number VARCHAR(100);
    END IF;
END $$;

-- Créer un index unique sur order_number
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number 
ON orders(order_number) 
WHERE order_number IS NOT NULL;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;

-- Créer le trigger
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- ============================================================================
-- FONCTION POUR MIGRER LES COMMANDES EXISTANTES
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_existing_order_numbers()
RETURNS void AS $$
DECLARE
    order_record RECORD;
    business_name VARCHAR(50);
    business_prefix VARCHAR(10);
    order_date VARCHAR(10);
    short_id VARCHAR(6);
    order_number VARCHAR(100);
BEGIN
    -- Parcourir toutes les commandes existantes
    FOR order_record IN 
        SELECT o.id, o.business_id, o.created_at, b.name as business_name
        FROM orders o
        JOIN businesses b ON o.business_id = b.id
        WHERE o.order_number IS NULL OR o.order_number = ''
    LOOP
        -- Créer un préfixe à partir du nom du business
        business_prefix := UPPER(SUBSTRING(REPLACE(order_record.business_name, ' ', ''), 1, 10));
        
        -- Formater la date
        order_date := TO_CHAR(order_record.created_at::date, 'YYYY-MM-DD');
        
        -- Créer un ID court
        short_id := UPPER(SUBSTRING(order_record.id::text, 1, 6));
        
        -- Combiner pour créer le numéro de commande
        order_number := business_prefix || '-' || order_date || '-' || short_id;
        
        -- Mettre à jour la commande
        UPDATE orders 
        SET order_number = order_number
        WHERE id = order_record.id;
        
        RAISE NOTICE 'Commande % mise à jour avec le numéro: %', order_record.id, order_number;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- EXEMPLES D'UTILISATION
-- ============================================================================

-- Pour migrer toutes les commandes existantes :
-- SELECT migrate_existing_order_numbers();

-- Pour voir les numéros de commande générés :
-- SELECT id, order_number, business_name, created_at 
-- FROM orders o 
-- JOIN businesses b ON o.business_id = b.id 
-- ORDER BY created_at DESC;

/*
FORMAT DU NUMÉRO DE COMMANDE :
- Préfixe Business : 10 caractères max (ex: "RESTAURANT")
- Date : YYYY-MM-DD (ex: "2024-01-15")
- ID Court : 6 premiers caractères de l'UUID (ex: "ABC123")
- Résultat : "RESTAURANT-2024-01-15-ABC123"

EXEMPLES DE NUMÉROS GÉNÉRÉS :
- "RESTAURANT-2024-01-15-ABC123"
- "CAFE-2024-01-15-DEF456"
- "PIZZERIA-2024-01-15-GHI789"
- "BURGER-2024-01-15-JKL012"
*/
