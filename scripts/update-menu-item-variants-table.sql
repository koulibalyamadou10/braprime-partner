-- Script pour mettre à jour la table menu_item_variants
-- Ajoute les champs manquants et configure la suppression en cascade

-- 1. Ajouter les colonnes created_at et updated_at si elles n'existent pas
ALTER TABLE public.menu_item_variants 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Supprimer l'ancienne contrainte de clé étrangère
ALTER TABLE public.menu_item_variants 
DROP CONSTRAINT IF EXISTS menu_item_variants_menu_item_id_fkey;

-- 3. Recréer la contrainte avec CASCADE pour la suppression
ALTER TABLE public.menu_item_variants 
ADD CONSTRAINT menu_item_variants_menu_item_id_fkey 
FOREIGN KEY (menu_item_id) 
REFERENCES public.menu_items(id) 
ON DELETE CASCADE;

-- 4. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_menu_item_variants_menu_item_id 
ON public.menu_item_variants(menu_item_id);

-- 5. Créer un index pour les requêtes par disponibilité
CREATE INDEX IF NOT EXISTS idx_menu_item_variants_is_available 
ON public.menu_item_variants(is_available);

-- 6. Vérifier la structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'menu_item_variants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Afficher quelques statistiques
SELECT 
    COUNT(*) as total_variants,
    COUNT(DISTINCT menu_item_id) as items_with_variants,
    COUNT(CASE WHEN is_available THEN 1 END) as available_variants
FROM public.menu_item_variants;

SELECT 'Table menu_item_variants mise à jour avec succès!' as status;

