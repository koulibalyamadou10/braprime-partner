# Guide de Migration de la Base de Données BraPrime

## ⚠️ ATTENTION - Sauvegarde Recommandée

Avant de procéder à la migration, il est **fortement recommandé** de sauvegarder vos données existantes si elles sont importantes.

## Étapes de Migration

### 1. Accéder à Supabase

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor** (Éditeur SQL)
3. Assurez-vous d'être sur la base de données principale

### 2. Nettoyer la Base de Données

**Exécutez d'abord le script de nettoyage :**

```sql
-- Copiez et exécutez le contenu du fichier : supabase-clean-schema.sql
```

Ce script va :
- ✅ Supprimer toutes les tables existantes
- ✅ Supprimer toutes les fonctions personnalisées
- ✅ Supprimer tous les triggers
- ✅ Nettoyer les politiques RLS
- ✅ Préparer la base pour le nouveau schéma

### 3. Appliquer le Nouveau Schéma

**Ensuite, exécutez le nouveau schéma :**

```sql
-- Copiez et exécutez le contenu du fichier : supabase-schema-fixed.sql
```

Ce script va :
- ✅ Créer les nouvelles tables avec la structure flexible
- ✅ Insérer les types de services de base
- ✅ Insérer les catégories de produits
- ✅ Créer les services d'exemple
- ✅ Configurer les politiques de sécurité
- ✅ Créer les triggers et fonctions

### 4. Vérification

Après l'exécution, vérifiez que :

1. **Tables créées** :
   - `users`
   - `service_types`
   - `categories`
   - `services`
   - `products`
   - `orders`
   - `user_addresses`
   - `reservations`

2. **Données de base insérées** :
   - Types de services (Restaurant, Pharmacie, etc.)
   - Catégories de produits
   - Services d'exemple avec produits

3. **Politiques RLS actives** :
   - Vérifiez dans **Authentication > Policies**

## Structure du Nouveau Modèle

### Tables Principales

```
users (Utilisateurs)
├── service_types (Types de services)
│   └── services (Services spécifiques)
│       └── products (Produits/Articles)
│           └── categories (Catégories)
├── orders (Commandes)
├── user_addresses (Adresses)
└── reservations (Réservations)
```

### Relations

- **Un partenaire** peut avoir **plusieurs services**
- **Un service** peut avoir **plusieurs produits**
- **Un produit** appartient à **une catégorie**
- **Un service** a **un type** (Restaurant, Pharmacie, etc.)

## Données d'Exemple Incluses

### Types de Services
- Restaurant
- Pharmacie
- Supermarché
- Café
- Marché
- Électronique
- Beauté
- Coiffure
- Bricolage
- Documents
- Colis
- Cadeaux
- Fournitures

### Services d'Exemple
1. **Le Petit Baoulé** (Restaurant)
2. **Pharmacie Centrale** (Pharmacie)
3. **Supermarché Madina** (Supermarché)
4. **Le Café de Conakry** (Café)

### Produits d'Exemple
- **Restaurant** : Poulet Yassa, Sauce Arachide, Jus de Gingembre
- **Pharmacie** : Paracétamol, Gel hydroalcoolique, Vitamine C
- **Supermarché** : Riz Basmati, Huile d'Olive, Pommes Golden
- **Café** : Café Noir, Cappuccino, Croissant

## Avantages du Nouveau Modèle

### ✅ Flexibilité
- Un partenaire peut gérer plusieurs types de services
- Interface adaptée selon le type de service

### ✅ Scalabilité
- Ajout facile de nouveaux types de services
- Structure extensible

### ✅ Personnalisation
- Dashboards contextuels
- Métriques adaptées

## Test de la Migration

### 1. Test de Connexion
```typescript
// Vérifiez que l'application se connecte correctement
// Les hooks devraient fonctionner sans erreur
```

### 2. Test des Services
```typescript
// Testez la récupération des services
const { data: services } = usePopularServices();
console.log('Services récupérés:', services);
```

### 3. Test du Dashboard
```typescript
// Testez le dashboard partenaire
const { data: partnerServices } = usePartnerServices();
console.log('Services du partenaire:', partnerServices);
```

## Résolution des Problèmes

### Erreur "Table does not exist"
- Vérifiez que le script de nettoyage a bien supprimé toutes les tables
- Vérifiez que le nouveau schéma a bien créé toutes les tables

### Erreur "Column does not exist"
- Vérifiez que vous utilisez les nouveaux noms de colonnes
- Consultez le guide du nouveau modèle

### Erreur d'authentification
- Vérifiez que les politiques RLS sont bien configurées
- Vérifiez les variables d'environnement Supabase

## Prochaines Étapes

1. **Tester l'application** avec le nouveau modèle
2. **Créer des services** de différents types
3. **Tester les dashboards** adaptatifs
4. **Valider les fonctionnalités** existantes

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console Supabase
2. Consultez le guide du nouveau modèle
3. Testez les requêtes SQL directement dans l'éditeur

---

**Migration terminée !** 🎉

Votre base de données BraPrime est maintenant prête avec le nouveau modèle flexible. 