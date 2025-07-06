# Système de Gestion des Demandes - BraPrime

## 📋 Vue d'ensemble

Le système de gestion des demandes permet aux utilisateurs de soumettre des demandes pour devenir partenaires (commerces) ou chauffeurs sur la plateforme BraPrime. Les administrateurs peuvent ensuite examiner, approuver ou rejeter ces demandes.

## 🚀 Fonctionnalités Principales

### Système de Commandes
- Panier persistant avec Supabase
- Calcul automatique des frais de livraison
- Suivi GPS en temps réel
- Historique détaillé des statuts
- **Gestion des types de livraison :**
  - **ASAP** : Livraison rapide (par défaut)
  - **Scheduled** : Livraison programmée avec fenêtres horaires
  - Heures préférées et fenêtres de livraison
  - Disponibilité pour les chauffeurs
  - Suivi des heures estimées et réelles

### Types de Livraison

#### Livraison ASAP
- **Définition** : Livraison rapide, dès que possible
- **Champs utilisés** :
  - `delivery_type: 'asap'`
  - `estimated_delivery_time` : Heure estimée de livraison
  - `actual_delivery_time` : Heure réelle de livraison
  - `available_for_drivers` : Si la commande est disponible pour les chauffeurs

#### Livraison Programmée
- **Définition** : Livraison à une heure spécifique ou dans une fenêtre horaire
- **Champs utilisés** :
  - `delivery_type: 'scheduled'`
  - `preferred_delivery_time` : Heure préférée du client
  - `scheduled_delivery_window_start` : Début de la fenêtre de livraison
  - `scheduled_delivery_window_end` : Fin de la fenêtre de livraison
  - `estimated_delivery_time` : Heure estimée dans la fenêtre
  - `actual_delivery_time` : Heure réelle de livraison

### Interface Partenaire

#### Filtres de Commandes
- **Filtre par statut** : En attente, confirmée, en préparation, etc.
- **Filtre par type de livraison** : ASAP, Programmée, Tous les types
- **Recherche** : Par client, ID commande, téléphone

#### Affichage des Commandes
- **Colonne "Livraison"** : Badge visuel avec type et informations
- **Badge ASAP** : Orange avec icône ⚡
- **Badge Programmée** : Bleu avec icône 📅
- **Informations détaillées** : Heures, fenêtres, disponibilité

#### Dialogue de Détails
- **Section livraison complète** : Toutes les informations de livraison
- **Badge DeliveryInfoBadge** : Affichage visuel du type
- **Informations supplémentaires** : Heures, fenêtres, statut chauffeur

## 🏗️ Architecture

### Base de données

#### Table `requests`
```sql
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('partner', 'driver')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    
    -- Informations pour les partenaires
    business_name VARCHAR(100),
    business_type VARCHAR(50),
    business_address TEXT,
    
    -- Informations pour les chauffeurs
    vehicle_type VARCHAR(20),
    vehicle_plate VARCHAR(20),
    
    -- Documents (JSON array)
    documents JSONB DEFAULT '[]',
    
    -- Notes
    notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES user_profiles(id)
);
```

#### Statuts des demandes
- **pending** : En attente d'examen
- **under_review** : En cours de révision
- **approved** : Approuvée
- **rejected** : Rejetée

### Sécurité (RLS)

Les politiques Row Level Security (RLS) garantissent que :
- Les admins peuvent voir et gérer toutes les demandes
- Les utilisateurs ne peuvent voir que leurs propres demandes
- Les utilisateurs peuvent créer et modifier leurs demandes en attente

## 🔧 Fonctionnalités

### Pour les utilisateurs

#### Soumettre une demande (sans connexion requise)
```typescript
import { useRequestsSimple } from '@/hooks/use-requests-simple';

const { createRequest } = useRequestsSimple();

// Demande partenaire
createRequest({
  type: 'partner',
  user_name: 'Nom du demandeur',
  user_email: 'email@example.com',
  user_phone: '+224123456789',
  business_name: 'Mon Restaurant',
  business_type: 'restaurant',
  business_address: '123 Rue Test, Conakry',
  notes: 'Je souhaite rejoindre la plateforme'
});

// Demande chauffeur
createRequest({
  type: 'driver',
  user_name: 'Nom du demandeur',
  user_email: 'email@example.com',
  user_phone: '+224123456789',
  vehicle_type: 'motorcycle',
  vehicle_plate: 'ABC123',
  notes: 'Je souhaite devenir chauffeur'
});
```

