-- Fonction pour créer un compte utilisateur pour un business approuvé
CREATE OR REPLACE FUNCTION create_user_account_for_business(
  p_business_id integer,
  p_password text DEFAULT NULL
) RETURNS json AS $$
DECLARE
  v_business businesses%ROWTYPE;
  v_user_id uuid;
  v_generated_password text;
  v_result json;
BEGIN
  -- Récupérer les informations du business
  SELECT * INTO v_business
  FROM businesses 
  WHERE id = p_business_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business non trouvé';
  END IF;
  
  -- Vérifier que le business est approuvé
  IF v_business.request_status != 'approved' THEN
    RAISE EXCEPTION 'Le business doit être approuvé avant de créer un compte';
  END IF;
  
  -- Vérifier qu'il n'y a pas déjà un owner_id
  IF v_business.owner_id IS NOT NULL THEN
    RAISE EXCEPTION 'Un compte utilisateur existe déjà pour ce business';
  END IF;
  
  -- Générer un mot de passe si non fourni
  IF p_password IS NULL THEN
    v_generated_password := 'BraPrime' || floor(random() * 1000)::text || '!';
  ELSE
    v_generated_password := p_password;
  END IF;
  
  -- Créer le compte utilisateur via l'API Supabase (avec SECURITY DEFINER)
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
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_business.owner_email,
    crypt(v_generated_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;
  
  -- Créer le profil utilisateur avec le bon role_id (11 pour partner)
  INSERT INTO user_profiles (
    id,
    name,
    email,
    phone_number,
    role_id,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_business.owner_name,
    v_business.owner_email,
    v_business.owner_phone,
    11, -- Rôle partenaire (ID 11 selon la table user_roles)
    true,
    now(),
    now()
  );
  
  -- Mettre à jour le business avec l'owner_id
  UPDATE businesses 
  SET 
    owner_id = v_user_id,
    updated_at = now()
  WHERE id = p_business_id;
  
  -- Retourner les informations
  v_result := json_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', v_business.owner_email,
    'password', v_generated_password,
    'business_id', p_business_id
  );
  
  RAISE NOTICE 'Compte utilisateur créé: User ID %, Email %, Business ID %', v_user_id, v_business.owner_email, p_business_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérifier que la fonction a été créée
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_user_account_for_business') THEN
    RAISE NOTICE '✅ Fonction create_user_account_for_business créée avec succès';
  ELSE
    RAISE NOTICE '❌ Erreur: Fonction create_user_account_for_business non créée';
  END IF;
END $$; 