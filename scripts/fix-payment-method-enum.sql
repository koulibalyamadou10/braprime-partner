-- Script pour ajouter 'lengo_pay' à l'enum payment_method
-- Exécutez ce script dans votre base de données Supabase

-- 1. Vérifier les valeurs actuelles de l'enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')
ORDER BY enumsortorder;

-- 2. Ajouter 'lengo_pay' à l'enum payment_method
ALTER TYPE payment_method ADD VALUE 'lengo_pay';

-- 3. Vérifier que la valeur a été ajoutée
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')
ORDER BY enumsortorder;

-- 4. Afficher les valeurs finales
SELECT 
  'payment_method enum values:' as info,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as values
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method');
