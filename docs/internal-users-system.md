# Système de Gestion des Utilisateurs Internes

## 🎯 Vue d'ensemble

Le système d'utilisateurs internes permet aux partenaires de BraPrime de créer et gérer des comptes pour les membres de leur équipe avec des permissions spécifiques selon leur rôle.

## 🗄️ Structure de la Base de Données

### Table `profil_internal_user`

```sql
CREATE TABLE public.profil_internal_user (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  business_id integer NOT NULL REFERENCES businesses(id),
  name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying,
  role character varying NOT NULL CHECK (role IN ('commandes', 'menu', 'reservations', 'livreurs', 'revenu', 'user', 'facturation', 'admin')),
  is_active boolean DEFAULT true,
  permissions jsonb DEFAULT '{}',
  last_login timestamp with time zone,
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(business_id, email)
);
```

### Rôles Disponibles

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **admin** | Administrateur | Accès complet à toutes les fonctionnalités |
| **commandes** | Gestion des commandes | Gestion des commandes, suivi, mise à jour des statuts |
| **menu** | Gestion du menu | Gestion du menu, articles, catégories |
| **reservations** | Gestion des réservations | Gestion des réservations, tables |
| **livreurs** | Gestion des livreurs | Gestion des livreurs, affectations, suivi |
| **revenu** | Suivi des revenus | Visualisation des revenus, analytics, rapports |
| **user** | Gestion des utilisateurs | Gestion des clients, visualisation des profils |
| **facturation** | Gestion de la facturation | Abonnements, factures, paiements |

## 🔧 Architecture Technique

### Services

- **`InternalUsersService`** : Service principal pour toutes les opérations CRUD
- **`useInternalUsers`** : Hook React Query pour la gestion d'état et des mutations

### Composants

- **`AddInternalUserDialog`** : Modal pour créer un nouvel utilisateur interne
- **`PartnerUsers`** : Page principale de gestion des utilisateurs

## 🚀 Fonctionnalités

### 1. Création d'Utilisateur Interne

```typescript
const result = await InternalUsersService.createInternalUser({
  name: 'Nom Utilisateur',
  email: 'email@business.com',
  phone: '+224 XXX XXX XXX',
  role: 'commandes',
  password: 'motdepasse123',
  business_id: 1,
  created_by: 'uuid_utilisateur_connecte'
});
```

**Processus de création :**
1. Création du compte dans `auth.users`
2. Création du profil dans `user_profiles`
3. Création de l'utilisateur interne dans `profil_internal_user`
4. Attribution automatique des permissions selon le rôle

### 2. Gestion des Permissions

Les permissions sont stockées en JSON et attribuées automatiquement selon le rôle :

```json
{
  "orders_management": true,
  "order_tracking": true,
  "order_status_update": true
}
```

### 3. Validation des Données

- **Email unique** par business
- **Rôle valide** selon la liste prédéfinie
- **Mot de passe** minimum 6 caractères
- **Champs obligatoires** : nom, email, rôle, mot de passe

## 📱 Interface Utilisateur

### Onglets

- **Clients** : Gestion des utilisateurs clients (données statiques pour l'instant)
- **Équipe Interne** : Gestion des utilisateurs internes (données dynamiques)

### Actions Disponibles

- ✅ **Voir** : Afficher les détails de l'utilisateur
- ✏️ **Modifier** : Modifier les informations (à implémenter)
- 🗑️ **Supprimer** : Supprimer l'utilisateur (avec confirmation)

### Filtres

- **Recherche** : Par nom, email ou téléphone
- **Statut** : Actif, Inactif, Suspendu
- **Rôle** : Selon le type d'utilisateur affiché

## 🔐 Sécurité

### Contraintes de Base de Données

- **Clés étrangères** vers `user_profiles` et `businesses`
- **Contrainte unique** sur `(business_id, email)`
- **Validation des rôles** avec CHECK constraint
- **Suppression en cascade** des profils utilisateurs

### Gestion des Erreurs

- Validation côté client et serveur
- Messages d'erreur informatifs
- Gestion des doublons d'email
- Rollback automatique en cas d'erreur

## 📊 Statistiques

### Métriques Affichées

- **Total utilisateurs** (clients ou équipe)
- **Utilisateurs actifs**
- **Commandes totales** ou **Rôles différents**
- **Revenus totaux** ou **Dernière connexion**

### Mise à Jour en Temps Réel

- Utilisation de React Query pour la synchronisation
- Invalidation automatique du cache
- Optimistic updates pour une meilleure UX

## 🧪 Tests

### Script de Test

Le fichier `scripts/test-internal-users.sql` contient des requêtes pour :

1. Vérifier la structure de la table
2. Tester les contraintes
3. Insérer des données de test
4. Valider les contraintes d'intégrité

### Tests Recommandés

- Création d'utilisateur avec rôle valide
- Tentative de création avec rôle invalide
- Tentative de création avec email dupliqué
- Suppression d'utilisateur
- Mise à jour des permissions

## 🚧 Améliorations Futures

### Fonctionnalités à Implémenter

- [ ] **Modification d'utilisateur** : Éditer les informations et permissions
- [ ] **Gestion des sessions** : Suivi des connexions en temps réel
- [ ] **Audit trail** : Historique des modifications
- [ ] **Notifications** : Alertes lors de la création/suppression
- [ ] **Import/Export** : Gestion en lot des utilisateurs
- [ ] **Templates de rôles** : Permissions personnalisées

### Optimisations

- [ ] **Pagination** pour les grandes listes
- [ ] **Cache intelligent** avec invalidation sélective
- [ ] **Lazy loading** des permissions détaillées
- [ ] **Recherche avancée** avec filtres multiples

## 📚 Utilisation

### Pour les Développeurs

1. **Importer le service** : `import { InternalUsersService } from '@/lib/services/internal-users'`
2. **Utiliser le hook** : `const { internalUsers, createUser } = useInternalUsers(businessId)`
3. **Gérer les états** : Loading, error, success states

### Pour les Partenaires

1. **Accéder à la page** : `/partner-dashboard/users`
2. **Basculer vers l'équipe interne** : Cliquer sur "Voir Équipe Interne"
3. **Ajouter un utilisateur** : Cliquer sur "Ajouter un Utilisateur Interne"
4. **Gérer les utilisateurs** : Utiliser les actions Voir/Modifier/Supprimer

## 🔍 Dépannage

### Problèmes Courants

- **Erreur de création** : Vérifier que l'email n'existe pas déjà
- **Permissions manquantes** : Vérifier le rôle sélectionné
- **Erreur de suppression** : Vérifier les contraintes de clés étrangères

### Logs et Debug

- Console du navigateur pour les erreurs côté client
- Logs Supabase pour les erreurs côté serveur
- Vérification des contraintes avec le script de test

---

**Note** : Ce système est conçu pour être extensible et sécurisé. Toute modification doit respecter les contraintes de sécurité et être testée avant déploiement.
