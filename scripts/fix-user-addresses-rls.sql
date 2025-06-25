-- ============================================================================
-- SCRIPT DE CONFIGURATION RLS POUR LA TABLE USER_ADDRESSES
-- ============================================================================
-- Ce script configure les politiques RLS pour permettre aux utilisateurs
-- de gérer leurs propres adresses

-- ============================================================================
-- VÉRIFICATION ET CONFIGURATION RLS
-- ============================================================================

-- Vérifier si RLS est activé sur user_addresses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_addresses' 
    AND schemaname = 'public'
    AND rowsecurity = true
  ) THEN
    -- Activer RLS si ce n'est pas déjà fait
    ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS activé sur user_addresses';
  ELSE
    RAISE NOTICE 'RLS déjà activé sur user_addresses';
  END IF;
END $$;

-- ============================================================================
-- SUPPRESSION DES POLITIQUES EXISTANTES (SI ELLES EXISTENT)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON user_addresses;

-- ============================================================================
-- CRÉATION DES POLITIQUES RLS
-- ============================================================================

-- Politique pour permettre aux utilisateurs de voir leurs propres adresses
CREATE POLICY "Users can view their own addresses" ON user_addresses
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Politique pour permettre aux utilisateurs de créer leurs propres adresses
CREATE POLICY "Users can insert their own addresses" ON user_addresses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres adresses
CREATE POLICY "Users can update their own addresses" ON user_addresses
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Politique pour permettre aux utilisateurs de supprimer leurs propres adresses
CREATE POLICY "Users can delete their own addresses" ON user_addresses
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES CRÉÉES
-- ============================================================================

DO $$
DECLARE
  policies_count INTEGER;
BEGIN
  -- Compter les politiques créées
  SELECT COUNT(*) INTO policies_count 
  FROM pg_policies 
  WHERE tablename = 'user_addresses' 
    AND schemaname = 'public';
  
  -- Afficher le rapport
  RAISE NOTICE '=== RAPPORT DE CONFIGURATION USER_ADDRESSES ===';
  RAISE NOTICE 'Politiques RLS créées: %', policies_count;
  RAISE NOTICE 'RLS activé: OUI';
  RAISE NOTICE 'Configuration terminée avec succès!';
  
  -- Afficher les politiques créées
  RAISE NOTICE 'Politiques créées:';
  RAISE NOTICE '- Users can view their own addresses';
  RAISE NOTICE '- Users can insert their own addresses';
  RAISE NOTICE '- Users can update their own addresses';
  RAISE NOTICE '- Users can delete their own addresses';
END $$;

-- ============================================================================
-- VÉRIFICATION DE LA TABLE ET DE LA STRUCTURE
-- ============================================================================

-- Si la table n'existe pas, la créer
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    country TEXT DEFAULT 'Guinée',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(user_id, is_default);

-- Créer une fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer un trigger pour mettre à jour automatiquement le timestamp
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER update_user_addresses_updated_at
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Créer une fonction pour s'assurer qu'une seule adresse est par défaut par utilisateur
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    -- Si on définit une nouvelle adresse comme par défaut
    IF NEW.is_default = TRUE THEN
        -- Mettre à jour toutes les autres adresses de l'utilisateur pour qu'elles ne soient pas par défaut
        UPDATE user_addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer un trigger pour s'assurer qu'une seule adresse est par défaut
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON user_addresses;
CREATE TRIGGER ensure_single_default_address_trigger
    BEFORE INSERT OR UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_address();

-- Vérification finale
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_addresses';

-- Message de confirmation
SELECT 'Configuration RLS terminée pour la table user_addresses' as status; 