#### Vérifier le statut
```typescript
const { currentRequestStatus, hasPendingRequest } = useRequests();

// Afficher le badge de statut dans le header
<RequestStatusBadge />
```

#### Gérer les demandes
```typescript
const { requests, updateRequest, cancelRequest } = useRequests();

// Mettre à jour une demande
updateRequest(requestId, { business_name: 'Nouveau nom' });

// Annuler une demande
cancelRequest(requestId);
```

### Pour les administrateurs

#### Dashboard des demandes
- Vue d'ensemble avec statistiques
- Liste de toutes les demandes avec filtres
- Actions d'approbation/rejet
- Notes administratives

#### Gestion des demandes
```typescript
import { useAdminRequests } from '@/hooks/use-admin-requests';

const { requests, stats, updateStatus, deleteRequest } = useAdminRequests();

// Approuver une demande
updateStatus(requestId, 'approved', 'Demande approuvée après vérification');

// Rejeter une demande
updateStatus(requestId, 'rejected', 'Documents incomplets');

// Mettre en révision
updateStatus(requestId, 'under_review', 'Nécessite plus d\'informations');
```

## 📊 Statistiques

La vue `requests_stats` fournit :
- Total des demandes
- Demandes par statut
- Demandes par type (partenaire/chauffeur)
- Demandes des 7 et 30 derniers jours

## 🎨 Interface utilisateur

### Badge de statut
Le composant `RequestStatusBadge` affiche le statut de la demande en cours dans le header :
- 🟡 En attente
- 🔵 En révision
- 🟢 Approuvée
- 🔴 Rejetée

### Page d'administration
- Onglet "Demandes" dans le dashboard admin
- Filtres par type, statut, date
- Actions rapides (approuver, rejeter, mettre en révision)
- Vue détaillée de chaque demande

## 🔄 Workflow

### Demande partenaire
1. **Utilisateur non connecté** soumet une demande via le formulaire
2. Demande créée avec statut "pending" (user_id = NULL)
3. Admin examine la demande
4. Admin approuve → Demande marquée comme approuvée
5. Admin crée le compte → Profil partenaire et business créés
6. Email envoyé avec les informations de connexion
7. Utilisateur peut se connecter avec email/mot de passe

### Demande chauffeur
1. **Utilisateur non connecté** soumet une demande via le formulaire
2. Demande créée avec statut "pending" (user_id = NULL)
3. Admin examine la demande
4. Admin approuve → Demande marquée comme approuvée
5. Admin crée le compte → Profil chauffeur créé
6. Email envoyé avec les informations de connexion
7. Utilisateur peut se connecter avec email/mot de passe

## 🔓 Accès Public

### Avantages
- **Aucune inscription requise** : Les utilisateurs peuvent soumettre des demandes sans créer de compte
- **Processus simplifié** : Formulaire direct sans étapes d'authentification
- **Conversion améliorée** : Réduction des frictions pour les nouveaux utilisateurs
- **Données complètes** : Collecte des informations de contact directement dans le formulaire

### Sécurité
- **Validation côté client et serveur** : Vérification des données soumises
- **Politiques RLS** : Contrôle d'accès approprié pour les demandes anonymes
- **Protection anti-spam** : Validation des emails et téléphones
- **Audit complet** : Traçabilité de toutes les demandes

## 🔐 Création de Comptes

### Fonctionnalité de création de comptes
Après approbation d'une demande, l'administrateur peut créer le compte de connexion :

1. **Bouton "Créer le compte"** : Apparaît pour les demandes approuvées
2. **Génération de mot de passe** : Bouton "Générer" pour créer un mot de passe sécurisé
3. **Copie du mot de passe** : Bouton pour copier le mot de passe dans le presse-papiers
4. **Création automatique** : Le système crée :
   - Compte Supabase Auth
   - Profil utilisateur dans `user_profiles`
   - Profil business (pour les partenaires)
   - Profil driver (pour les chauffeurs)
