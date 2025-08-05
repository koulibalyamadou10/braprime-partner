-- Script pour configurer complètement le système de chauffeurs
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes manquantes à la table drivers
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS request_status VARCHAR(20) DEFAULT 'approved' CHECK (request_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS request_notes TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES user_profiles(id);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS application_date TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS documents_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS availability_hours TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS preferred_zones TEXT[];

-- 2. Créer la fonction create_driver_request
CREATE OR REPLACE FUNCTION create_driver_request(
  p_name VARCHAR(100),
  p_email VARCHAR(255),
  p_phone VARCHAR(20),
  p_vehicle_type VARCHAR(50),
  p_vehicle_plate VARCHAR(20),
  p_driver_type VARCHAR(20) DEFAULT 'independent',
  p_experience_years INTEGER DEFAULT 0,
  p_availability_hours TEXT DEFAULT NULL,
  p_preferred_zones TEXT[] DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_driver_id uuid;
BEGIN
  -- Créer le chauffeur avec statut de demande
  INSERT INTO drivers (
    name,
    email,
    phone,
    vehicle_type,
    vehicle_plate,
    driver_type,
    is_active,
    is_verified,
    request_status,
    request_notes,
    application_date,
    experience_years,
    availability_hours,
    preferred_zones,
    total_deliveries,
    total_earnings,
    rating
  ) VALUES (
    p_name,
    p_email,
    p_phone,
    p_vehicle_type,
    p_vehicle_plate,
    p_driver_type,
    false, -- Inactif en attente d'approbation
    false, -- Non vérifié en attente
    'pending',
    p_notes,
    now(),
    p_experience_years,
    p_availability_hours,
    p_preferred_zones,
    0,
    0,
    0
  ) RETURNING id INTO v_driver_id;
  
  RAISE NOTICE 'Demande chauffeur créée: Driver ID %', v_driver_id;
  
  RETURN v_driver_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer la fonction approve_driver_request
CREATE OR REPLACE FUNCTION approve_driver_request(
  p_driver_id uuid,
  p_user_id uuid
) RETURNS boolean AS $$
BEGIN
  -- Mettre à jour le chauffeur
  UPDATE drivers 
  SET 
    request_status = 'approved',
    user_id = p_user_id,
    is_active = true,
    is_verified = true,
    reviewed_at = now(),
    reviewed_by = p_user_id,
    updated_at = now()
  WHERE id = p_driver_id;
  
  RAISE NOTICE 'Demande chauffeur approuvée: Driver ID %, User ID %', p_driver_id, p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer la fonction reject_driver_request
CREATE OR REPLACE FUNCTION reject_driver_request(
  p_driver_id uuid,
  p_reason text DEFAULT NULL
) RETURNS boolean AS $$
BEGIN
  -- Marquer comme rejetée
  UPDATE drivers 
  SET 
    request_status = 'rejected',
    request_notes = COALESCE(request_notes, '') || E'\nRejeté le ' || now() || ': ' || COALESCE(p_reason, 'Aucune raison spécifiée'),
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_driver_id;
  
  RAISE NOTICE 'Demande chauffeur rejetée: Driver ID %', p_driver_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer des politiques RLS pour les chauffeurs
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (accès complet)
CREATE POLICY "Admins can manage all drivers" ON drivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Politique pour les partenaires (voir leurs chauffeurs)
CREATE POLICY "Partners can view their drivers" ON drivers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = drivers.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Politique pour les chauffeurs (voir leur propre profil)
CREATE POLICY "Drivers can view own profile" ON drivers
  FOR SELECT USING (
    drivers.user_id = auth.uid()
  );

-- Politique pour les chauffeurs (modifier leur propre profil)
CREATE POLICY "Drivers can update own profile" ON drivers
  FOR UPDATE USING (
    drivers.user_id = auth.uid()
  );

-- 6. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_drivers_request_status ON drivers(request_status);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_business_id ON drivers(business_id);
CREATE INDEX IF NOT EXISTS idx_drivers_is_active ON drivers(is_active);

-- 7. Vérifier que tout fonctionne
SELECT 'Configuration chauffeurs terminée' as status; 