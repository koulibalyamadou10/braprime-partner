-- ============================================================================
-- SCRIPT DE CRÉATION DES TEMPLATES DE CATÉGORIES DE MENU PAR TYPE DE BUSINESS
-- ============================================================================
-- Ce script définit les catégories de menu appropriées pour chaque type de commerce

-- ============================================================================
-- CRÉATION DE LA TABLE DES TEMPLATES DE CATÉGORIES
-- ============================================================================

-- Table pour stocker les templates de catégories par type de business
CREATE TABLE IF NOT EXISTS business_type_menu_templates (
    id SERIAL PRIMARY KEY,
    business_type_id INTEGER REFERENCES business_types(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    category_description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_type_id, category_name)
);

-- ============================================================================
-- INSÉRATION DES TEMPLATES PAR TYPE DE BUSINESS
-- ============================================================================

-- Supprimer les templates existants pour éviter les doublons
DELETE FROM business_type_menu_templates;

-- 1. TEMPLATES POUR RESTAURANTS
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(1, 'Entrées', 'Entrées et apéritifs pour commencer votre repas', 1, true),
(1, 'Plats Principaux', 'Nos plats principaux traditionnels et modernes', 2, true),
(1, 'Accompagnements', 'Riz, légumes et autres accompagnements', 3, true),
(1, 'Salades', 'Salades fraîches et composées', 4, false),
(1, 'Soupes', 'Soupes traditionnelles et modernes', 5, false),
(1, 'Spécialités', 'Nos plats signature et spécialités du chef', 6, false),
(1, 'Desserts', 'Desserts et pâtisseries maison', 7, true),
(1, 'Boissons', 'Boissons fraîches, chaudes et alcoolisées', 8, true),
(1, 'Menus Enfants', 'Menus spécialement conçus pour les enfants', 9, false),
(1, 'Plats Végétariens', 'Options végétariennes et vegan', 10, false);

-- 2. TEMPLATES POUR CAFÉS
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(2, 'Cafés', 'Cafés et expressos de qualité', 1, true),
(2, 'Thés', 'Thés traditionnels et aromatisés', 2, true),
(3, 'Pâtisseries', 'Pâtisseries et viennoiseries', 3, true),
(2, 'Boissons Fraîches', 'Jus, smoothies et rafraîchissements', 4, true),
(2, 'Snacks', 'Petits snacks et encas', 5, false),
(2, 'Desserts', 'Desserts et gâteaux', 6, false),
(2, 'Boissons Chaudes', 'Chocolats chauds et autres boissons', 7, false);

-- 3. TEMPLATES POUR MARCHÉS
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(3, 'Fruits et Légumes', 'Fruits et légumes frais', 1, true),
(3, 'Viandes', 'Viandes fraîches et volailles', 2, true),
(3, 'Poissons', 'Poissons et fruits de mer', 3, false),
(3, 'Céréales', 'Riz, maïs et autres céréales', 4, true),
(3, 'Épices', 'Épices et condiments', 5, true),
(3, 'Huiles', 'Huiles de cuisson', 6, true),
(3, 'Produits Laitiers', 'Lait, fromages et yaourts', 7, false),
(3, 'Œufs', 'Œufs frais', 8, false);

-- 4. TEMPLATES POUR SUPERMARCHÉS
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(4, 'Alimentation Générale', 'Produits alimentaires de base', 1, true),
(4, 'Fruits et Légumes', 'Fruits et légumes frais', 2, true),
(4, 'Viandes et Poissons', 'Viandes, volailles et poissons', 3, true),
(4, 'Produits Laitiers', 'Lait, fromages et produits laitiers', 4, true),
(4, 'Boissons', 'Boissons et rafraîchissements', 5, true),
(4, 'Hygiène', 'Produits d''hygiène et de soins', 6, true),
(4, 'Entretien', 'Produits d''entretien ménager', 7, true),
(4, 'Bébé', 'Produits pour bébés et enfants', 8, false),
(4, 'Congelés', 'Produits surgelés', 9, false),
(4, 'Conserves', 'Conserves et produits en conserve', 10, false);

