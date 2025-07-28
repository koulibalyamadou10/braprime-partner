-- SCRIPT POUR AJOUTER LES COLONNES MANQUANTES À LA TABLE REQUESTS
-- Ce script ajoute les colonnes nécessaires pour stocker toutes les informations de la demande partenaire

-- Vérifier si la table requests existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'requests') THEN
    RAISE EXCEPTION 'La table requests n''existe pas!';
  END IF;
END $$;

-- Ajouter les colonnes manquantes si elles n'existent pas
DO $$
BEGIN
  -- Ajouter business_phone si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'business_phone') THEN
    ALTER TABLE requests ADD COLUMN business_phone character varying;
    RAISE NOTICE 'Colonne business_phone ajoutée';
  END IF;

  -- Ajouter business_email si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'business_email') THEN
    ALTER TABLE requests ADD COLUMN business_email character varying;
    RAISE NOTICE 'Colonne business_email ajoutée';
  END IF;

  -- Ajouter business_description si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'business_description') THEN
    ALTER TABLE requests ADD COLUMN business_description text;
    RAISE NOTICE 'Colonne business_description ajoutée';
  END IF;

  -- Ajouter opening_hours si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'opening_hours') THEN
    ALTER TABLE requests ADD COLUMN opening_hours character varying;
    RAISE NOTICE 'Colonne opening_hours ajoutée';
  END IF;

  -- Ajouter delivery_radius si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'delivery_radius') THEN
    ALTER TABLE requests ADD COLUMN delivery_radius integer;
    RAISE NOTICE 'Colonne delivery_radius ajoutée';
  END IF;

  -- Ajouter cuisine_type si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'cuisine_type') THEN
    ALTER TABLE requests ADD COLUMN cuisine_type character varying;
    RAISE NOTICE 'Colonne cuisine_type ajoutée';
  END IF;

  -- Ajouter specialties si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'specialties') THEN
    ALTER TABLE requests ADD COLUMN specialties jsonb DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Colonne specialties ajoutée';
  END IF;

  -- Ajouter metadata si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'metadata') THEN
    ALTER TABLE requests ADD COLUMN metadata jsonb;
    RAISE NOTICE 'Colonne metadata ajoutée';
  END IF;

END $$;

-- Afficher la structure finale de la table
SELECT 'Structure de la table requests:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'requests' 
ORDER BY ordinal_position;

-- Message de confirmation
SELECT '✅ Colonnes ajoutées avec succès à la table requests!' as message; 