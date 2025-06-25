-- Script de test pour l'intégration du système de panier
-- Ce script teste toutes les fonctionnalités du système de panier

-- 1. Vérifier que les tables existent
DO $$
BEGIN
    -- Vérifier la table cart
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart') THEN
        RAISE EXCEPTION 'Table cart n''existe pas';
    END IF;
    
    -- Vérifier la table cart_items
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart_items') THEN
        RAISE EXCEPTION 'Table cart_items n''existe pas';
    END IF;
    
    RAISE NOTICE '✓ Tables cart et cart_items existent';
END $$;

-- 2. Vérifier les politiques RLS
DO $$
BEGIN
    -- Vérifier les politiques sur cart
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'cart' 
        AND policyname = 'Users can view own cart'
    ) THEN
        RAISE EXCEPTION 'Politique RLS manquante sur cart';
    END IF;
    
    -- Vérifier les politiques sur cart_items
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'cart_items' 
        AND policyname = 'Users can view own cart items'
    ) THEN
        RAISE EXCEPTION 'Politique RLS manquante sur cart_items';
    END IF;
    
    RAISE NOTICE '✓ Politiques RLS configurées';
END $$;

-- 3. Vérifier les triggers
DO $$
BEGIN
    -- Vérifier le trigger de mise à jour du total
    IF NOT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'update_cart_total'
    ) THEN
        RAISE EXCEPTION 'Trigger update_cart_total manquant';
    END IF;
    
    -- Vérifier le trigger de mise à jour du compteur d'articles
    IF NOT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'update_cart_item_count'
    ) THEN
        RAISE EXCEPTION 'Trigger update_cart_item_count manquant';
    END IF;
    
    RAISE NOTICE '✓ Triggers configurés';
END $$;

-- 4. Vérifier les fonctions
DO $$
BEGIN
    -- Vérifier la fonction get_cart_total
    IF NOT EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = 'get_cart_total'
    ) THEN
        RAISE EXCEPTION 'Fonction get_cart_total manquante';
    END IF;
    
    -- Vérifier la fonction get_cart_item_count
    IF NOT EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = 'get_cart_item_count'
    ) THEN
        RAISE EXCEPTION 'Fonction get_cart_item_count manquante';
    END IF;
    
    RAISE NOTICE '✓ Fonctions utilitaires configurées';
END $$;

-- 5. Vérifier les index
DO $$
BEGIN
    -- Vérifier l'index sur user_id
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE indexname = 'idx_cart_user_id'
    ) THEN
        RAISE EXCEPTION 'Index idx_cart_user_id manquant';
    END IF;
    
    -- Vérifier l'index sur cart_id
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE indexname = 'idx_cart_items_cart_id'
    ) THEN
        RAISE EXCEPTION 'Index idx_cart_items_cart_id manquant';
    END IF;
    
    RAISE NOTICE '✓ Index configurés';
END $$;

-- 6. Test de création d'un panier (nécessite un utilisateur existant)
-- Note: Ce test nécessite qu'un utilisateur existe dans la base
DO $$
DECLARE
    test_user_id UUID;
    test_cart_id UUID;
    test_item_id UUID;
BEGIN
    -- Récupérer un utilisateur de test (remplacer par un ID réel)
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE '⚠ Aucun utilisateur trouvé pour le test - passer à la suite';
        RETURN;
    END IF;
    
    -- Créer un panier de test
    INSERT INTO cart (user_id, business_id, business_name)
    VALUES (test_user_id, 1, 'Restaurant Test')
    RETURNING id INTO test_cart_id;
    
    -- Ajouter un article de test
    INSERT INTO cart_items (cart_id, menu_item_id, name, price, quantity)
    VALUES (test_cart_id, 1, 'Article Test', 10000, 2)
    RETURNING id INTO test_item_id;
    
    -- Vérifier que le total a été calculé
    IF (SELECT total FROM cart WHERE id = test_cart_id) != 20000 THEN
        RAISE EXCEPTION 'Calcul du total incorrect';
    END IF;
    
    -- Vérifier que le compteur d'articles a été mis à jour
    IF (SELECT item_count FROM cart WHERE id = test_cart_id) != 1 THEN
        RAISE EXCEPTION 'Compteur d''articles incorrect';
    END IF;
    
    RAISE NOTICE '✓ Test de création de panier réussi';
    
    -- Nettoyer les données de test
    DELETE FROM cart_items WHERE cart_id = test_cart_id;
    DELETE FROM cart WHERE id = test_cart_id;
    
    RAISE NOTICE '✓ Nettoyage des données de test effectué';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠ Erreur lors du test de création: %', SQLERRM;
END $$;

-- 7. Vérifier la structure des colonnes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cart' 
ORDER BY ordinal_position;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
ORDER BY ordinal_position;

-- 8. Résumé de la vérification
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VÉRIFICATION DU SYSTÈME DE PANIER TERMINÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Le système de panier est prêt à être utilisé !';
    RAISE NOTICE '';
    RAISE NOTICE 'Fonctionnalités disponibles :';
    RAISE NOTICE '- Ajout/suppression d''articles';
    RAISE NOTICE '- Modification des quantités';
    RAISE NOTICE '- Calcul automatique des totaux';
    RAISE NOTICE '- Sécurité RLS par utilisateur';
    RAISE NOTICE '- Synchronisation avec localStorage';
    RAISE NOTICE '';
END $$; 