-- Script de configuration pour la gestion des partenaires
-- Ce script s'assure que toutes les tables et contraintes nécessaires sont en place

-- 1. Vérifier et créer le bucket de stockage pour les avatars s'il n'existe pas
-- Note: Cette commande doit être exécutée manuellement dans l'interface Supabase
-- CREATE BUCKET IF NOT EXISTS avatars;

-- 2. Créer une politique RLS pour le bucket avatars
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY IF NOT EXISTS "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY IF NOT EXISTS "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Créer une fonction pour créer automatiquement un profil utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    id,
    name,
    email,
    phone_number,
    profile_image,
    is_active,
    is_verified,
    role_id
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'profile_image', null),
    COALESCE((NEW.raw_user_meta_data->>'is_active')::boolean, true),
    COALESCE((NEW.raw_user_meta_data->>'is_verified')::boolean, false),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN (SELECT id FROM user_roles WHERE name = 'admin')
      WHEN NEW.raw_user_meta_data->>'role' = 'partner' THEN (SELECT id FROM user_roles WHERE name = 'partner')
      WHEN NEW.raw_user_meta_data->>'role' = 'driver' THEN (SELECT id FROM user_roles WHERE name = 'driver')
      ELSE (SELECT id FROM user_roles WHERE name = 'customer')
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer le trigger pour la création automatique de profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Créer une fonction pour créer un partenaire avec validation
CREATE OR REPLACE FUNCTION create_partner_with_business(
    p_name TEXT,
    p_email TEXT,
    p_phone_number TEXT,
    p_password TEXT,
    p_business_name TEXT,
    p_business_address TEXT,
    p_business_type_id INTEGER DEFAULT 1,
    p_category_id INTEGER DEFAULT 1,
    p_is_active BOOLEAN DEFAULT true,
    p_is_verified BOOLEAN DEFAULT false
)
RETURNS TABLE (
    user_id UUID,
    business_id INTEGER,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_business_id INTEGER;
    v_role_id INTEGER;
BEGIN
    -- Vérifier que l'email n'existe pas déjà
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RETURN QUERY SELECT NULL::UUID, NULL::INTEGER, false, 'Cet email est déjà utilisé';
        RETURN;
    END IF;

    -- Récupérer l'ID du rôle partenaire
    SELECT id INTO v_role_id FROM user_roles WHERE name = 'partner';
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, NULL::INTEGER, false, 'Rôle partenaire non trouvé';
        RETURN;
    END IF;

    -- Créer le compte utilisateur dans auth.users
    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data
    ) VALUES (
        p_email,
        crypt(p_password, gen_salt('bf')),
        NOW(),
        jsonb_build_object(
            'name', p_name,
            'phone_number', p_phone_number,
            'role', 'partner',
            'is_active', p_is_active,
            'is_verified', p_is_verified
        )
    ) RETURNING id INTO v_user_id;

    -- Créer le profil utilisateur
    INSERT INTO user_profiles (
        id,
        name,
        email,
        phone_number,
        is_active,
        is_verified,
        role_id
    ) VALUES (
        v_user_id,
        p_name,
        p_email,
        p_phone_number,
        p_is_active,
        p_is_verified,
        v_role_id
    );

    -- Créer le commerce associé
    INSERT INTO businesses (
        name,
        description,
        business_type_id,
        category_id,
        address,
        owner_id,
        rating,
        review_count,
        total_orders,
        total_revenue,
        is_active,
        is_open
    ) VALUES (
        p_business_name,
        'Commerce créé automatiquement pour ' || p_name,
        p_business_type_id,
        p_category_id,
        p_business_address,
        v_user_id,
        0,
        0,
        0,
        0,
        p_is_active,
        false
    ) RETURNING id INTO v_business_id;

    RETURN QUERY SELECT v_user_id, v_business_id, true, 'Partenaire créé avec succès';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer une fonction pour obtenir les statistiques des partenaires
CREATE OR REPLACE FUNCTION get_partner_stats()
RETURNS TABLE (
    total_partners BIGINT,
    active_partners BIGINT,
    verified_partners BIGINT,
    partners_with_businesses BIGINT,
    average_businesses_per_partner NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT up.id) as total_partners,
        COUNT(DISTINCT up.id) FILTER (WHERE up.is_active) as active_partners,
        COUNT(DISTINCT up.id) FILTER (WHERE up.is_verified) as verified_partners,
        COUNT(DISTINCT b.owner_id) as partners_with_businesses,
        ROUND(AVG(business_count), 1) as average_businesses_per_partner
    FROM user_profiles up
    LEFT JOIN user_roles ur ON up.role_id = ur.id
    LEFT JOIN (
        SELECT owner_id, COUNT(*) as business_count
        FROM businesses
        GROUP BY owner_id
    ) b ON up.id = b.owner_id
    WHERE ur.name = 'partner';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Créer une vue pour les partenaires avec leurs commerces
CREATE OR REPLACE VIEW partners_with_businesses AS
SELECT 
    up.*,
    ur.name as role_name,
    COUNT(b.id) as business_count,
    SUM(b.total_orders) as total_orders,
    SUM(b.total_revenue) as total_revenue,
    AVG(b.rating) as average_rating
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
LEFT JOIN businesses b ON up.id = b.owner_id
WHERE ur.name = 'partner'
GROUP BY up.id, ur.name;

-- 8. Créer des politiques RLS pour la gestion des partenaires
-- Permettre aux admins de voir tous les profils utilisateurs
CREATE POLICY IF NOT EXISTS "Admins can view all user profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile
            JOIN user_roles admin_role ON admin_profile.role_id = admin_role.id
            WHERE admin_profile.id = auth.uid() AND admin_role.name = 'admin'
        )
    );

-- Permettre aux admins de modifier tous les profils utilisateurs
CREATE POLICY IF NOT EXISTS "Admins can update all user profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile
            JOIN user_roles admin_role ON admin_profile.role_id = admin_role.id
            WHERE admin_profile.id = auth.uid() AND admin_role.name = 'admin'
        )
    );

-- Permettre aux utilisateurs de voir leur propre profil
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

-- Permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

-- 9. Activer RLS sur la table user_profiles si ce n'est pas déjà fait
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 10. Créer un trigger pour mettre à jour les métadonnées utilisateur
CREATE OR REPLACE FUNCTION update_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour les métadonnées dans auth.users
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_build_object(
        'name', NEW.name,
        'phone_number', NEW.phone_number,
        'profile_image', NEW.profile_image,
        'is_active', NEW.is_active,
        'is_verified', NEW.is_verified
    )
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger s'il n'existe pas
DROP TRIGGER IF EXISTS trigger_update_user_metadata ON user_profiles;
CREATE TRIGGER trigger_update_user_metadata
    AFTER UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_metadata();

-- 11. Créer une fonction pour valider un partenaire
CREATE OR REPLACE FUNCTION verify_partner(partner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_profiles 
    SET is_verified = true, updated_at = NOW()
    WHERE id = partner_id AND EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.id = user_profiles.role_id AND ur.name = 'partner'
    );
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Créer une fonction pour désactiver un partenaire
CREATE OR REPLACE FUNCTION deactivate_partner(partner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Désactiver le profil utilisateur
    UPDATE user_profiles 
    SET is_active = false, updated_at = NOW()
    WHERE id = partner_id;
    
    -- Désactiver tous les commerces du partenaire
    UPDATE businesses 
    SET is_active = false, is_open = false
    WHERE owner_id = partner_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Message de confirmation
SELECT 'Configuration de la gestion des partenaires terminée avec succès!' as message; 