5. **Envoi d'email** : Les informations de connexion sont envoyées automatiquement

### Service de création de comptes
```typescript
import { AdminAccountCreationService } from '@/lib/services/admin-account-creation';

// Créer un compte partenaire
const result = await AdminAccountCreationService.createUserAccount({
  email: 'partenaire@example.com',
  password: 'MotDePasse123!',
  name: 'Nom du Partenaire',
  phone_number: '+224123456789',
  role: 'partner',
  requestId: 'request-uuid'
});

// Envoyer les informations de connexion
await AdminAccountCreationService.sendLoginCredentials(
  'partenaire@example.com',
  'MotDePasse123!',
  'Nom du Partenaire',
  'partner'
);
```

### Permissions requises
Exécuter le script de configuration des permissions :
```bash
psql -d your_database -f scripts/setup-account-creation-permissions.sql
```

### Sécurité et bonnes pratiques

#### Génération de mots de passe
- Mots de passe de 12 caractères avec majuscules, minuscules, chiffres et symboles
- Génération côté client pour éviter l'exposition en transit
- Copie sécurisée dans le presse-papiers

#### Validation des données
- Vérification de l'unicité des emails avant création
- Validation des rôles et permissions
- Gestion des erreurs avec rollback automatique

#### Envoi d'emails
- Template d'email professionnel avec informations de connexion
- Instructions claires pour la première connexion
- Recommandation de changement de mot de passe

#### Audit et traçabilité
- Toutes les créations de comptes sont tracées dans les notes admin
- Horodatage des actions
- Logs des erreurs pour le debugging

## 🚀 Installation

### Installation automatique (recommandée)
```bash
# Exécuter le script d'installation complet
psql -d your_database -f scripts/install-requests-complete.sql
```

### Installation manuelle (alternative)

Si vous préférez exécuter les scripts séparément :

#### 1. Corriger les rôles utilisateurs
```bash
# Corriger les rôles manquants dans user_roles
psql -d your_database -f scripts/fix-user-roles.sql
```

#### 2. Créer la table des demandes
```bash
# Exécuter le script SQL
psql -d your_database -f scripts/create-requests-table.sql
```

#### 3. Activer les demandes anonymes
```bash
# Permettre les demandes sans connexion
psql -d your_database -f scripts/allow-anonymous-requests.sql
```

**⚠️ Important** : Si vous obtenez une erreur "null value in column user_id violates not-null constraint", exécutez ce script dans l'éditeur SQL de Supabase :
```sql
-- Script simplifié pour corriger la contrainte
ALTER TABLE requests ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_user_id_fkey;
ALTER TABLE requests ADD CONSTRAINT requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
```

#### 4. Tester le système
```bash
# Créer des données de test
psql -d your_database -f scripts/test-requests-system.sql
```

#### 5. Tester les demandes anonymes
```bash
# Tester les demandes sans connexion
psql -d your_database -f scripts/test-anonymous-request.sql
```

### 4. Vérifier l'installation
- Vérifier que la table `requests` existe
- Vérifier que les politiques RLS sont actives
- Vérifier que la fonction `create_request` fonctionne

### 5. Ajouter des demandes de test (optionnel)
```bash
# Ajouter des demandes détaillées avec données réalistes
psql -d your_database -f scripts/add-test-requests.sql

# Ou ajouter des demandes rapides pour tests
psql -d your_database -f scripts/quick-add-requests.sql
```

### 6. Nettoyer les demandes de test (si nécessaire)
```bash
# Supprimer toutes les demandes de test
psql -d your_database -f scripts/clean-test-requests.sql
```
- Tester la création de demandes via l'interface

## 📝 API

### Endpoints Supabase

#### Créer une demande
```sql
SELECT create_request(
    p_type VARCHAR(20),
    p_business_name VARCHAR(100) DEFAULT NULL,
    p_business_type VARCHAR(50) DEFAULT NULL,
    p_business_address TEXT DEFAULT NULL,
    p_vehicle_type VARCHAR(20) DEFAULT NULL,
    p_vehicle_plate VARCHAR(20) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
);
```

#### Récupérer les demandes
```sql
-- Toutes les demandes (admin)
SELECT * FROM requests ORDER BY created_at DESC;

-- Demandes de l'utilisateur connecté
SELECT * FROM requests WHERE user_id = auth.uid();
```

