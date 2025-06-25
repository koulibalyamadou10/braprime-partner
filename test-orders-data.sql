-- ============================================================================
-- DONNÉES DE TEST POUR LES COMMANDES BRAPRIME
-- ============================================================================

-- Nettoyer les données existantes (optionnel)
-- DELETE FROM orders WHERE id LIKE 'TEST-%';

-- ============================================================================
-- COMMANDES DE TEST
-- ============================================================================

-- Commande 1: Restaurant Le Petit Baoulé
INSERT INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  tax,
  grand_total,
  delivery_method,
  delivery_address,
  delivery_instructions,
  payment_method,
  payment_status,
  estimated_delivery,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE email = 'client@test.com' LIMIT 1),
  1,
  'Le Petit Baoulé',
  '[
    {
      "id": 1,
      "name": "Poulet Yassa",
      "price": 60000,
      "quantity": 2,
      "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"
    },
    {
      "id": 2,
      "name": "Thiéboudienne",
      "price": 45000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400"
    }
  ]'::jsonb,
  'delivered',
  165000,
  15000,
  29700,
  209700,
  'delivery',
  '123 Rue de la Paix, Kaloum, Conakry',
  'Appelez-moi à l''arrivée',
  'cash',
  'paid',
  (NOW() + INTERVAL '45 minutes')::text,
  NOW(),
  NOW()
);

-- Commande 2: Supermarché City Market
INSERT INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  tax,
  grand_total,
  delivery_method,
  delivery_address,
  delivery_instructions,
  payment_method,
  payment_status,
  estimated_delivery,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE email = 'client@test.com' LIMIT 1),
  2,
  'City Market',
  '[
    {
      "id": 5,
      "name": "Riz Basmati 5kg",
      "price": 25000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400"
    },
    {
      "id": 6,
      "name": "Huile d''olive extra vierge",
      "price": 35000,
      "quantity": 2,
      "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400"
    },
    {
      "id": 7,
      "name": "Poulet frais 1kg",
      "price": 18000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400"
    }
  ]'::jsonb,
  'preparing',
  113000,
  15000,
  20340,
  148340,
  'delivery',
  '456 Avenue de la République, Almamya, Conakry',
  'Livraison entre 14h et 16h',
  'mobile_money',
  'pending',
  (NOW() + INTERVAL '35 minutes')::text,
  NOW(),
  NOW()
);

-- Commande 3: Marché Central
INSERT INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  tax,
  grand_total,
  delivery_method,
  delivery_address,
  delivery_instructions,
  payment_method,
  payment_status,
  estimated_delivery,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE email = 'client@test.com' LIMIT 1),
  3,
  'Marché Central',
  '[
    {
      "id": 10,
      "name": "Tomates fraîches 2kg",
      "price": 8000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400"
    },
    {
      "id": 11,
      "name": "Oignons 1kg",
      "price": 3000,
      "quantity": 2,
      "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400"
    },
    {
      "id": 12,
      "name": "Piments frais 500g",
      "price": 2000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
    }
  ]'::jsonb,
  'confirmed',
  16000,
  15000,
  2880,
  33880,
  'delivery',
  '789 Boulevard du Commerce, Dixinn, Conakry',
  'Livraison rapide si possible',
  'cash',
  'pending',
  (NOW() + INTERVAL '25 minutes')::text,
  NOW(),
  NOW()
);

-- Commande 4: Restaurant La Terrasse (en attente)
INSERT INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  tax,
  grand_total,
  delivery_method,
  delivery_address,
  delivery_instructions,
  payment_method,
  payment_status,
  estimated_delivery,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE email = 'client@test.com' LIMIT 1),
  4,
  'La Terrasse',
  '[
    {
      "id": 15,
      "name": "Salade César",
      "price": 35000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400"
    },
    {
      "id": 16,
      "name": "Steak Frites",
      "price": 75000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"
    },
    {
      "id": 17,
      "name": "Tiramisu",
      "price": 15000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400"
    }
  ]'::jsonb,
  'pending',
  125000,
  15000,
  22500,
  162500,
  'delivery',
  '321 Rue du Port, Kaloum, Conakry',
  'Préférence pour la livraison en soirée',
  'cash',
  'pending',
  (NOW() + INTERVAL '50 minutes')::text,
  NOW(),
  NOW()
);

