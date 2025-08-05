-- ============================================================================
-- SCRIPT CORRIGÉ DE CRÉATION DES TEMPLATES DE CATÉGORIES DE MENU
-- ============================================================================
-- Version corrigée qui utilise les noms des business_types au lieu des IDs

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
-- FONCTION POUR INSÉRER LES TEMPLATES PAR NOM DE BUSINESS TYPE
-- ============================================================================

-- Fonction pour insérer les templates en utilisant le nom du business type
CREATE OR REPLACE FUNCTION insert_menu_templates_by_name(
    p_business_type_name VARCHAR(50),
    p_category_name VARCHAR(100),
    p_category_description TEXT,
    p_sort_order INTEGER,
    p_is_required BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
DECLARE
    v_business_type_id INTEGER;
BEGIN
    -- Trouver l'ID du business type par son nom
    SELECT id INTO v_business_type_id
    FROM business_types
    WHERE LOWER(name) = LOWER(p_business_type_name);
    
    IF v_business_type_id IS NULL THEN
        RAISE NOTICE 'Business type "%" non trouvé', p_business_type_name;
        RETURN;
    END IF;
    
    -- Insérer le template
    INSERT INTO business_type_menu_templates (
        business_type_id,
        category_name,
        category_description,
        sort_order,
        is_required
    ) VALUES (
        v_business_type_id,
        p_category_name,
        p_category_description,
        p_sort_order,
        p_is_required
    ) ON CONFLICT (business_type_id, category_name) DO NOTHING;
    
    RAISE NOTICE 'Template ajouté pour %: %', p_business_type_name, p_category_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INSÉRATION DES TEMPLATES PAR TYPE DE BUSINESS
-- ============================================================================

-- Supprimer les templates existants pour éviter les doublons
DELETE FROM business_type_menu_templates;

-- 1. TEMPLATES POUR RESTAURANTS
SELECT insert_menu_templates_by_name('restaurant', 'Entrées', 'Entrées et apéritifs pour commencer votre repas', 1, true);
SELECT insert_menu_templates_by_name('restaurant', 'Plats Principaux', 'Nos plats principaux traditionnels et modernes', 2, true);
SELECT insert_menu_templates_by_name('restaurant', 'Accompagnements', 'Riz, légumes et autres accompagnements', 3, true);
SELECT insert_menu_templates_by_name('restaurant', 'Salades', 'Salades fraîches et composées', 4, false);
SELECT insert_menu_templates_by_name('restaurant', 'Soupes', 'Soupes traditionnelles et modernes', 5, false);
SELECT insert_menu_templates_by_name('restaurant', 'Spécialités', 'Nos plats signature et spécialités du chef', 6, false);
SELECT insert_menu_templates_by_name('restaurant', 'Desserts', 'Desserts et pâtisseries maison', 7, true);
SELECT insert_menu_templates_by_name('restaurant', 'Boissons', 'Boissons fraîches, chaudes et alcoolisées', 8, true);
SELECT insert_menu_templates_by_name('restaurant', 'Menus Enfants', 'Menus spécialement conçus pour les enfants', 9, false);
SELECT insert_menu_templates_by_name('restaurant', 'Plats Végétariens', 'Options végétariennes et vegan', 10, false);

-- 2. TEMPLATES POUR CAFÉS
SELECT insert_menu_templates_by_name('cafe', 'Cafés', 'Cafés et expressos de qualité', 1, true);
SELECT insert_menu_templates_by_name('cafe', 'Thés', 'Thés traditionnels et aromatisés', 2, true);
SELECT insert_menu_templates_by_name('cafe', 'Pâtisseries', 'Pâtisseries et viennoiseries', 3, true);
SELECT insert_menu_templates_by_name('cafe', 'Boissons Fraîches', 'Jus, smoothies et rafraîchissements', 4, true);
SELECT insert_menu_templates_by_name('cafe', 'Snacks', 'Petits snacks et encas', 5, false);
SELECT insert_menu_templates_by_name('cafe', 'Desserts', 'Desserts et gâteaux', 6, false);
SELECT insert_menu_templates_by_name('cafe', 'Boissons Chaudes', 'Chocolats chauds et autres boissons', 7, false);

-- 3. TEMPLATES POUR MARCHÉS
SELECT insert_menu_templates_by_name('market', 'Fruits et Légumes', 'Fruits et légumes frais', 1, true);
SELECT insert_menu_templates_by_name('market', 'Viandes', 'Viandes fraîches et volailles', 2, true);
SELECT insert_menu_templates_by_name('market', 'Poissons', 'Poissons et fruits de mer', 3, false);
SELECT insert_menu_templates_by_name('market', 'Céréales', 'Riz, maïs et autres céréales', 4, true);
SELECT insert_menu_templates_by_name('market', 'Épices', 'Épices et condiments', 5, true);
SELECT insert_menu_templates_by_name('market', 'Huiles', 'Huiles de cuisson', 6, true);
SELECT insert_menu_templates_by_name('market', 'Produits Laitiers', 'Lait, fromages et yaourts', 7, false);
SELECT insert_menu_templates_by_name('market', 'Œufs', 'Œufs frais', 8, false);

-- 4. TEMPLATES POUR SUPERMARCHÉS
SELECT insert_menu_templates_by_name('supermarket', 'Alimentation Générale', 'Produits alimentaires de base', 1, true);
SELECT insert_menu_templates_by_name('supermarket', 'Fruits et Légumes', 'Fruits et légumes frais', 2, true);
SELECT insert_menu_templates_by_name('supermarket', 'Viandes et Poissons', 'Viandes, volailles et poissons', 3, true);
SELECT insert_menu_templates_by_name('supermarket', 'Produits Laitiers', 'Lait, fromages et produits laitiers', 4, true);
SELECT insert_menu_templates_by_name('supermarket', 'Boissons', 'Boissons et rafraîchissements', 5, true);
SELECT insert_menu_templates_by_name('supermarket', 'Hygiène', 'Produits d''hygiène et de soins', 6, true);
SELECT insert_menu_templates_by_name('supermarket', 'Entretien', 'Produits d''entretien ménager', 7, true);
SELECT insert_menu_templates_by_name('supermarket', 'Bébé', 'Produits pour bébés et enfants', 8, false);
SELECT insert_menu_templates_by_name('supermarket', 'Congelés', 'Produits surgelés', 9, false);
SELECT insert_menu_templates_by_name('supermarket', 'Conserves', 'Conserves et produits en conserve', 10, false);

-- 5. TEMPLATES POUR PHARMACIES
SELECT insert_menu_templates_by_name('pharmacy', 'Médicaments Prescrits', 'Médicaments sur ordonnance', 1, true);
SELECT insert_menu_templates_by_name('pharmacy', 'Médicaments en Vente Libre', 'Médicaments sans ordonnance', 2, true);
SELECT insert_menu_templates_by_name('pharmacy', 'Soins du Corps', 'Produits de soins corporels', 3, true);
SELECT insert_menu_templates_by_name('pharmacy', 'Soins du Visage', 'Produits de soins du visage', 4, true);
SELECT insert_menu_templates_by_name('pharmacy', 'Hygiène Bucco-dentaire', 'Produits d''hygiène bucco-dentaire', 5, true);
SELECT insert_menu_templates_by_name('pharmacy', 'Vitamines et Compléments', 'Vitamines et compléments alimentaires', 6, true);
SELECT insert_menu_templates_by_name('pharmacy', 'Premiers Soins', 'Produits de premiers soins', 7, true);
SELECT insert_menu_templates_by_name('pharmacy', 'Maternité et Bébé', 'Produits pour maman et bébé', 8, false);
SELECT insert_menu_templates_by_name('pharmacy', 'Soins des Cheveux', 'Produits de soins capillaires', 9, false);
SELECT insert_menu_templates_by_name('pharmacy', 'Parapharmacie', 'Produits de parapharmacie', 10, false);

-- 6. TEMPLATES POUR ÉLECTRONIQUE
SELECT insert_menu_templates_by_name('electronics', 'Smartphones', 'Téléphones mobiles et accessoires', 1, true);
SELECT insert_menu_templates_by_name('electronics', 'Ordinateurs', 'Ordinateurs portables et fixes', 2, true);
SELECT insert_menu_templates_by_name('electronics', 'Tablettes', 'Tablettes et accessoires', 3, true);
SELECT insert_menu_templates_by_name('electronics', 'Accessoires', 'Accessoires électroniques', 4, true);
SELECT insert_menu_templates_by_name('electronics', 'Audio', 'Écouteurs, haut-parleurs et audio', 5, true);
SELECT insert_menu_templates_by_name('electronics', 'Gaming', 'Produits de gaming et jeux', 6, false);
SELECT insert_menu_templates_by_name('electronics', 'Caméras', 'Appareils photo et caméras', 7, false);
SELECT insert_menu_templates_by_name('electronics', 'Écrans', 'Écrans et moniteurs', 8, false);

-- 7. TEMPLATES POUR BEAUTÉ
SELECT insert_menu_templates_by_name('beauty', 'Maquillage', 'Produits de maquillage', 1, true);
SELECT insert_menu_templates_by_name('beauty', 'Soins du Visage', 'Produits de soins du visage', 2, true);
SELECT insert_menu_templates_by_name('beauty', 'Soins du Corps', 'Produits de soins corporels', 3, true);
SELECT insert_menu_templates_by_name('beauty', 'Parfums', 'Parfums et eaux de toilette', 4, true);
SELECT insert_menu_templates_by_name('beauty', 'Soins des Cheveux', 'Produits de soins capillaires', 5, true);
SELECT insert_menu_templates_by_name('beauty', 'Accessoires', 'Accessoires de beauté', 6, false);
SELECT insert_menu_templates_by_name('beauty', 'Soins des Ongles', 'Produits de manucure et pédicure', 7, false);
SELECT insert_menu_templates_by_name('beauty', 'Produits Bio', 'Produits de beauté bio et naturels', 8, false);

-- 8. TEMPLATES POUR COIFFURE
SELECT insert_menu_templates_by_name('hairdressing', 'Coupes Hommes', 'Coupes et styles pour hommes', 1, true);
SELECT insert_menu_templates_by_name('hairdressing', 'Coupes Femmes', 'Coupes et styles pour femmes', 2, true);
SELECT insert_menu_templates_by_name('hairdressing', 'Coloration', 'Services de coloration', 3, true);
SELECT insert_menu_templates_by_name('hairdressing', 'Lissage', 'Services de lissage', 4, false);
SELECT insert_menu_templates_by_name('hairdressing', 'Permanente', 'Services de permanente', 5, false);
SELECT insert_menu_templates_by_name('hairdressing', 'Soins', 'Soins capillaires', 6, true);
SELECT insert_menu_templates_by_name('hairdressing', 'Extensions', 'Extensions et postiches', 7, false);
SELECT insert_menu_templates_by_name('hairdressing', 'Produits', 'Produits capillaires', 8, false);

-- 9. TEMPLATES POUR BRICOLAGE
SELECT insert_menu_templates_by_name('hardware', 'Outils à Main', 'Outils manuels', 1, true);
SELECT insert_menu_templates_by_name('hardware', 'Outils Électriques', 'Outils électriques et pneumatiques', 2, true);
SELECT insert_menu_templates_by_name('hardware', 'Matériaux de Construction', 'Ciment, briques, bois', 3, true);
SELECT insert_menu_templates_by_name('hardware', 'Plomberie', 'Matériaux et accessoires de plomberie', 4, true);
SELECT insert_menu_templates_by_name('hardware', 'Électricité', 'Matériaux et accessoires électriques', 5, true);
SELECT insert_menu_templates_by_name('hardware', 'Peinture', 'Peintures et accessoires', 6, true);
SELECT insert_menu_templates_by_name('hardware', 'Quincaillerie', 'Vis, boulons et quincaillerie', 7, true);
SELECT insert_menu_templates_by_name('hardware', 'Jardinage', 'Outils et produits de jardinage', 8, false);

-- 10. TEMPLATES POUR LIBRAIRIES
SELECT insert_menu_templates_by_name('bookstore', 'Livres Généraux', 'Livres de fiction et non-fiction', 1, true);
SELECT insert_menu_templates_by_name('bookstore', 'Livres Scolaires', 'Manuels et livres scolaires', 2, true);
SELECT insert_menu_templates_by_name('bookstore', 'Fournitures Scolaires', 'Cahiers, stylos et fournitures', 3, true);
SELECT insert_menu_templates_by_name('bookstore', 'Papeterie', 'Papeterie et accessoires de bureau', 4, true);
SELECT insert_menu_templates_by_name('bookstore', 'Livres pour Enfants', 'Livres et albums pour enfants', 5, false);
SELECT insert_menu_templates_by_name('bookstore', 'Cadeaux', 'Articles de cadeaux', 6, false);
SELECT insert_menu_templates_by_name('bookstore', 'Journaux et Magazines', 'Presse et périodiques', 7, false);

-- 11. TEMPLATES POUR SERVICES DE DOCUMENTS
SELECT insert_menu_templates_by_name('document_service', 'Photocopies', 'Services de photocopie', 1, true);
SELECT insert_menu_templates_by_name('document_service', 'Impression', 'Services d''impression', 2, true);
SELECT insert_menu_templates_by_name('document_service', 'Numérisation', 'Services de numérisation', 3, true);
SELECT insert_menu_templates_by_name('document_service', 'Reliure', 'Services de reliure', 4, false);
SELECT insert_menu_templates_by_name('document_service', 'Laminage', 'Services de laminage', 5, false);
SELECT insert_menu_templates_by_name('document_service', 'Services Administratifs', 'Aide administrative', 6, false);
SELECT insert_menu_templates_by_name('document_service', 'Fournitures', 'Fournitures de bureau', 7, false);

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
    'Résumé des templates créés:' as info;

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
WHERE LOWER(bt.name) = 'restaurant'
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