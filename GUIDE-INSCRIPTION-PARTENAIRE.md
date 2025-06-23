# Guide d'Inscription Partenaire avec Création de Service

## Vue d'ensemble

BraPrime propose maintenant un processus d'inscription simplifié pour les partenaires qui permet de créer leur compte ET leur service en une seule étape. Cette fonctionnalité améliore l'expérience utilisateur et accélère l'intégration des nouveaux partenaires.

## Fonctionnalités

### ✅ **Inscription Unifiée**
- Création du compte partenaire et du service en une seule étape
- Interface intuitive et responsive
- Validation en temps réel des champs

### ✅ **Types de Services Supportés**
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

### ✅ **Champs Requis pour le Service**
- Nom du service
- Type de service
- Description
- Adresse
- Téléphone
- Heures d'ouverture
- Temps de livraison
- Frais de livraison
- Image de couverture (optionnel)

## Processus d'Inscription

### 1. **Accès au Formulaire**
- Cliquer sur "Créer un compte" dans l'en-tête
- Ou via le modal de connexion

### 2. **Informations Personnelles**
```
- Nom complet
- Email
- Mot de passe
- Confirmation du mot de passe
- Type de compte (Client/Partenaire)
- Numéro de téléphone
- Adresse
```

### 3. **Informations du Service** (Partenaires uniquement)
```
- Nom du service
- Type de service (sélection dans la liste)
- Description détaillée
- Adresse du service
- Téléphone du service
- Heures d'ouverture
- Temps de livraison
- Frais de livraison (FCFA)
- Image de couverture (URL optionnelle)
```

### 4. **Validation et Création**
- Validation automatique de tous les champs
- Création du compte utilisateur
- Création automatique du service
- Notification de succès

## Interface Utilisateur

### **Design Responsive**
- Modal adaptatif (800px max-width)
- Scroll vertical si nécessaire
- Grille responsive (1-2 colonnes selon l'écran)

### **Sections Organisées**
1. **Informations personnelles** : Données du partenaire
2. **Informations du service** : Détails du service (partenaires uniquement)

### **Validation Visuelle**
- Champs requis marqués en rouge si vides
- Messages d'erreur explicites
- Indicateurs de chargement

## Gestion des Erreurs

### **Erreurs de Validation**
- Champs obligatoires non remplis
- Mots de passe ne correspondant pas
- Format d'email invalide

### **Erreurs de Création**
- **Compte créé, service échoué** : Le compte est créé mais le service doit être créé manuellement
- **Échec complet** : Aucun élément n'est créé

### **Messages d'Erreur**
- Messages en français
- Explications claires
- Suggestions de résolution

## Avantages

### **Pour les Partenaires**
- **Processus simplifié** : Une seule étape au lieu de deux
- **Démarrage rapide** : Service immédiatement opérationnel
- **Interface intuitive** : Formulaire guidé et clair

### **Pour la Plateforme**
- **Intégration accélérée** : Plus de partenaires rapidement
- **Données complètes** : Toutes les informations nécessaires
- **Réduction des erreurs** : Validation automatique

## Exemples d'Utilisation

### **Restaurant**
```
Nom: "Le Petit Baoulé"
Type: Restaurant
Description: "Découvrez les saveurs authentiques de la cuisine guinéenne traditionnelle"
Adresse: "Rue KA-003, Quartier Almamya, Kaloum, Conakry"
Téléphone: "+224 621 23 45 67"
Heures: "10:00 - 22:00"
Livraison: "25-35 min"
Frais: "15000"
```

### **Pharmacie**
```
Nom: "Pharmacie Centrale"
Type: Pharmacie
Description: "Pharmacie offrant une large gamme de médicaments et conseils professionnels"
Adresse: "Avenue de la République, Kaloum, Conakry"
Téléphone: "+224 622 45 67 89"
Heures: "24h/24, 7j/7"
Livraison: "20-35 min"
Frais: "15000"
```

### **Supermarché**
```
Nom: "Supermarché Madina"
Type: Supermarché
Description: "Votre supermarché de confiance pour tous vos besoins quotidiens"
Adresse: "Rue KA-020, Madina, Conakry"
Téléphone: "+224 628 34 56 78"
Heures: "08:00 - 21:00"
Livraison: "30-45 min"
Frais: "12000"
```

## Configuration Technique

### **Hooks Utilisés**
```typescript
import { useAvailableServiceTypes } from '@/hooks/use-dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
```

### **Services Intégrés**
```typescript
// Création du compte
const success = await signup(userData, signupPassword);

// Création du service (si partenaire)
if (signupRole === 'partner') {
  const { DashboardService } = await import('@/lib/services/dashboard');
  await DashboardService.createService(serviceData);
}
```

### **Validation**
```typescript
// Validation spécifique pour les partenaires
if (signupRole === 'partner') {
  if (!serviceName) errors.serviceName = 'Le nom du service est requis';
  if (!serviceDescription) errors.serviceDescription = 'La description du service est requise';
  // ... autres validations
}
```

## Tests et Validation

### **Tests Fonctionnels**
1. **Inscription Client** : Vérifier que seules les infos personnelles sont demandées
2. **Inscription Partenaire** : Vérifier que les infos du service sont requises
3. **Validation** : Tester tous les champs obligatoires
4. **Création** : Vérifier que le compte et le service sont créés

### **Tests d'Interface**
1. **Responsive** : Tester sur mobile, tablette, desktop
2. **Accessibilité** : Navigation au clavier, lecteurs d'écran
3. **Performance** : Temps de chargement des types de services

## Prochaines Améliorations

### **Fonctionnalités Futures**
- **Upload d'images** : Permettre l'upload direct d'images
- **Géolocalisation** : Détection automatique de l'adresse
- **Prévisualisation** : Aperçu du service avant création
- **Templates** : Modèles prédéfinis par type de service

### **Optimisations**
- **Cache** : Mise en cache des types de services
- **Validation côté serveur** : Double validation
- **Sauvegarde automatique** : Sauvegarde des données en cours

## Support

### **En Cas de Problème**
1. Vérifier la connexion internet
2. S'assurer que tous les champs obligatoires sont remplis
3. Vérifier le format des données (email, téléphone, etc.)
4. Contacter le support si le problème persiste

### **Messages d'Erreur Courants**
- **"Le nom du service est requis"** : Remplir le champ nom du service
- **"Les mots de passe ne correspondent pas"** : Vérifier la confirmation
- **"L'email est requis"** : Remplir le champ email avec un format valide

---

**Inscription partenaire simplifiée et efficace !** 🎉

Les partenaires peuvent maintenant créer leur compte et leur service en une seule étape, accélérant ainsi leur intégration sur la plateforme BraPrime. 