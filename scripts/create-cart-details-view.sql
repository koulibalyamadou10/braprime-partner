-- SCRIPT POUR CRÉER LA VUE CART_DETAILS
-- Cette vue fournit une vue détaillée du panier avec les informations des items

-- Supprimer la vue si elle existe déjà
DROP VIEW IF EXISTS cart_details;

-- Créer la vue cart_details
CREATE OR REPLACE VIEW cart_details AS
SELECT 
  c.id as cart_id,
  c.user_id,
  c.business_id,
  c.business_name,
  c.items,
  c.delivery_method,
  c.delivery_address,
  c.delivery_instructions,
  c.created_at as cart_created_at,
  c.updated_at as cart_updated_at,
  
  -- Informations du business
  b.name as business_name_full,
  b.address as business_address,
  b.phone as business_phone,
  b.email as business_email,
  b.opening_hours,
  b.delivery_time,
  b.delivery_fee,
  b.is_open,
  b.is_active,
  
  -- Informations de l'utilisateur
  up.name as user_name,
  up.email as user_email,
  up.phone_number as user_phone,
  
  -- Calculs du panier
  COALESCE(
    (SELECT SUM((item->>'price')::numeric * (item->>'quantity')::integer)
     FROM jsonb_array_elements(c.items) as item
     WHERE item->>'price' IS NOT NULL AND item->>'quantity' IS NOT NULL
    ), 0
  ) as total,
  
  -- Nombre total d'items
  COALESCE(
    (SELECT SUM((item->>'quantity')::integer)
     FROM jsonb_array_elements(c.items) as item
     WHERE item->>'quantity' IS NOT NULL
    ), 0
  ) as item_count,
  
  -- Nombre d'items uniques
  COALESCE(jsonb_array_length(c.items), 0) as unique_items_count,
  
  -- Total final avec frais de livraison
  COALESCE(
    (SELECT SUM((item->>'price')::numeric * (item->>'quantity')::integer)
     FROM jsonb_array_elements(c.items) as item
     WHERE item->>'price' IS NOT NULL AND item->>'quantity' IS NOT NULL
    ), 0
  ) + COALESCE(b.delivery_fee, 0) as grand_total

FROM cart c
LEFT JOIN businesses b ON c.business_id = b.id
LEFT JOIN user_profiles up ON c.user_id = up.id
WHERE c.items IS NOT NULL AND jsonb_array_length(c.items) > 0;

-- Ajouter des commentaires à la vue
COMMENT ON VIEW cart_details IS 'Vue détaillée du panier avec informations business et utilisateur';

-- Donner les permissions de lecture
GRANT SELECT ON cart_details TO authenticated, anon;

-- Tester la vue
DO $$
BEGIN
  -- Vérifier si la vue a été créée
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'cart_details') THEN
    RAISE NOTICE '✅ Vue cart_details créée avec succès!';
    
    -- Tester avec un panier existant
    IF EXISTS (SELECT 1 FROM cart LIMIT 1) THEN
      RAISE NOTICE 'Test de la vue cart_details:';
      -- La vue sera testée automatiquement lors de l'utilisation
    ELSE
      RAISE NOTICE 'Aucun panier trouvé pour tester la vue';
    END IF;
  ELSE
    RAISE EXCEPTION '❌ Erreur lors de la création de la vue cart_details';
  END IF;
END $$;

-- Afficher un message de confirmation
SELECT '✅ Vue cart_details créée avec succès!' as message; 