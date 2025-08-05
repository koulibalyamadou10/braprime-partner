-- ============================================================================
-- SCRIPT POUR AJOUTER DES CATÉGORIES ET ARTICLES À LA PHARMACIE ID 78
-- ============================================================================
-- Ce script ajoute des catégories de menu et des articles pour une pharmacie existante

-- ============================================================================
-- ÉTAPE 1: VÉRIFICATION DU BUSINESS
-- ============================================================================

-- Vérifier que le business 78 existe et est bien une pharmacie
SELECT 
  'Vérification du business 78:' as info;

SELECT 
  id,
  name,
  business_type_id,
  is_active,
  is_open
FROM businesses 
WHERE id = 78;

-- Vérifier le type de business
SELECT 
  'Type de business:' as info;

SELECT 
  bt.id,
  bt.name as business_type_name,
  bt.icon,
  bt.color
FROM businesses b
JOIN business_types bt ON b.business_type_id = bt.id
WHERE b.id = 78;

-- ============================================================================
-- ÉTAPE 2: CRÉATION DES CATÉGORIES DE MENU
-- ============================================================================

-- Supprimer les catégories existantes pour éviter les doublons
DELETE FROM menu_categories WHERE business_id = 78;

-- Créer les catégories de menu pour la pharmacie
INSERT INTO menu_categories (name, description, business_id, is_active, sort_order) VALUES
('Médicaments Prescrits', 'Médicaments sur ordonnance', 78, true, 1),
('Médicaments en Vente Libre', 'Médicaments sans ordonnance', 78, true, 2),
('Soins du Corps', 'Produits de soins corporels', 78, true, 3),
('Soins du Visage', 'Produits de soins du visage', 78, true, 4),
('Hygiène Bucco-dentaire', 'Produits d''hygiène bucco-dentaire', 78, true, 5),
('Vitamines et Compléments', 'Vitamines et compléments alimentaires', 78, true, 6),
('Premiers Soins', 'Produits de premiers soins', 78, true, 7),
('Maternité et Bébé', 'Produits pour maman et bébé', 78, true, 8),
('Soins des Cheveux', 'Produits de soins capillaires', 78, true, 9),
('Parapharmacie', 'Produits de parapharmacie', 78, true, 10);

-- Vérifier les catégories créées
SELECT 
  'Catégories créées:' as info;

SELECT 
  id,
  name,
  description,
  sort_order,
  is_active
FROM menu_categories 
WHERE business_id = 78
ORDER BY sort_order;

-- ============================================================================
-- ÉTAPE 3: AJOUT D'ARTICLES DANS LES CATÉGORIES
-- ============================================================================

-- Récupérer les IDs des catégories pour les utiliser dans les articles
DO $$
DECLARE
    v_medicaments_prescrits_id INTEGER;
    v_medicaments_vente_libre_id INTEGER;
    v_soins_corps_id INTEGER;
    v_soins_visage_id INTEGER;
    v_hygiene_bucco_id INTEGER;
    v_vitamines_id INTEGER;
    v_premiers_soins_id INTEGER;
    v_maternite_id INTEGER;
    v_soins_cheveux_id INTEGER;
    v_parapharmacie_id INTEGER;
