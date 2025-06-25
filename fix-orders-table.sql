-- ============================================================================
-- CORRECTION DE LA TABLE ORDERS - BRAPRIME
-- ============================================================================

-- Vérifier la structure actuelle de la table orders
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Vérifier les contraintes de la table
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'orders';

-- ============================================================================
-- CORRECTION : VÉRIFIER ET CORRIGER LE TYPE DE LA COLONNE ID
-- ============================================================================

-- Vérifier le type de la colonne id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'id' 
    AND data_type != 'uuid'
  ) THEN
    -- Modifier le type de la colonne id en UUID
    ALTER TABLE orders ALTER COLUMN id TYPE uuid USING id::uuid;
    RAISE NOTICE 'Type de la colonne id modifié en UUID';
  ELSE
    RAISE NOTICE 'Colonne id est déjà de type UUID';
  END IF;
END $$;

-- ============================================================================
-- CORRECTION : RENOMMER LES COLONNES SI NÉCESSAIRE
-- ============================================================================

-- Si restaurant_id existe, le renommer en business_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE orders RENAME COLUMN restaurant_id TO business_id;
    RAISE NOTICE 'Colonne restaurant_id renommée en business_id';
  ELSE
    RAISE NOTICE 'Colonne business_id existe déjà';
  END IF;
END $$;

-- Si restaurant_name existe, le renommer en business_name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'restaurant_name'
  ) THEN
    ALTER TABLE orders RENAME COLUMN restaurant_name TO business_name;
    RAISE NOTICE 'Colonne restaurant_name renommée en business_name';
  ELSE
    RAISE NOTICE 'Colonne business_name existe déjà';
  END IF;
END $$;

-- ============================================================================
-- AJOUTER LES COLONNES MANQUANTES SI NÉCESSAIRE
-- ============================================================================

-- Ajouter business_id s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN business_id INTEGER;
    RAISE NOTICE 'Colonne business_id ajoutée';
  ELSE
    RAISE NOTICE 'Colonne business_id existe déjà';
  END IF;
END $$;

-- Ajouter business_name s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'business_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN business_name TEXT;
    RAISE NOTICE 'Colonne business_name ajoutée';
  ELSE
    RAISE NOTICE 'Colonne business_name existe déjà';
  END IF;
END $$;

-- Ajouter payment_method s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash';
    RAISE NOTICE 'Colonne payment_method ajoutée';
  ELSE
    RAISE NOTICE 'Colonne payment_method existe déjà';
  END IF;
END $$;

-- Ajouter payment_status s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
    RAISE NOTICE 'Colonne payment_status ajoutée';
  ELSE
    RAISE NOTICE 'Colonne payment_status existe déjà';
  END IF;
END $$;

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

-- Afficher la structure finale
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Vérifier qu'il n'y a pas de colonnes en double
SELECT 
  column_name,
  COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'orders'
GROUP BY column_name
HAVING COUNT(*) > 1;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Structure de la table orders vérifiée et corrigée !';
  RAISE NOTICE '📊 La table orders est maintenant compatible avec le nouveau système de commandes';
END $$; 