#### Statistiques
```sql
SELECT * FROM requests_stats;
```

## 🔒 Sécurité

### Contraintes de base de données
- Contraintes CHECK sur les types et statuts
- Clés étrangères vers `user_profiles`
- Contraintes d'unicité appropriées

### Politiques RLS
- Isolation des données par utilisateur
- Permissions d'administration
- Protection contre les modifications non autorisées

### Validation côté client
- Validation des formulaires avec Zod
- Vérification des types TypeScript
- Gestion des erreurs appropriée

## 🧪 Tests

### Tests de base de données
```sql
-- Vérifier les contraintes
INSERT INTO requests (type, user_id, user_name, user_email, user_phone, status) 
VALUES ('invalid_type', 'user-id', 'Test', 'test@test.com', '+224123456789', 'invalid_status');
-- Devrait échouer
```

### Tests d'intégration
- Création de demandes via l'interface
- Approbation/rejet par l'admin
- Vérification de la création automatique des profils

## 📈 Monitoring

### Métriques à surveiller
- Nombre de demandes par jour
- Temps moyen de traitement
- Taux d'approbation/rejet
- Demandes en attente

### Logs
- Création de demandes
- Changements de statut
- Actions administratives
- Erreurs de validation

## 🔧 Maintenance

### Nettoyage
- Supprimer les demandes rejetées anciennes
- Archiver les demandes approuvées
- Nettoyer les documents temporaires

### Optimisation
- Index sur les colonnes fréquemment requêtées
- Pagination pour les listes longues
- Mise en cache des statistiques

## 🆘 Support

### Problèmes courants

#### 1. Erreur de clé étrangère sur user_roles
```
ERROR: insert or update on table "user_profiles" violates foreign key constraint "user_profiles_role_id_fkey"
DETAIL: Key (role_id)=(1) is not present in table "user_roles".
```

**Solution :**
```bash
# Exécuter le script de correction des rôles
psql -d your_database -f scripts/fix-user-roles.sql
```

#### 2. Erreur de colonne inexistante current_order_id
```
ERROR: column drivers.current_order_id does not exist
```

**Solution :**
```bash
# Exécuter le script de suppression de la colonne
psql -d your_database -f scripts/remove-current-order-id.sql
```

