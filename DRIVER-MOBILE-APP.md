# 🚗 Application Mobile pour Chauffeurs

## 📱 Vue d'ensemble

Les chauffeurs de BraPrime utilisent exclusivement l'**application mobile dédiée** pour gérer leurs livraisons et leurs activités professionnelles.

## 🔄 Architecture

### Web App (Dashboard)
- **Rôle** : Interface web pour les partenaires et administrateurs
- **Fonctionnalités** : Gestion des chauffeurs, assignation, monitoring
- **Pages supprimées** : `DriverDashboard.tsx`, `DriverDetails.tsx` (pages web)

### Mobile App (Chauffeurs)
- **Rôle** : Interface mobile native pour les chauffeurs
- **Fonctionnalités** : 
  - Connexion/authentification chauffeur
  - Réception des commandes en temps réel
  - Navigation GPS
  - Gestion des statuts de livraison
  - Suivi des gains
  - Sessions de travail

## 🛠️ Services Conservés

Les services suivants sont conservés dans l'application web car ils sont utilisés par :

### Services Partenaires
- `driver-management.ts` - Gestion des chauffeurs par les partenaires
- `driver-assignment.ts` - Assignation des commandes aux chauffeurs
- `driver-auth-partner.ts` - Authentification des chauffeurs par les partenaires

### Services Admin
- `driver-auth-admin.ts` - Gestion des chauffeurs par l'admin
- `drivers.ts` - Services généraux pour les chauffeurs

### Services API
- `driver-auth.ts` - Authentification chauffeur (utilisé par l'app mobile)
- `driver-dashboard.ts` - Données du dashboard (API pour l'app mobile)
- `driver-details.ts` - Détails chauffeur (API pour l'app mobile)

## 🔌 API Endpoints

L'application web expose des endpoints API utilisés par l'app mobile :

```
POST   /api/driver/auth/login
POST   /api/driver/auth/register
GET    /api/driver/dashboard/stats
GET    /api/driver/orders/available
POST   /api/driver/orders/:id/accept
PUT    /api/driver/orders/:id/status
GET    /api/driver/profile
PUT    /api/driver/profile
```

## 📊 Routes Web Conservées

### Authentification Chauffeur
- `/driver/login` - Page de connexion chauffeur
- `/driver/register` - Page d'inscription chauffeur

### Gestion Partenaire
- `/partner-dashboard/drivers` - Liste des chauffeurs
- `/partner-dashboard/drivers/:id` - Détails d'un chauffeur

### Gestion Admin
- `/admin/drivers` - Gestion des chauffeurs par l'admin

## 🗂️ Fichiers Supprimés

### Pages Dashboard
- `src/pages/dashboard/DriverDashboard.tsx` ❌
- `src/pages/dashboard/DriverDetails.tsx` ❌

### Composants
- `DriverDashboardSkeleton` dans `DashboardSkeletons.tsx` ❌

### Routes
- `/driver/dashboard/*` ❌
- `/driver-dashboard/*` ❌

## 🔐 Authentification

### Web App
- Les chauffeurs peuvent se connecter via `/driver/login`
- Redirection vers l'app mobile après authentification
- Pas d'accès au dashboard web

### Mobile App
- Authentification native
- Sessions persistantes
- Notifications push pour les nouvelles commandes

## 📈 Avantages

1. **Performance** : Interface native optimisée pour mobile
2. **UX** : Expérience utilisateur adaptée aux chauffeurs
3. **Fonctionnalités** : GPS, notifications push, mode hors ligne
4. **Sécurité** : Authentification native sécurisée
5. **Maintenance** : Séparation claire des responsabilités

## 🚀 Déploiement

- **Web App** : Dashboard pour partenaires et admins
- **Mobile App** : Application native pour chauffeurs
- **API** : Services partagés entre les deux applications

---

*Les chauffeurs utilisent exclusivement l'application mobile pour une expérience optimale et des fonctionnalités avancées.* 