BEGIN
    -- Récupérer les IDs des catégories
    SELECT id INTO v_medicaments_prescrits_id FROM menu_categories WHERE business_id = 78 AND name = 'Médicaments Prescrits';
    SELECT id INTO v_medicaments_vente_libre_id FROM menu_categories WHERE business_id = 78 AND name = 'Médicaments en Vente Libre';
    SELECT id INTO v_soins_corps_id FROM menu_categories WHERE business_id = 78 AND name = 'Soins du Corps';
    SELECT id INTO v_soins_visage_id FROM menu_categories WHERE business_id = 78 AND name = 'Soins du Visage';
    SELECT id INTO v_hygiene_bucco_id FROM menu_categories WHERE business_id = 78 AND name = 'Hygiène Bucco-dentaire';
    SELECT id INTO v_vitamines_id FROM menu_categories WHERE business_id = 78 AND name = 'Vitamines et Compléments';
    SELECT id INTO v_premiers_soins_id FROM menu_categories WHERE business_id = 78 AND name = 'Premiers Soins';
    SELECT id INTO v_maternite_id FROM menu_categories WHERE business_id = 78 AND name = 'Maternité et Bébé';
    SELECT id INTO v_soins_cheveux_id FROM menu_categories WHERE business_id = 78 AND name = 'Soins des Cheveux';
    SELECT id INTO v_parapharmacie_id FROM menu_categories WHERE business_id = 78 AND name = 'Parapharmacie';

    -- ============================================================================
    -- MÉDICAMENTS EN VENTE LIBRE
    -- ============================================================================
    
    INSERT INTO menu_items (name, description, price, category_id, business_id, is_available) VALUES
    ('Paracétamol 500mg', 'Antidouleur et antipyrétique - 20 comprimés', 2500, v_medicaments_vente_libre_id, 78, true),
    ('Ibuprofène 400mg', 'Anti-inflammatoire et antidouleur - 12 comprimés', 3000, v_medicaments_vente_libre_id, 78, true),
    ('Aspirine 500mg', 'Antidouleur et fluidifiant sanguin - 30 comprimés', 2000, v_medicaments_vente_libre_id, 78, true),
    ('Vitamine C 1000mg', 'Complément alimentaire - 30 comprimés', 5000, v_medicaments_vente_libre_id, 78, true),
    ('Oméprazole 20mg', 'Protecteur gastrique - 14 gélules', 8000, v_medicaments_vente_libre_id, 78, true);

    -- ============================================================================
    -- SOINS DU CORPS
    -- ============================================================================
    
    INSERT INTO menu_items (name, description, price, category_id, business_id, is_available) VALUES
    ('Crème hydratante Nivea', 'Crème hydratante pour le corps - 400ml', 12000, v_soins_corps_id, 78, true),
    ('Gel douche Dove', 'Gel douche hydratant - 500ml', 8000, v_soins_corps_id, 78, true),
    ('Déodorant Rexona', 'Déodorant roll-on - 50ml', 3500, v_soins_corps_id, 78, true),
    ('Lotion après-rasage', 'Lotion apaisante après-rasage - 100ml', 6000, v_soins_corps_id, 78, true),
    ('Savon de Marseille', 'Savon traditionnel - 300g', 2500, v_soins_corps_id, 78, true);

    -- ============================================================================
    -- SOINS DU VISAGE
    -- ============================================================================
    
    INSERT INTO menu_items (name, description, price, category_id, business_id, is_available) VALUES
    ('Crème de jour Nivea', 'Crème hydratante de jour - 50ml', 15000, v_soins_visage_id, 78, true),
    ('Démaquillant Garnier', 'Lait démaquillant - 200ml', 10000, v_soins_visage_id, 78, true),
    ('Masque hydratant', 'Masque hydratant pour le visage - 1 unité', 3000, v_soins_visage_id, 78, true),
    ('Sérum vitamine C', 'Sérum anti-âge vitamine C - 30ml', 25000, v_soins_visage_id, 78, true),
    ('Protection solaire SPF 50', 'Crème solaire haute protection - 50ml', 18000, v_soins_visage_id, 78, true);

    -- ============================================================================
    -- HYGIÈNE BUCCO-DENTAIRE
    -- ============================================================================
    
    INSERT INTO menu_items (name, description, price, category_id, business_id, is_available) VALUES
    ('Dentifrice Colgate', 'Dentifrice protection caries - 100ml', 4000, v_hygiene_bucco_id, 78, true),
    ('Brosse à dents Oral-B', 'Brosse à dents souple - 1 unité', 2500, v_hygiene_bucco_id, 78, true),
    ('Fil dentaire', 'Fil dentaire ciré - 50m', 2000, v_hygiene_bucco_id, 78, true),
    ('Bain de bouche Listerine', 'Bain de bouche antiseptique - 500ml', 8000, v_hygiene_bucco_id, 78, true),
    ('Dentifrice blanchissant', 'Dentifrice blanchissant - 75ml', 6000, v_hygiene_bucco_id, 78, true);

    -- ============================================================================
    -- VITAMINES ET COMPLÉMENTS
    -- ============================================================================
    
    INSERT INTO menu_items (name, description, price, category_id, business_id, is_available) VALUES
    ('Vitamine D3 1000UI', 'Complément vitamine D - 60 gélules', 12000, v_vitamines_id, 78, true),
    ('Fer + Vitamine C', 'Complément fer et vitamine C - 30 comprimés', 15000, v_vitamines_id, 78, true),
    ('Oméga 3', 'Complément oméga 3 - 60 gélules', 18000, v_vitamines_id, 78, true),
    ('Magnésium', 'Complément magnésium - 30 comprimés', 10000, v_vitamines_id, 78, true),
    ('Probiotiques', 'Complément probiotiques - 30 gélules', 20000, v_vitamines_id, 78, true);

    -- ============================================================================
    -- PREMIERS SOINS
    -- ============================================================================
    
    INSERT INTO menu_items (name, description, price, category_id, business_id, is_available) VALUES
    ('Pansements stériles', 'Pansements adhésifs - 20 unités', 3000, v_premiers_soins_id, 78, true),
    ('Antiseptique Bétadine', 'Solution antiseptique - 100ml', 5000, v_premiers_soins_id, 78, true),
    ('Compresses stériles', 'Compresses non tissées - 10 unités', 2000, v_premiers_soins_id, 78, true),
    ('Sparadrap', 'Rouleau de sparadrap - 5m', 1500, v_premiers_soins_id, 78, true),
    ('Thermomètre digital', 'Thermomètre électronique', 8000, v_premiers_soins_id, 78, true);

    -- ============================================================================
    -- MATERNITÉ ET BÉBÉ
    -- ============================================================================
    
    INSERT INTO menu_items (name, description, price, category_id, business_id, is_available) VALUES
    ('Lait maternisé', 'Lait en poudre pour bébé - 400g', 25000, v_maternite_id, 78, true),
    ('Couches bébé', 'Couches taille 4 - 24 unités', 15000, v_maternite_id, 78, true),
    ('Lingettes bébé', 'Lingettes nettoyantes - 80 unités', 8000, v_maternite_id, 78, true),
    ('Crème pour fesses', 'Crème apaisante pour fesses - 100ml', 6000, v_maternite_id, 78, true),
    ('Vitamines bébé', 'Vitamines pour bébé - 30ml', 12000, v_maternite_id, 78, true);

    -- ============================================================================
    -- SOINS DES CHEVEUX
    -- ============================================================================
    
    INSERT INTO menu_items (name, description, price, category_id, business_id, is_available) VALUES
    ('Shampoing Head & Shoulders', 'Shampoing anti-pellicules - 400ml', 12000, v_soins_cheveux_id, 78, true),
    ('Après-shampoing', 'Après-shampoing hydratant - 400ml', 10000, v_soins_cheveux_id, 78, true),
    ('Huile capillaire', 'Huile nourrissante pour cheveux - 100ml', 8000, v_soins_cheveux_id, 78, true),
    ('Gel coiffant', 'Gel fixant pour cheveux - 150ml', 5000, v_soins_cheveux_id, 78, true),
    ('Masque capillaire', 'Masque réparateur pour cheveux - 200ml', 15000, v_soins_cheveux_id, 78, true);

    -- ============================================================================
    -- PARAPHARMACIE
    -- ============================================================================
    
    INSERT INTO menu_items (name, description, price, category_id, business_id, is_available) VALUES
    ('Thermomètre infrarouge', 'Thermomètre sans contact', 25000, v_parapharmacie_id, 78, true),
    ('Tensiomètre digital', 'Tensiomètre automatique', 45000, v_parapharmacie_id, 78, true),
    ('Pèse-personne', 'Balance électronique', 35000, v_parapharmacie_id, 78, true),
    ('Nébuliseur', 'Appareil de nébulisation', 60000, v_parapharmacie_id, 78, true),
    ('Oxygénateur', 'Concentrateur d''oxygène portable', 150000, v_parapharmacie_id, 78, true);

    RAISE NOTICE 'Articles ajoutés avec succès pour la pharmacie 78';
END $$;

-- ============================================================================
-- ÉTAPE 4: VÉRIFICATION FINALE
-- ============================================================================

-- Afficher un résumé des catégories et articles créés
SELECT 
  'Résumé des catégories créées:' as info;

SELECT 
  mc.name as categorie,
  COUNT(mi.id) as nombre_articles,
  SUM(mi.price) as valeur_totale
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
WHERE mc.business_id = 78
GROUP BY mc.id, mc.name
ORDER BY mc.sort_order;

-- Afficher quelques exemples d'articles
SELECT 
  'Exemples d''articles ajoutés:' as info;

SELECT 
  mc.name as categorie,
  mi.name as article,
  mi.price,
  mi.is_available
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.business_id = 78
ORDER BY mc.sort_order, mi.name
LIMIT 20;

-- ============================================================================
-- MESSAGE DE SUCCÈS
-- ============================================================================

SELECT 
  '✅ Script exécuté avec succès!' as message,
  'Pharmacie 78: Catégories et articles ajoutés' as details; 