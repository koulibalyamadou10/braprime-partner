# Guide d'Assignation de Livreurs - BraPrime

## Vue d'ensemble

Cette fonctionnalité permet aux partenaires d'assigner automatiquement un livreur à une commande lorsque celle-ci est prête pour la livraison.

## Prérequis

### 1. Base de données
Exécutez le script SQL pour ajouter les colonnes nécessaires à la table `orders` :

```sql
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- Fichier: scripts/add-driver-assignment-to-orders.sql
```

### 2. Livreurs configurés
Assurez-vous d'avoir des livreurs actifs dans votre business :
- Allez dans **Dashboard Partenaire > Livreurs**
- Ajoutez des livreurs avec leurs informations (nom, téléphone, type de véhicule)
- Vérifiez qu'ils sont marqués comme "actifs"

## Utilisation

### 1. Gestion des commandes
1. Allez dans **Dashboard Partenaire > Commandes**
2. Trouvez une commande avec le statut **"Prête"**
3. Vous verrez un nouveau bouton **"Assigner livreur"** avec l'icône de camion

### 2. Assignation d'un livreur
1. Cliquez sur **"Assigner livreur"**
2. Une fenêtre s'ouvre avec la liste des livreurs disponibles
3. Sélectionnez un livreur dans la liste déroulante
4. Vérifiez les informations du livreur sélectionné :
   - Nom et téléphone
   - Type de véhicule et plaque
   - Note et nombre de livraisons
5. Cliquez sur **"Assigner le livreur"**

### 3. Résultat de l'assignation
- Le livreur est assigné à la commande
- Le statut de la commande passe automatiquement à **"En livraison"**
- Le livreur apparaît comme "occupé" dans la liste des livreurs
- Une notification est envoyée au client

## Fonctionnalités

### Filtrage automatique
- Seuls les livreurs **actifs** et **disponibles** (sans commande en cours) sont affichés
- Les livreurs sont triés par note (meilleure note en premier)

### Informations détaillées
Pour chaque livreur, vous pouvez voir :
- **Nom et téléphone** : pour contacter le livreur
- **Type de véhicule** : moto, voiture, vélo, etc.
- **Plaque d'immatriculation** : pour identifier le véhicule
- **Note moyenne** : basée sur les livraisons précédentes
- **Nombre de livraisons** : expérience du livreur

### Gestion des erreurs
- Si aucun livreur n'est disponible, un message explicatif s'affiche
- En cas d'erreur lors de l'assignation, un message d'erreur apparaît
- Possibilité de réessayer en cas de problème de chargement

## Workflow complet

### 1. Commande reçue
- Statut : **"En attente"**
- Actions possibles : Confirmer ou Annuler

### 2. Commande confirmée
- Statut : **"Confirmée"**
- Actions possibles : Mettre en préparation ou Annuler

### 3. Commande en préparation
- Statut : **"En préparation"**
- Actions possibles : Marquer comme prête

### 4. Commande prête
- Statut : **"Prête"**
- Actions possibles : **Assigner un livreur** (nouveau bouton)

### 5. Livreur assigné
- Statut : **"En livraison"** (automatique)
- Le livreur est notifié
- Le client reçoit une notification

### 6. Livraison terminée
- Statut : **"Livrée"**
- Le livreur est libéré automatiquement

## Gestion des livreurs

### Ajouter un livreur
1. Allez dans **Dashboard Partenaire > Livreurs**
2. Cliquez sur **"Ajouter un livreur"**
3. Remplissez les informations :
   - Nom complet
   - Numéro de téléphone
   - Email (optionnel)
   - Type de véhicule
   - Plaque d'immatriculation
4. Cliquez sur **"Ajouter"**

### Gérer les livreurs
- **Activer/Désactiver** : Pour rendre un livreur disponible ou non
- **Modifier** : Changer les informations du livreur
- **Supprimer** : Retirer un livreur du système

## Notifications

### Pour le client
- Notification quand un livreur est assigné
- Informations du livreur (nom, téléphone)
- Statut de la livraison en temps réel

### Pour le livreur
- Notification de nouvelle commande assignée
- Détails de la commande et de la livraison
- Instructions de livraison

## Dépannage

### Problème : Aucun livreur disponible
**Solution :**
1. Vérifiez que vous avez des livreurs dans votre business
2. Assurez-vous qu'ils sont marqués comme "actifs"
3. Vérifiez qu'ils n'ont pas de commande en cours

### Problème : Erreur lors de l'assignation
**Solution :**
1. Vérifiez votre connexion internet
2. Rechargez la page et réessayez
3. Contactez le support si le problème persiste

### Problème : Livreur non libéré après livraison
**Solution :**
1. Vérifiez que la commande est bien marquée comme "Livrée"
2. Le livreur devrait être libéré automatiquement
3. Si le problème persiste, allez dans la gestion des livreurs et libérez manuellement

## Sécurité

### RLS (Row Level Security)
- Les partenaires ne peuvent voir que leurs propres livreurs
- Les partenaires ne peuvent assigner que leurs propres livreurs
- Chaque business gère ses livreurs indépendamment

### Validation des données
- Vérification que le livreur est actif avant assignation
- Vérification que le livreur n'a pas de commande en cours
- Validation des informations de contact

## Support

Si vous rencontrez des problèmes avec cette fonctionnalité :

1. **Vérifiez les prérequis** : base de données et livreurs configurés
2. **Consultez ce guide** : pour les solutions courantes
3. **Contactez le support** : avec les détails de l'erreur

---

**Note :** Cette fonctionnalité améliore significativement l'efficacité de la gestion des livraisons en automatisant l'assignation des livreurs et en fournissant toutes les informations nécessaires pour un suivi optimal. 