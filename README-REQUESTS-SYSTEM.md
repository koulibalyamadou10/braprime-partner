# Système de Gestion des Demandes - BraPrime

## 📋 Vue d'ensemble

Le système de gestion des demandes permet aux utilisateurs de soumettre des demandes pour devenir partenaires (commerces) ou chauffeurs sur la plateforme BraPrime. Les administrateurs peuvent ensuite examiner, approuver ou rejeter ces demandes.

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

#### Soumettre une demande
```typescript
import { useRequests } from '@/hooks/use-requests';

const { createRequest } = useRequests();

// Demande partenaire
createRequest({
  type: 'partner',
  business_name: 'Mon Restaurant',
  business_type: 'restaurant',
  business_address: '123 Rue Test, Conakry',
  notes: 'Je souhaite rejoindre la plateforme'
});

// Demande chauffeur
createRequest({
  type: 'driver',
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
1. Utilisateur soumet une demande via le formulaire
2. Demande créée avec statut "pending"
3. Admin examine la demande
4. Admin approuve → Profil partenaire créé automatiquement
5. Admin rejette → Demande marquée comme rejetée

### Demande chauffeur
1. Utilisateur soumet une demande via le formulaire
2. Demande créée avec statut "pending"
3. Admin examine la demande
4. Admin approuve → Profil chauffeur créé automatiquement
5. Admin rejette → Demande marquée comme rejetée

## 🚀 Installation

### 1. Créer la table
```bash
# Exécuter le script SQL
psql -d your_database -f scripts/create-requests-table.sql
```

### 2. Tester le système
```bash
# Créer des données de test
psql -d your_database -f scripts/test-requests-system.sql
```

### 3. Vérifier l'installation
- Vérifier que la table `requests` existe
- Vérifier que les politiques RLS sont actives
- Vérifier que la fonction `create_request` fonctionne
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
1. **Demande non créée** : Vérifier les contraintes et l'authentification
2. **Statut non mis à jour** : Vérifier les permissions RLS
3. **Profil non créé** : Vérifier la fonction `createProfileFromRequest`

### Debug
```sql
-- Vérifier les demandes d'un utilisateur
SELECT * FROM requests WHERE user_id = 'user-id';

-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'requests';

-- Vérifier les contraintes
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'requests'::regclass;
```

---

**Note** : Ce système est intégré dans l'application BraPrime et suit les conventions de développement établies pour le projet. 