-- 5. TEMPLATES POUR PHARMACIES
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(5, 'Médicaments Prescrits', 'Médicaments sur ordonnance', 1, true),
(5, 'Médicaments en Vente Libre', 'Médicaments sans ordonnance', 2, true),
(5, 'Soins du Corps', 'Produits de soins corporels', 3, true),
(5, 'Soins du Visage', 'Produits de soins du visage', 4, true),
(5, 'Hygiène Bucco-dentaire', 'Produits d''hygiène bucco-dentaire', 5, true),
(5, 'Vitamines et Compléments', 'Vitamines et compléments alimentaires', 6, true),
(5, 'Premiers Soins', 'Produits de premiers soins', 7, true),
(5, 'Maternité et Bébé', 'Produits pour maman et bébé', 8, false),
(5, 'Soins des Cheveux', 'Produits de soins capillaires', 9, false),
(5, 'Parapharmacie', 'Produits de parapharmacie', 10, false);

-- 6. TEMPLATES POUR ÉLECTRONIQUE
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(6, 'Smartphones', 'Téléphones mobiles et accessoires', 1, true),
(6, 'Ordinateurs', 'Ordinateurs portables et fixes', 2, true),
(6, 'Tablettes', 'Tablettes et accessoires', 3, true),
(6, 'Accessoires', 'Accessoires électroniques', 4, true),
(6, 'Audio', 'Écouteurs, haut-parleurs et audio', 5, true),
(6, 'Gaming', 'Produits de gaming et jeux', 6, false),
(6, 'Caméras', 'Appareils photo et caméras', 7, false),
(6, 'Écrans', 'Écrans et moniteurs', 8, false);

-- 7. TEMPLATES POUR BEAUTÉ
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(7, 'Maquillage', 'Produits de maquillage', 1, true),
(7, 'Soins du Visage', 'Produits de soins du visage', 2, true),
(7, 'Soins du Corps', 'Produits de soins corporels', 3, true),
(7, 'Parfums', 'Parfums et eaux de toilette', 4, true),
(7, 'Soins des Cheveux', 'Produits de soins capillaires', 5, true),
(7, 'Accessoires', 'Accessoires de beauté', 6, false),
(7, 'Soins des Ongles', 'Produits de manucure et pédicure', 7, false),
(7, 'Produits Bio', 'Produits de beauté bio et naturels', 8, false);

-- 8. TEMPLATES POUR COIFFURE
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(8, 'Coupes Hommes', 'Coupes et styles pour hommes', 1, true),
(8, 'Coupes Femmes', 'Coupes et styles pour femmes', 2, true),
(8, 'Coloration', 'Services de coloration', 3, true),
(8, 'Lissage', 'Services de lissage', 4, false),
(8, 'Permanente', 'Services de permanente', 5, false),
(8, 'Soins', 'Soins capillaires', 6, true),
(8, 'Extensions', 'Extensions et postiches', 7, false),
(8, 'Produits', 'Produits capillaires', 8, false);

-- 9. TEMPLATES POUR BRICOLAGE
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(9, 'Outils à Main', 'Outils manuels', 1, true),
(9, 'Outils Électriques', 'Outils électriques et pneumatiques', 2, true),
(9, 'Matériaux de Construction', 'Ciment, briques, bois', 3, true),
(9, 'Plomberie', 'Matériaux et accessoires de plomberie', 4, true),
(9, 'Électricité', 'Matériaux et accessoires électriques', 5, true),
(9, 'Peinture', 'Peintures et accessoires', 6, true),
(9, 'Quincaillerie', 'Vis, boulons et quincaillerie', 7, true),
(9, 'Jardinage', 'Outils et produits de jardinage', 8, false);

-- 10. TEMPLATES POUR LIBRAIRIES
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(10, 'Livres Généraux', 'Livres de fiction et non-fiction', 1, true),
(10, 'Livres Scolaires', 'Manuels et livres scolaires', 2, true),
(10, 'Fournitures Scolaires', 'Cahiers, stylos et fournitures', 3, true),
(10, 'Papeterie', 'Papeterie et accessoires de bureau', 4, true),
(10, 'Livres pour Enfants', 'Livres et albums pour enfants', 5, false),
(10, 'Cadeaux', 'Articles de cadeaux', 6, false),
(10, 'Journaux et Magazines', 'Presse et périodiques', 7, false);

