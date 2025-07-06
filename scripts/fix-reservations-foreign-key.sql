-- Script pour ajouter la contrainte de clé étrangère manquante
-- entre la table reservations et user_profiles

-- Vérifier si la contrainte existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reservations_user_id_fkey' 
        AND table_name = 'reservations'
    ) THEN
        -- Ajouter la contrainte de clé étrangère
        ALTER TABLE public.reservations 
        ADD CONSTRAINT reservations_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.user_profiles(id);
        
        RAISE NOTICE 'Contrainte reservations_user_id_fkey ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La contrainte reservations_user_id_fkey existe déjà';
    END IF;
END $$;

-- Vérifier la structure de la table reservations
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reservations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les contraintes existantes
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'reservations' 
AND tc.table_schema = 'public'; 