-- ============================================================================
-- SCRIPT POUR SIMPLIFIER LA RELATION DRIVER
-- ============================================================================
-- Relation simplifiée: driver_profiles → drivers

-- Supprimer l'ancienne table driver_profiles
DROP TABLE IF EXISTS driver_profiles CASCADE;

-- Créer une nouvelle table driver_profiles simplifiée
CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(driver_id, user_id)
);

-- Index
CREATE INDEX idx_driver_profiles_driver ON driver_profiles(driver_id);
CREATE INDEX idx_driver_profiles_user ON driver_profiles(user_id);
CREATE INDEX idx_driver_profiles_email ON driver_profiles(email);

-- RLS
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques
CREATE POLICY "Drivers can view their own profile" ON driver_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Partners can view their drivers profiles" ON driver_profiles
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );

CREATE POLICY "System can create driver profiles" ON driver_profiles
    FOR INSERT WITH CHECK (true);

-- Fonction pour connecter un driver
CREATE OR REPLACE FUNCTION connect_driver_simple(
    driver_id UUID,
    email VARCHAR(255),
    phone VARCHAR(20),
    password VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    new_profile_id UUID;
BEGIN
    -- Créer l'utilisateur dans auth.users
    INSERT INTO auth.users (
        email, phone, encrypted_password, email_confirmed_at, phone_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data
    ) VALUES (
        email, phone, crypt(password, gen_salt('bf')), NOW(), NOW(),
        NOW(), NOW(),
        jsonb_build_object('role', 'driver', 'driver_id', driver_id),
        jsonb_build_object('name', (SELECT name FROM drivers WHERE id = driver_id), 'phone', phone)
    ) RETURNING id INTO new_user_id;

    -- Créer le profil driver
    INSERT INTO driver_profiles (driver_id, user_id, email, phone)
    VALUES (driver_id, new_user_id, email, phone)
    RETURNING id INTO new_profile_id;

    RETURN json_build_object(
        'success', true,
        'user_id', new_user_id,
        'driver_id', driver_id,
        'profile_id', new_profile_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un compte de test
INSERT INTO businesses (name, description, address, phone, email, business_type_id, owner_id, is_active)
VALUES ('Restaurant Test', 'Test', 'Test', '+224 123 456 789', 'test@restaurant.com', 1, auth.uid(), true)
ON CONFLICT DO NOTHING;

INSERT INTO drivers (name, phone, email, business_id, vehicle_type, vehicle_plate, is_active)
VALUES ('Driver Test', '+224 987 654 321', 'driver.test@brapime.com', 
        (SELECT id FROM businesses WHERE owner_id = auth.uid() LIMIT 1),
        'motorcycle', 'TEST 123', true)
ON CONFLICT (email) DO NOTHING;

SELECT connect_driver_simple(
    (SELECT id FROM drivers WHERE email = 'driver.test@brapime.com'),
    'driver.test@brapime.com',
    '+224 987 654 321',
    'password123'
); 