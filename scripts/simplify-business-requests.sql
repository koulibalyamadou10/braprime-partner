-- Script pour simplifier le système de demandes partenaires
-- Ajouter les champs nécessaires à la table businesses et supprimer requests

-- 1. Ajouter les nouveaux champs à la table businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS request_status VARCHAR(20) DEFAULT 'approved';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS request_notes TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_name VARCHAR(100);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(20);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_phone VARCHAR(20);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_email VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_description TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS opening_hours TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS delivery_radius INTEGER DEFAULT 5;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS cuisine_type VARCHAR(50);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS specialties TEXT[];

-- 2. Pas de migration de données - implémentation seulement
DO $$
BEGIN
  RAISE NOTICE '✅ Aucune migration de données - implémentation de la structure seulement';
END $$;

-- 3. Supprimer la table requests (après migration)
-- DROP TABLE IF EXISTS requests CASCADE;

-- 4. Créer une fonction pour créer une demande partenaire
CREATE OR REPLACE FUNCTION create_partner_request(
  p_owner_name VARCHAR(100),
  p_owner_email VARCHAR(255),
  p_owner_phone VARCHAR(20),
  p_business_name VARCHAR(100),
  p_business_type VARCHAR(50),
  p_business_address TEXT,
  p_business_phone VARCHAR(20),
  p_business_email VARCHAR(255),
  p_business_description TEXT,
  p_opening_hours TEXT,
  p_delivery_radius INTEGER,
  p_cuisine_type VARCHAR(50) DEFAULT NULL,
  p_specialties TEXT[] DEFAULT NULL,
  p_plan_type VARCHAR(50) DEFAULT '1_month',
  p_notes TEXT DEFAULT NULL
) RETURNS integer AS $$
DECLARE
  v_business_id integer;
  v_subscription_id uuid;
  v_plan_record record;
  v_business_type_id integer;
BEGIN
  -- Récupérer les informations du plan
  SELECT * INTO v_plan_record
  FROM subscription_plans 
  WHERE plan_type::text = p_plan_type
  LIMIT 1;
  
  IF v_plan_record IS NULL THEN
    RAISE EXCEPTION 'Plan d''abonnement non trouvé pour le type: %', p_plan_type;
  END IF;
  
  -- Trouver le bon business_type_id
  SELECT id INTO v_business_type_id
  FROM business_types 
  WHERE LOWER(name) = LOWER(p_business_type)
  LIMIT 1;
  
  -- Si pas trouvé, utiliser le premier disponible
  IF v_business_type_id IS NULL THEN
    SELECT id INTO v_business_type_id
    FROM business_types 
    ORDER BY id 
    LIMIT 1;
  END IF;
  
  -- Créer le business avec statut de demande
  INSERT INTO businesses (
    name,
    business_type_id,
    address,
    owner_id,
    is_active,
    requires_subscription,
    subscription_status,
    request_status,
    request_notes,
    owner_name,
    owner_email,
    owner_phone,
    business_phone,
    business_email,
    business_description,
    opening_hours,
    delivery_radius,
    cuisine_type,
    specialties
  ) VALUES (
    p_business_name,
    v_business_type_id,
    p_business_address,
    NULL,
    false,
    true,
    'pending',
    'pending',
    p_notes,
    p_owner_name,
    p_owner_email,
    p_owner_phone,
    p_business_phone,
    p_business_email,
    p_business_description,
    p_opening_hours,
    p_delivery_radius,
    p_cuisine_type,
    p_specialties
  ) RETURNING id INTO v_business_id;
  
  -- Créer l'abonnement directement lié au business
  INSERT INTO partner_subscriptions (
    partner_id,
    plan_id,
    status,
    billing_email,
    billing_phone,
    billing_address,
    monthly_amount,
    start_date,
    end_date
  ) VALUES (
    v_business_id,
    v_plan_record.id,
    'pending',
    p_owner_email,
    p_owner_phone,
    p_business_address,
    v_plan_record.monthly_price,
    now(),
    now() + INTERVAL '1 month'
  ) RETURNING id INTO v_subscription_id;
  
  -- Mettre à jour le business avec l'ID de l'abonnement
  UPDATE businesses 
  SET current_subscription_id = v_subscription_id
  WHERE id = v_business_id;
  
  RAISE NOTICE 'Demande partenaire créée: Business ID %, Subscription ID %', v_business_id, v_subscription_id;
  
  RETURN v_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer une fonction pour approuver une demande
CREATE OR REPLACE FUNCTION approve_partner_request(
  p_business_id integer,
  p_user_id uuid
) RETURNS boolean AS $$
BEGIN
  -- Mettre à jour le business
  UPDATE businesses 
  SET 
    request_status = 'approved',
    owner_id = p_user_id,
    is_active = true,
    updated_at = now()
  WHERE id = p_business_id;
  
  -- Activer l'abonnement
  UPDATE partner_subscriptions 
  SET 
    status = 'pending',
    updated_at = now()
  WHERE partner_id = p_business_id;
  
  RAISE NOTICE 'Demande partenaire approuvée: Business ID %, User ID %', p_business_id, p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer une fonction pour rejeter une demande
CREATE OR REPLACE FUNCTION reject_partner_request(
  p_business_id integer,
  p_reason text DEFAULT NULL
) RETURNS boolean AS $$
BEGIN
  -- Marquer comme rejetée
  UPDATE businesses 
  SET 
    request_status = 'rejected',
    request_notes = COALESCE(request_notes, '') || E'\nRejeté le ' || now() || ': ' || COALESCE(p_reason, 'Aucune raison spécifiée'),
    updated_at = now()
  WHERE id = p_business_id;
  
  -- Supprimer l'abonnement associé
  DELETE FROM partner_subscriptions 
  WHERE partner_id = p_business_id;
  
  RAISE NOTICE 'Demande partenaire rejetée: Business ID %', p_business_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Vérifier la structure créée
SELECT 
  'Structure vérifiée' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
  AND column_name IN ('request_status', 'owner_name', 'owner_email', 'owner_phone', 'business_phone', 'business_email', 'business_description', 'opening_hours', 'delivery_radius', 'cuisine_type', 'specialties')
ORDER BY column_name;

-- 8. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🎉 Migration terminée!';
  RAISE NOTICE '📋 Nouvelles fonctions créées:';
  RAISE NOTICE '  - create_partner_request()';
  RAISE NOTICE '  - approve_partner_request()';
  RAISE NOTICE '  - reject_partner_request()';
  RAISE NOTICE '💡 La table requests peut maintenant être supprimée';
END $$; 