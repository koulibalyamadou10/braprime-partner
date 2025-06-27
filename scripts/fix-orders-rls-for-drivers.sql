-- ============================================================================
-- SCRIPT POUR CORRIGER LES PERMISSIONS RLS SUR LA TABLE ORDERS
-- ============================================================================
-- Ce script ajoute les permissions nécessaires pour que les partenaires puissent
-- voir les commandes de leurs livreurs

-- ============================================================================
-- 1. VÉRIFIER LES POLITIQUES RLS ACTUELLES SUR ORDERS
-- ============================================================================

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- ============================================================================
-- 2. AJOUTER UNE POLITIQUE POUR LES PARTENAIRES POUR VOIR LES COMMANDES DE LEURS LIVREURS
-- ============================================================================

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Partners can view orders from their drivers" ON orders;

-- Créer une nouvelle politique pour permettre aux partenaires de voir les commandes de leurs livreurs
CREATE POLICY "Partners can view orders from their drivers" ON orders
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id 
            FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- 3. AJOUTER UNE POLITIQUE POUR LES PARTENAIRES POUR METTRE À JOUR LES COMMANDES DE LEURS LIVREURS
-- ============================================================================

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Partners can update orders from their drivers" ON orders;

-- Créer une nouvelle politique pour permettre aux partenaires de mettre à jour les commandes de leurs livreurs
CREATE POLICY "Partners can update orders from their drivers" ON orders
    FOR UPDATE USING (
        driver_id IN (
            SELECT d.id 
            FROM drivers d 
            JOIN businesses b ON d.business_id = b.id 
            WHERE b.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- 4. VÉRIFIER QUE LA COLONNE DRIVER_ID EXISTE
-- ============================================================================

-- Vérifier si la colonne driver_id existe dans la table orders
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'driver_id';

-- Si la colonne n'existe pas, la créer
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'driver_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN driver_id UUID REFERENCES drivers(id);
        RAISE NOTICE 'Colonne driver_id ajoutée à la table orders';
    ELSE
        RAISE NOTICE 'Colonne driver_id existe déjà';
    END IF;
END $$;

-- ============================================================================
-- 5. AJOUTER UN INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Créer un index sur driver_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);

-- ============================================================================
-- 6. VÉRIFIER LES NOUVELLES POLITIQUES
-- ============================================================================

-- Afficher toutes les politiques sur la table orders
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- ============================================================================
-- 7. TESTER LES PERMISSIONS
-- ============================================================================

-- Test de la requête que fait le service DriverDetailsService
-- Cette requête devrait maintenant fonctionner pour les partenaires
SELECT 
    'TEST QUERY' as test_type,
    COUNT(*) as orders_count
FROM orders o
JOIN drivers d ON o.driver_id = d.id
JOIN businesses b ON d.business_id = b.id
WHERE b.owner_id = auth.uid()
LIMIT 1;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Permissions RLS corrigées avec succès!';
    RAISE NOTICE 'Les partenaires peuvent maintenant voir les commandes de leurs livreurs.';
    RAISE NOTICE 'La page de détails des livreurs devrait maintenant fonctionner.';
END $$; 