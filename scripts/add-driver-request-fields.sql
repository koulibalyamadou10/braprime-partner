-- Script pour ajouter les champs de demande à la table drivers
-- Similaire à ce qui a été fait pour businesses

-- Supprimer les fonctions existantes pour éviter les conflits
DROP FUNCTION IF EXISTS create_driver_request(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, TEXT, TEXT[], TEXT);
DROP FUNCTION IF EXISTS approve_driver_request(UUID, UUID);
DROP FUNCTION IF EXISTS approve_driver_request_with_account(UUID, TEXT);
DROP FUNCTION IF EXISTS reject_driver_request(UUID, TEXT);

-- S'assurer que les extensions nécessaires sont installées
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ajouter les colonnes pour les demandes de chauffeur
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS request_status VARCHAR(20) DEFAULT 'approved' CHECK (request_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS request_notes TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES user_profiles(id);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS application_date TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS documents_status VARCHAR(20) DEFAULT 'pending' CHECK (documents_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS availability_hours TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS preferred_zones TEXT[];

-- Créer la fonction pour créer une demande de chauffeur
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
  INSERT INTO drivers (
    name, email, phone, vehicle_type, vehicle_plate, driver_type,
    is_active, is_verified, request_status, request_notes, application_date,
    experience_years, availability_hours, preferred_zones, total_deliveries, total_earnings, rating
  ) VALUES (
    p_name, p_email, p_phone, p_vehicle_type, p_vehicle_plate, p_driver_type,
    false, false, 'pending', p_notes, now(),
    p_experience_years, p_availability_hours, p_preferred_zones, 0, 0, 0
  ) RETURNING id INTO v_driver_id;
  RETURN v_driver_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer la fonction pour approuver une demande de chauffeur
CREATE OR REPLACE FUNCTION approve_driver_request(
  p_driver_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE drivers SET
    request_status = 'approved',
    user_id = p_user_id,
    is_active = true,
    is_verified = true,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_driver_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer la fonction pour approuver une demande et créer le compte utilisateur
CREATE OR REPLACE FUNCTION approve_driver_request_with_account(
  p_driver_id UUID,
  p_admin_notes TEXT DEFAULT ''
) RETURNS JSON AS $$
DECLARE
  v_driver RECORD;
  v_user_id UUID;
  v_password VARCHAR(50);
  v_result JSON;
BEGIN
  -- Récupérer les informations du chauffeur
  SELECT * INTO v_driver FROM drivers WHERE id = p_driver_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Chauffeur non trouvé');
  END IF;
  
  -- Générer un mot de passe aléatoire
  v_password := substr(md5(random()::text), 1, 12);
  
  -- Créer l'utilisateur dans auth.users (côté serveur)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    (SELECT id FROM auth.instances LIMIT 1),
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_driver.email,
    crypt(v_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    json_build_object('provider', 'email', 'providers', ARRAY['email']),
    json_build_object('name', v_driver.name, 'role', 'driver'),
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;
  
  -- Créer le profil utilisateur
  INSERT INTO user_profiles (
    id, name, email, phone, role, is_active, created_at
  ) VALUES (
    v_user_id, v_driver.name, v_driver.email, v_driver.phone, 'driver', true, now()
  );
  
  -- Mettre à jour le chauffeur
  UPDATE drivers SET
    request_status = 'approved',
    user_id = v_user_id,
    is_active = true,
    is_verified = true,
    reviewed_at = now(),
    updated_at = now(),
    request_notes = CASE 
      WHEN p_admin_notes != '' THEN p_admin_notes 
      ELSE request_notes 
    END
  WHERE id = p_driver_id;
  
  -- Retourner les identifiants
  v_result := json_build_object(
    'success', true,
    'credentials', json_build_object(
      'email', v_driver.email,
      'password', v_password,
      'driverName', v_driver.name,
      'dashboardUrl', 'https://bradelivery.com/driver-dashboard'
    )
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer la fonction pour rejeter une demande de chauffeur
CREATE OR REPLACE FUNCTION reject_driver_request(
  p_driver_id UUID,
  p_reason TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE drivers SET
    request_status = 'rejected',
    request_notes = p_reason,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_driver_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter les politiques RLS pour les chauffeurs
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (peuvent voir tous les chauffeurs)
CREATE POLICY "Admins can view all drivers" ON drivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Politique pour les partenaires (peuvent voir leurs chauffeurs affiliés)
CREATE POLICY "Partners can view their affiliated drivers" ON drivers
  FOR SELECT USING (
    driver_type = 'service' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'partner'
    )
  );

-- Politique pour les chauffeurs (peuvent voir leur propre profil)
CREATE POLICY "Drivers can view their own profile" ON drivers
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Politique pour les utilisateurs anonymes (peuvent créer des demandes)
CREATE POLICY "Anonymous users can create driver requests" ON drivers
  FOR INSERT WITH CHECK (
    request_status = 'pending' AND user_id IS NULL
  );

-- Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_drivers_request_status ON drivers(request_status);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_application_date ON drivers(application_date);

-- 6. Vérifier la structure créée
SELECT 
  'Structure vérifiée' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'drivers' 
  AND column_name IN ('request_status', 'request_notes', 'application_date', 'experience_years', 'availability_hours', 'preferred_zones')
ORDER BY column_name;

-- 7. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Migration chauffeurs terminée!';
  RAISE NOTICE '📋 Nouvelles fonctions créées:';
  RAISE NOTICE '  - create_driver_request()';
  RAISE NOTICE '  - approve_driver_request()';
  RAISE NOTICE '  - reject_driver_request()';
  RAISE NOTICE '💡 Les demandes chauffeurs peuvent maintenant être créées directement dans drivers';
END $$; 