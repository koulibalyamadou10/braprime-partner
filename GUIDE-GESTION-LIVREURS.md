# Guide de Gestion des Livreurs - BraPrime

## 📋 Vue d'ensemble

La fonctionnalité de gestion des livreurs permet aux partenaires de gérer leur équipe de livraison directement depuis leur dashboard. Cette fonctionnalité est essentielle pour assurer un service de livraison efficace et fiable.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités disponibles

- **Ajout de livreurs** : Ajouter de nouveaux livreurs à l'équipe
- **Modification des informations** : Mettre à jour les données des livreurs
- **Gestion du statut** : Activer/désactiver des livreurs
- **Suivi des performances** : Voir les statistiques de livraison et les notes
- **Gestion des véhicules** : Spécifier le type de véhicule et la plaque d'immatriculation
- **Interface intuitive** : Dashboard moderne et responsive

### 📊 Statistiques disponibles

- **Total des livreurs** : Nombre total de livreurs dans l'équipe
- **Livreurs actifs** : Nombre de livreurs actuellement actifs
- **Livraisons totales** : Nombre total de livraisons effectuées
- **Note moyenne** : Note moyenne de l'équipe de livreurs

## 🛠️ Installation et Configuration

### 1. Mise à jour de la base de données

Exécutez le script SQL suivant dans l'éditeur SQL de Supabase :

```sql
-- Exécuter le script scripts/add-drivers-table.sql
```

Ce script va :
- **Créer la table `drivers`** si elle n'existe pas
- Ajouter la colonne `business_id` à la table `drivers`
- Créer les index nécessaires pour les performances
- Configurer les politiques RLS (Row Level Security)
- Ajouter les triggers pour la mise à jour automatique

### 2. Vérification de l'installation

Après l'exécution du script, exécutez le script de vérification :

```sql
-- Exécuter le script scripts/verify-drivers-setup.sql
```

Ce script va vérifier que :
- La table `drivers` existe et contient toutes les colonnes nécessaires
- Les index sont créés correctement
- Les politiques RLS sont actives
- Les triggers fonctionnent
- Un test d'insertion/suppression fonctionne

### 3. Résolution des problèmes courants

#### Erreur "relation 'drivers' does not exist"

Si vous obtenez cette erreur, cela signifie que la table `drivers` n'existe pas encore. Le script `add-drivers-table.sql` corrigé va créer la table automatiquement.

#### Erreur de permissions

Si vous obtenez des erreurs de permissions, vérifiez que :
- Vous êtes connecté en tant qu'administrateur Supabase
- Vous avez les droits d'exécution de scripts SQL
- Les extensions `uuid-ossp` et `pgcrypto` sont activées

#### Erreur de contraintes

Si vous obtenez des erreurs de contraintes, cela peut être dû à :
- Des données existantes dans la table `businesses` qui ne respectent pas les contraintes
- Des politiques RLS qui bloquent les opérations

### 4. Test de la configuration

Après l'installation, testez la configuration :

1. Connectez-vous en tant que partenaire
2. Accédez au dashboard partenaire
3. Cliquez sur "Livreurs" dans le menu
4. Essayez d'ajouter un livreur de test
5. Vérifiez que le livreur apparaît dans la liste
6. Testez la modification et la suppression

## 📱 Utilisation

### Accès à la page

1. Connectez-vous en tant que partenaire
2. Accédez au dashboard partenaire
3. Cliquez sur "Livreurs" dans le menu de navigation

### Ajouter un livreur

1. Cliquez sur le bouton "Ajouter un Livreur"
2. Remplissez le formulaire :
   - **Nom complet** (obligatoire)
   - **Téléphone** (obligatoire)
   - **Email** (optionnel)
   - **Type de véhicule** (optionnel)
   - **Plaque d'immatriculation** (optionnel)
3. Cliquez sur "Ajouter"

### Modifier un livreur

1. Cliquez sur l'icône "Modifier" (crayon) à côté du livreur
2. Modifiez les informations souhaitées
3. Activez/désactivez le livreur si nécessaire
4. Cliquez sur "Mettre à jour"

### Supprimer un livreur

1. Cliquez sur l'icône "Supprimer" (poubelle) à côté du livreur
2. Confirmez la suppression dans la boîte de dialogue
3. Cliquez sur "Supprimer"

## 🔒 Sécurité

### Politiques RLS (Row Level Security)

Les politiques suivantes sont configurées :

- **Lecture** : Les partenaires ne peuvent voir que leurs propres livreurs
- **Création** : Les partenaires ne peuvent créer des livreurs que pour leur business
- **Modification** : Les partenaires ne peuvent modifier que leurs propres livreurs
- **Suppression** : Les partenaires ne peuvent supprimer que leurs propres livreurs

### Validation des données

- Le nom et le téléphone sont obligatoires
- L'email doit être au format valide
- Le type de véhicule doit être l'une des valeurs autorisées

## 📊 Types de véhicules supportés

- **Voiture** (`car`) : Pour les livraisons en voiture
- **Moto** (`motorcycle`) : Pour les livraisons en moto
- **Vélo** (`bike`) : Pour les livraisons en vélo

## 🔧 Configuration avancée

### Personnalisation des types de véhicules

Pour ajouter de nouveaux types de véhicules, modifiez :

1. Le fichier `src/pages/dashboard/PartnerDrivers.tsx`
2. Les fonctions `getVehicleIcon()` et `getVehicleLabel()`
3. Les options dans les composants `Select`

### Ajout de nouveaux champs

Pour ajouter de nouveaux champs aux livreurs :

1. Modifiez la table `drivers` dans la base de données
2. Mettez à jour les types TypeScript dans `src/lib/types/index.ts`
3. Modifiez les formulaires dans `PartnerDrivers.tsx`
4. Mettez à jour les services dans `partner-dashboard.ts`

## 🐛 Dépannage

### Problèmes courants

#### "Erreur lors de l'ajout du livreur"
- Vérifiez que vous êtes connecté en tant que partenaire
- Vérifiez que votre business existe dans la base de données
- Vérifiez que les champs obligatoires sont remplis

#### "Aucun livreur affiché"
- Vérifiez que vous avez des livreurs associés à votre business
- Vérifiez les politiques RLS
- Vérifiez les logs de la console

#### "Erreur de permissions"
- Vérifiez que vous êtes bien connecté en tant que partenaire
- Vérifiez que votre business est associé à votre compte
- Vérifiez les politiques RLS dans Supabase

### Logs et débogage

Pour déboguer les problèmes :

1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs dans l'onglet "Console"
3. Vérifiez les requêtes réseau dans l'onglet "Network"
4. Vérifiez les logs dans Supabase

## 📈 Évolutions futures

### Fonctionnalités prévues

- **Géolocalisation en temps réel** : Suivre la position des livreurs
- **Assignation automatique** : Assigner automatiquement les commandes aux livreurs
- **Notifications push** : Notifier les livreurs des nouvelles commandes
- **Historique détaillé** : Historique complet des livraisons par livreur
- **Système de bonus** : Bonus basés sur les performances
- **Intégration GPS** : Intégration avec des applications GPS

### Améliorations techniques

- **API REST** : Créer une API REST dédiée aux livreurs
- **Webhooks** : Notifications en temps réel via webhooks
- **Analytics avancés** : Tableaux de bord analytics pour les livreurs
- **Mobile app** : Application mobile pour les livreurs

## 📞 Support

Pour toute question ou problème :

1. Consultez ce guide
2. Vérifiez les logs de débogage
3. Contactez l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Auteur** : Équipe BraPrime 