**Explication :** Cette colonne a été supprimée car les drivers peuvent maintenant gérer plusieurs commandes simultanément (jusqu'à 3). Le système utilise maintenant `active_orders_count` pour suivre les commandes actives.

#### 2. Demande non créée
**Causes possibles :**
- Contraintes de base de données non respectées
- Problème d'authentification
- Politiques RLS trop restrictives

**Solution :**
```sql
-- Vérifier les contraintes
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'requests'::regclass;

-- Vérifier l'authentification
SELECT auth.uid();
```

#### 3. Statut non mis à jour
**Causes possibles :**
- Permissions RLS insuffisantes
- Utilisateur non admin

**Solution :**
```sql
-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'requests';

-- Vérifier le rôle de l'utilisateur
SELECT up.role_id, ur.name 
FROM user_profiles up 
JOIN user_roles ur ON up.role_id = ur.id 
WHERE up.id = auth.uid();
```

#### 4. Profil non créé lors de l'approbation
**Causes possibles :**
- Fonction `createProfileFromRequest` échoue
- Données manquantes dans la demande

**Solution :**
```sql
-- Vérifier la fonction
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'createProfileFromRequest';

-- Vérifier les données de la demande
SELECT * FROM requests WHERE id = 'request-id';
```

### Debug

#### Vérifier les demandes d'un utilisateur
```sql
SELECT * FROM requests WHERE user_id = 'user-id';
```

#### Vérifier les politiques RLS
```sql
SELECT * FROM pg_policies WHERE tablename = 'requests';
```

#### Vérifier les contraintes
```sql
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'requests'::regclass;
```

#### Vérifier les rôles utilisateurs
```sql
SELECT id, name FROM user_roles ORDER BY id;
```

#### Vérifier les utilisateurs et leurs rôles
```sql
SELECT 
    up.id,
    up.name,
    up.email,
    up.role_id,
    ur.name as role_name
FROM user_profiles up
LEFT JOIN user_roles ur ON up.role_id = ur.id
ORDER BY up.created_at DESC;
```

---

**Note** : Ce système est intégré dans l'application BraPrime et suit les conventions de développement établies pour le projet.

## 🚚 Tests des Types de Livraison

### Scripts de Test

#### Ajouter des commandes de test avec types de livraison
```bash
# Exécuter le script de test des types de livraison
psql -d your_database -f scripts/add-test-orders-with-delivery-types.sql
```

Ce script ajoute :
- **3 commandes ASAP** : Livraison rapide avec heures estimées
- **3 commandes programmées** : Livraison à des heures spécifiques
- **Données variées** : Différents statuts, montants, adresses

#### Vérifier les types de livraison
```sql
-- Voir toutes les commandes avec leur type de livraison
SELECT 
  id,
  business_name,
  delivery_type,
  status,
  grand_total,
  preferred_delivery_time,
  scheduled_delivery_window_start,
  scheduled_delivery_window_end,
  available_for_drivers,
  estimated_delivery_time
FROM orders 
ORDER BY created_at DESC;

-- Statistiques par type de livraison
SELECT 
  delivery_type,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  AVG(grand_total) as average_order_value
FROM orders 
GROUP BY delivery_type;
```

### Interface de Test

#### Dashboard Partenaire
1. **Connectez-vous** en tant que partenaire
2. **Allez dans "Commandes"** dans le dashboard
3. **Vérifiez les filtres** :
   - Filtre par statut (En attente, Confirmée, etc.)
   - **Nouveau filtre par type de livraison** (ASAP, Programmée, Tous)
4. **Observez la colonne "Livraison"** :
   - Badge orange ⚡ pour ASAP
   - Badge bleu 📅 pour programmée
   - Informations détaillées au survol

#### Dialogue de Détails
1. **Cliquez sur une commande** pour voir les détails
2. **Vérifiez la section "Informations de livraison"** :
   - Badge DeliveryInfoBadge avec type et icône
   - Heures préférées pour les commandes programmées
   - Fenêtres de livraison
   - Statut de disponibilité pour les chauffeurs

### Composants Créés

#### DeliveryInfoBadge
- **Fichier** : `src/components/DeliveryInfoBadge.tsx`
- **Fonctionnalités** :
  - Affichage visuel du type de livraison
  - Badges colorés (orange pour ASAP, bleu pour programmée)
  - Informations détaillées selon le type
  - Formatage des heures et dates

#### Interface PartnerOrder
- **Fichier** : `src/lib/services/partner-dashboard.ts`
- **Nouveaux champs** :
  - `delivery_type: 'asap' | 'scheduled'`
  - `preferred_delivery_time?: string`
  - `scheduled_delivery_window_start?: string`
  - `scheduled_delivery_window_end?: string`
  - `available_for_drivers: boolean`
  - `estimated_delivery_time?: string`
  - `actual_delivery_time?: string`

### Utilisation

#### Pour les Partenaires
- **Filtrer les commandes** par type de livraison
- **Prioriser les commandes ASAP** qui nécessitent une préparation rapide
- **Planifier les commandes programmées** selon les fenêtres horaires
- **Gérer la disponibilité** pour les chauffeurs

#### Pour les Chauffeurs (Mobile App)
- **Voir les commandes disponibles** selon `available_for_drivers`
- **Prioriser les commandes ASAP** pour des gains rapides
- **Accepter les commandes programmées** selon leur planning
- **Respecter les fenêtres horaires** pour les livraisons programmées

### Avantages

#### Pour les Clients
- **Choix flexible** : ASAP pour l'urgence, programmée pour la planification
- **Transparence** : Heures estimées et fenêtres de livraison claires
- **Convenance** : Livraison à l'heure souhaitée

#### Pour les Partenaires
- **Gestion optimisée** : Distinction claire entre types de commandes
- **Planification** : Préparation selon les priorités
- **Efficacité** : Interface adaptée aux différents workflows

#### Pour les Chauffeurs
- **Flexibilité** : Choix selon disponibilité et préférences
- **Optimisation** : Gestion des trajets selon les fenêtres
- **Gains** : Possibilité de combiner commandes ASAP et programmées 