-- Commande 5: Annulée
INSERT INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  tax,
  grand_total,
  delivery_method,
  delivery_address,
  delivery_instructions,
  payment_method,
  payment_status,
  estimated_delivery,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE email = 'client@test.com' LIMIT 1),
  1,
  'Le Petit Baoulé',
  '[
    {
      "id": 3,
      "name": "Mafé de bœuf",
      "price": 55000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400"
    }
  ]'::jsonb,
  'cancelled',
  55000,
  15000,
  9900,
  79900,
  'delivery',
  '123 Rue de la Paix, Kaloum, Conakry',
  'Annulée par le client',
  'cash',
  'refunded',
  (NOW() + INTERVAL '30 minutes')::text,
  (NOW() - INTERVAL '2 hours'),
  (NOW() - INTERVAL '1 hour')
);

-- ============================================================================
-- COMMANDES AVEC LIVREURS ASSIGNÉS
-- ============================================================================

-- Commande avec livreur (en cours de livraison)
INSERT INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  tax,
  grand_total,
  delivery_method,
  delivery_address,
  delivery_instructions,
  payment_method,
  payment_status,
  estimated_delivery,
  driver_id,
  driver_name,
  driver_phone,
  driver_location,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE email = 'client@test.com' LIMIT 1),
  2,
  'City Market',
  '[
    {
      "id": 8,
      "name": "Pain de mie complet",
      "price": 5000,
      "quantity": 2,
      "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"
    },
    {
      "id": 9,
      "name": "Lait frais 1L",
      "price": 12000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400"
    }
  ]'::jsonb,
  'picked_up',
  22000,
  15000,
  3960,
  40960,
  'delivery',
  '456 Avenue de la République, Almamya, Conakry',
  'Livraison urgente',
  'mobile_money',
  'paid',
  (NOW() + INTERVAL '15 minutes')::text,
  'driver-001',
  'Mamadou Diallo',
  '+224 621 123 456',
  '{"lat": 9.5370, "lng": -13.6785}'::jsonb,
  NOW(),
  NOW()
);

-- ============================================================================
-- COMMANDES AVEC AVIS CLIENTS
-- ============================================================================

-- Commande avec avis positif
INSERT INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  items,
  status,
  total,
  delivery_fee,
  tax,
  grand_total,
  delivery_method,
  delivery_address,
  delivery_instructions,
  payment_method,
  payment_status,
  estimated_delivery,
  customer_rating,
  customer_review,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE email = 'client@test.com' LIMIT 1),
  1,
  'Le Petit Baoulé',
  '[
    {
      "id": 4,
      "name": "Attieke poisson",
      "price": 40000,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400"
    }
  ]'::jsonb,
  'delivered',
  40000,
  15000,
  7200,
  62200,
  'delivery',
  '123 Rue de la Paix, Kaloum, Conakry',
  'Livraison parfaite',
  'cash',
  'paid',
  (NOW() - INTERVAL '2 hours')::text,
  5,
  'Excellent service ! La nourriture était délicieuse et la livraison très rapide. Je recommande vivement.',
  (NOW() - INTERVAL '3 hours'),
  (NOW() - INTERVAL '2 hours')
);

-- ============================================================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ============================================================================

-- Afficher toutes les commandes de test
SELECT 
  id,
  business_name,
  status,
  grand_total,
  created_at,
  customer_rating
FROM orders 
WHERE id LIKE 'TEST-%'
ORDER BY created_at DESC;

-- Statistiques des commandes
SELECT 
  status,
  COUNT(*) as count,
  AVG(grand_total) as avg_total,
  SUM(grand_total) as total_revenue
FROM orders 
WHERE id LIKE 'TEST-%'
GROUP BY status
ORDER BY count DESC;

-- Commandes avec livreurs
SELECT 
  id,
  business_name,
  status,
  driver_name,
  driver_phone
FROM orders 
WHERE id LIKE 'TEST-%' AND driver_id IS NOT NULL;

-- Commandes avec avis
SELECT 
  id,
  business_name,
  customer_rating,
  customer_review
FROM orders 
WHERE id LIKE 'TEST-%' AND customer_rating IS NOT NULL;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Données de test pour les commandes insérées avec succès !';
  RAISE NOTICE '📊 % commandes de test créées', (SELECT COUNT(*) FROM orders WHERE id LIKE 'TEST-%');
  RAISE NOTICE '🎯 Vous pouvez maintenant tester le système de panier et commandes';
END $$; 