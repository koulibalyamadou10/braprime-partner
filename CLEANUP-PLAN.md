# 🧹 Plan de Nettoyage du Projet BraPrime

## 📋 Vue d'ensemble
Ce document détaille le plan de nettoyage pour supprimer toutes les données de test, fichiers de démonstration et scripts inutiles du projet BraPrime.

## 🗂️ Fichiers à supprimer

### 1. Scripts SQL de test et démonstration
- `scripts/create-demo-driver.sql` - Compte de démonstration driver
- `scripts/create-test-driver-account.sql` - Compte de test driver
- `scripts/test-*.sql` - Tous les scripts de test
- `scripts/add-complete-test-data.sql` - Données de test complètes
- `scripts/insert-test-*.sql` - Insertions de données de test
- `scripts/simple-*.sql` - Scripts simples de test
- `scripts/debug-*.sql` - Scripts de débogage
- `scripts/check-*.sql` - Scripts de vérification
- `scripts/diagnose-*.sql` - Scripts de diagnostic
- `scripts/verify-*.sql` - Scripts de vérification
- `scripts/fix-*.sql` - Scripts de correction (sauf essentiels)
- `scripts/temp-*.sql` - Scripts temporaires
- `scripts/force-*.sql` - Scripts de force
- `scripts/quick-*.sql` - Scripts rapides

### 2. Fichiers SQL de test à la racine
- `test-orders-data.sql` - Données de test des commandes
- `supabase-test-data.sql` - Données de test Supabase
- `test-auth.sql` - Test d'authentification
- `fix-orders-table.sql` - Correction de table

### 3. Composants de démonstration
- `src/components/CartDemo.tsx` - Démonstration du panier
- `src/components/MenuDebug.tsx` - Débogage du menu

### 4. Données mock dans les pages
- Supprimer toutes les constantes `MOCK_*` dans les pages
- Remplacer par des appels API réels

### 5. Guides de résolution obsolètes
- `GUIDE-*.md` - Tous les guides de résolution
- `RESOLUTION-*.md` - Guides de résolution
- `STORAGE-SETUP.md` - Configuration du stockage

### 6. Scripts d'initialisation obsolètes
- `init-supabase.js` - Initialisation Supabase
- `create-admin.js` - Création d'admin

## 🔧 Actions de nettoyage

### Phase 1: Suppression des fichiers
1. Supprimer tous les scripts SQL de test
2. Supprimer les composants de démonstration
3. Supprimer les guides obsolètes
4. Supprimer les scripts d'initialisation

### Phase 2: Nettoyage du code
1. Supprimer les données mock des pages
2. Remplacer par des appels API réels
3. Nettoyer les imports inutilisés
4. Supprimer les commentaires de test

### Phase 3: Optimisation
1. Vérifier les dépendances inutilisées
2. Nettoyer les types TypeScript
3. Optimiser les imports
4. Vérifier la cohérence du code

## 📊 Impact estimé
- **Fichiers supprimés**: ~50 fichiers
- **Lignes de code supprimées**: ~5000 lignes
- **Taille réduite**: ~2-3 MB
- **Performance**: Amélioration du temps de build

## ⚠️ Précautions
- Sauvegarder avant le nettoyage
- Tester après chaque phase
- Vérifier que les fonctionnalités principales fonctionnent
- Garder les scripts essentiels de configuration

## ✅ Validation post-nettoyage
- [ ] Application se lance correctement
- [ ] Authentification fonctionne
- [ ] Dashboard driver fonctionne
- [ ] Panier fonctionne
- [ ] Commandes fonctionnent
- [ ] Pas d'erreurs dans la console
- [ ] Build de production réussi 