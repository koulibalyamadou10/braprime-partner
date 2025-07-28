-- SCRIPT POUR CORRIGER LES PARTENAIRES SANS BUSINESS
-- Ce script identifie et corrige les comptes partenaires qui n'ont pas de business associé

-- 1. Identifier les partenaires sans business
SELECT 'PARTENAIRES SANS BUSINESS:' as info;
SELECT 
  up.id as user_id,
  up.name as user_name,
  up.email as user_email,
  up.created_at as account_created
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
WHERE ur.name = 'partner'
  AND up.id NOT IN (
    SELECT DISTINCT owner_id 
    FROM businesses 
    WHERE owner_id IS NOT NULL
  );

-- 2. Identifier les demandes approuvées sans business créé
SELECT 'DEMANDES APPROUVÉES SANS BUSINESS:' as info;
SELECT 
  r.id as request_id,
  r.user_name,
  r.user_email,
  r.business_name,
  r.status,
  r.created_at as request_created,
  r.reviewed_at
FROM requests r
WHERE r.type = 'partner' 
  AND r.status = 'approved'
  AND r.user_id NOT IN (
    SELECT DISTINCT owner_id 
    FROM businesses 
    WHERE owner_id IS NOT NULL
  );

-- 3. Créer les businesses manquants pour les demandes approuvées
DO $$
DECLARE
  request_record RECORD;
  business_type_record RECORD;
  category_record RECORD;
  new_business_id INTEGER;
BEGIN
  FOR request_record IN 
    SELECT * FROM requests 
    WHERE type = 'partner' 
      AND status = 'approved'
      AND user_id NOT IN (
        SELECT DISTINCT owner_id 
        FROM businesses 
        WHERE owner_id IS NOT NULL
      )
  LOOP
    -- Récupérer le type de business
    SELECT * INTO business_type_record 
    FROM business_types 
    WHERE name = request_record.business_type;
    
    IF business_type_record IS NULL THEN
      RAISE NOTICE 'Type de business non trouvé pour la demande %: %', request_record.id, request_record.business_type;
      CONTINUE;
    END IF;
    
    -- Récupérer la catégorie appropriée
    SELECT * INTO category_record 
    FROM categories 
    WHERE name = CASE 
      WHEN request_record.business_type = 'restaurant' THEN 'Restaurants'
      WHEN request_record.business_type = 'cafe' THEN 'Cafés'
      WHEN request_record.business_type = 'market' THEN 'Marchés'
      WHEN request_record.business_type = 'supermarket' THEN 'Supermarchés'
      WHEN request_record.business_type = 'pharmacy' THEN 'Pharmacie'
      WHEN request_record.business_type = 'electronics' THEN 'Électronique'
      WHEN request_record.business_type = 'beauty' THEN 'Beauté'
      ELSE 'Restaurants'
    END;
    
    -- Créer le business
    INSERT INTO businesses (
      name,
      description,
      address,
      phone,
      email,
      opening_hours,
      cuisine_type,
      owner_id,
      business_type_id,
      category_id,
      is_active,
      is_open,
      delivery_time,
      delivery_fee,
      rating,
      review_count,
      created_at,
      updated_at
    ) VALUES (
      request_record.business_name,
      COALESCE(request_record.business_description, ''),
      request_record.business_address,
      request_record.business_phone,
      request_record.business_email,
      request_record.opening_hours,
      request_record.cuisine_type,
      request_record.user_id,
      business_type_record.id,
      COALESCE(category_record.id, NULL),
      true,
      true,
      '30-45 min',
      5000,
      0,
      0,
      NOW(),
      NOW()
    ) RETURNING id INTO new_business_id;
    
    RAISE NOTICE 'Business créé pour la demande %: ID = %, Nom = %', 
      request_record.id, new_business_id, request_record.business_name;
    
    -- Créer les catégories de menu par défaut
    INSERT INTO menu_categories (name, description, business_id, is_active, sort_order)
    SELECT 
      template.category_name,
      template.category_description,
      new_business_id,
      true,
      template.sort_order
    FROM business_type_menu_templates template
    WHERE template.business_type_id = business_type_record.id;
    
    RAISE NOTICE 'Catégories de menu créées pour le business %', new_business_id;
    
  END LOOP;
END $$;

-- 4. Vérifier le résultat
SELECT 'RÉSULTAT APRÈS CORRECTION:' as info;
SELECT 
  up.id as user_id,
  up.name as user_name,
  up.email as user_email,
  b.id as business_id,
  b.name as business_name,
  b.is_active as business_active
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
LEFT JOIN businesses b ON up.id = b.owner_id
WHERE ur.name = 'partner'
ORDER BY up.created_at DESC;

-- Message de confirmation
SELECT '✅ Correction terminée! Tous les partenaires approuvés ont maintenant un business.' as message; 