-- 11. TEMPLATES POUR SERVICES DE DOCUMENTS
INSERT INTO business_type_menu_templates (business_type_id, category_name, category_description, sort_order, is_required) VALUES
(11, 'Photocopies', 'Services de photocopie', 1, true),
(11, 'Impression', 'Services d''impression', 2, true),
(11, 'Numérisation', 'Services de numérisation', 3, true),
(11, 'Reliure', 'Services de reliure', 4, false),
(11, 'Laminage', 'Services de laminage', 5, false),
(11, 'Services Administratifs', 'Aide administrative', 6, false),
(11, 'Fournitures', 'Fournitures de bureau', 7, false);

-- ============================================================================
-- FONCTION POUR CRÉER LES CATÉGORIES DE MENU PAR TYPE DE BUSINESS
-- ============================================================================

-- Fonction pour créer automatiquement les catégories de menu selon le type de business
CREATE OR REPLACE FUNCTION create_menu_categories_by_business_type(
    p_business_id INTEGER,
    p_business_type_id INTEGER
)
RETURNS VOID AS $$
DECLARE
    template_record RECORD;
BEGIN
    -- Supprimer les catégories existantes pour ce business
    DELETE FROM menu_categories WHERE business_id = p_business_id;
    
    -- Insérer les catégories basées sur le template du type de business
    FOR template_record IN 
        SELECT category_name, category_description, sort_order, is_required
        FROM business_type_menu_templates
        WHERE business_type_id = p_business_type_id
        ORDER BY sort_order
    LOOP
        INSERT INTO menu_categories (
            name, 
            description, 
            business_id, 
            is_active, 
            sort_order
        ) VALUES (
            template_record.category_name,
            template_record.category_description,
            p_business_id,
            true,
            template_record.sort_order
        );
    END LOOP;
    
    RAISE NOTICE 'Catégories de menu créées pour le business % avec le type %', p_business_id, p_business_type_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER POUR CRÉER AUTOMATIQUEMENT LES CATÉGORIES
-- ============================================================================

-- Fonction trigger pour créer automatiquement les catégories lors de la création d'un business
CREATE OR REPLACE FUNCTION trigger_create_menu_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer les catégories de menu si le business a un type défini
    IF NEW.business_type_id IS NOT NULL THEN
        PERFORM create_menu_categories_by_business_type(NEW.id, NEW.business_type_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS create_menu_categories_trigger ON businesses;
CREATE TRIGGER create_menu_categories_trigger
    AFTER INSERT ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_create_menu_categories();

-- ============================================================================
-- VÉRIFICATION DES DONNÉES
-- ============================================================================

-- Afficher un résumé des templates créés
SELECT 
    bt.name as business_type,
    COUNT(btmt.category_name) as category_count
FROM business_types bt
LEFT JOIN business_type_menu_templates btmt ON bt.id = btmt.business_type_id
GROUP BY bt.id, bt.name
ORDER BY bt.id;

-- Afficher les templates pour un type spécifique (exemple: restaurants)
SELECT 
    'Templates pour Restaurants:' as info;

SELECT 
    category_name,
    category_description,
    sort_order,
    is_required
FROM business_type_menu_templates btmt
JOIN business_types bt ON btmt.business_type_id = bt.id
WHERE bt.name = 'restaurant'
ORDER BY sort_order;

-- ============================================================================
-- FONCTION DE MISE À JOUR POUR LES BUSINESS EXISTANTS
-- ============================================================================

-- Fonction pour mettre à jour les catégories des business existants
CREATE OR REPLACE FUNCTION update_existing_businesses_menu_categories()
RETURNS VOID AS $$
DECLARE
    business_record RECORD;
BEGIN
    FOR business_record IN 
        SELECT id, business_type_id 
        FROM businesses 
        WHERE business_type_id IS NOT NULL
    LOOP
        PERFORM create_menu_categories_by_business_type(
            business_record.id, 
            business_record.business_type_id
        );
    END LOOP;
    
    RAISE NOTICE 'Mise à jour des catégories de menu terminée pour tous les business existants';
END;
$$ LANGUAGE plpgsql;

-- Exécuter la mise à jour (décommentez si nécessaire)
-- SELECT update_existing_businesses_menu_categories(); 