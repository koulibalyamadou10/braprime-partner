# Guide du Dashboard Administrateur - BraPrime

## Vue d'ensemble

Le dashboard administrateur de BraPrime permet de gérer l'ensemble de la plateforme de livraison, incluant les utilisateurs, commerces, commandes, livreurs et la configuration système.

## Configuration Initiale

### 1. Exécuter le script de configuration

```sql
-- Exécuter dans l'éditeur SQL de Supabase
\i scripts/setup-admin-role.sql
```

### 2. Identifiants par défaut

- **Email**: admin@braprime.com
- **Mot de passe**: admin123
- **Rôle**: Administrateur

⚠️ **Important**: Changez ces identifiants après la première connexion !

## Fonctionnalités du Dashboard

### 📊 Tableau de bord principal

**Statistiques en temps réel :**
- Nombre total de commandes
- Revenus totaux de la plateforme
- Nombre d'utilisateurs actifs
- Nombre de commerces actifs
- Croissance par rapport à la veille

**Actions rapides :**
- Gérer les commerces
- Gérer les utilisateurs
- Suivre les commandes
- Configuration système

### 🏢 Gestion des Commerces

**Fonctionnalités :**
- Voir tous les commerces de la plateforme
- Activer/désactiver des commerces
- Voir les statistiques par commerce
- Gérer les catégories
- Surveiller les performances

**Actions disponibles :**
- `GET /admin-dashboard/businesses` - Liste des commerces
- `PUT /admin-dashboard/businesses/:id/status` - Changer le statut
- `GET /admin-dashboard/businesses/:id/stats` - Statistiques détaillées

### 👥 Gestion des Utilisateurs

**Types d'utilisateurs :**
- **Clients** (role_id: 1) - Utilisateurs finaux
- **Partenaires** (role_id: 2) - Propriétaires de commerces
- **Livreurs** (role_id: 4) - Personnel de livraison
- **Administrateurs** (role_id: 3) - Gestionnaires de plateforme

**Fonctionnalités :**
- Voir tous les utilisateurs
- Activer/désactiver des comptes
- Vérifier les profils
- Gérer les rôles
- Surveiller l'activité

### 📦 Suivi des Commandes

**Vue d'ensemble :**
- Toutes les commandes de la plateforme
- Filtrage par statut, date, commerce
- Statistiques de livraison
- Gestion des litiges

**Statuts de commande :**
- `pending` - En attente
- `confirmed` - Confirmée
- `preparing` - En préparation
- `ready` - Prête
- `out_for_delivery` - En livraison
- `delivered` - Livrée
- `cancelled` - Annulée

### 🚚 Gestion des Livreurs

**Fonctionnalités :**
- Voir tous les livreurs
- Assigner des livreurs aux commandes
- Surveiller les performances
- Gérer les comptes de connexion
- Statistiques de livraison

### 📈 Rapports et Analytics

**Rapports disponibles :**
- Revenus par période
- Commandes par commerce
- Performance des livreurs
- Croissance utilisateurs
- Métriques de satisfaction

**Exports :**
- CSV des commandes
- PDF des rapports
- Données pour analyse

### ⚙️ Configuration Système

**Santé du système :**
- État de la base de données
- Performance de l'API
- Espace de stockage
- Système de notifications

**Actions système :**
- Sauvegarde automatique
- Redémarrage des services
- Monitoring en temps réel
- Gestion de la sécurité

## Permissions Administrateur

### Politiques RLS configurées

L'administrateur a accès complet à toutes les tables :

```sql
-- Exemples de politiques
"Admins can view all users" ON user_profiles
"Admins can update all businesses" ON businesses
"Admins can view all orders" ON orders
"Admins can update all drivers" ON drivers
```

### Rôles et permissions

```json
{
  "role_id": 3,
  "name": "admin",
  "permissions": {
    "all": true,
    "users": ["read", "write", "delete"],
    "businesses": ["read", "write", "delete"],
    "orders": ["read", "write", "delete"],
    "drivers": ["read", "write", "delete"],
    "system": ["read", "write", "configure"]
  }
}
```

## API Endpoints

### Statistiques
```typescript
// Récupérer les statistiques principales
GET /api/admin/stats

// Récupérer les commandes récentes
GET /api/admin/recent-orders

// Récupérer les top commerces
GET /api/admin/top-businesses

// Récupérer la santé du système
GET /api/admin/system-health
```

### Gestion des utilisateurs
```typescript
// Lister tous les utilisateurs
GET /api/admin/users

// Mettre à jour un utilisateur
PUT /api/admin/users/:id

// Désactiver un utilisateur
PATCH /api/admin/users/:id/status
```

### Gestion des commerces
```typescript
// Lister tous les commerces
GET /api/admin/businesses

// Mettre à jour un commerce
PUT /api/admin/businesses/:id

// Activer/désactiver un commerce
PATCH /api/admin/businesses/:id/status
```

## Sécurité

### Bonnes pratiques

1. **Authentification forte**
   - Utiliser des mots de passe complexes
   - Activer l'authentification à deux facteurs
   - Changer régulièrement les identifiants

2. **Audit et logs**
   - Toutes les actions admin sont loggées
   - Surveillance des accès suspects
   - Rapports d'activité réguliers

3. **Permissions granulaires**
   - Accès limité selon les besoins
   - Principe du moindre privilège
   - Révision régulière des permissions

### Monitoring

**Métriques surveillées :**
- Nombre de connexions admin
- Actions effectuées
- Tentatives d'accès non autorisées
- Performance du système

## Dépannage

### Problèmes courants

1. **Erreur d'accès refusé**
   ```sql
   -- Vérifier le rôle de l'utilisateur
   SELECT role_id FROM user_profiles WHERE id = auth.uid();
   ```

2. **Politiques RLS bloquantes**
   ```sql
   -- Vérifier les politiques admin
   SELECT * FROM pg_policies WHERE policyname LIKE '%Admin%';
   ```

3. **Données manquantes**
   ```sql
   -- Vérifier l'existence des tables
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### Scripts de diagnostic

```sql
-- Vérifier la configuration admin
\i scripts/check-admin-setup.sql

-- Diagnostiquer les problèmes RLS
\i scripts/diagnose-admin-rls.sql

-- Vérifier les permissions
\i scripts/verify-admin-permissions.sql
```

## Support

Pour toute question ou problème :

1. **Documentation technique** : Consultez les guides SQL
2. **Logs système** : Vérifiez les logs Supabase
3. **Support développeur** : Contactez l'équipe technique

---

**Version**: 1.0  
**Dernière mise à jour** : Décembre 2024  
**Auteur** : Équipe BraPrime 