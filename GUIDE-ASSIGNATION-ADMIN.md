# Guide d'Assignation des Livreurs par l'Administrateur

## Vue d'ensemble

L'administrateur de la plateforme BraPrime peut maintenant assigner des livreurs à toutes les commandes de la plateforme, pas seulement celles de son propre commerce. Cette fonctionnalité permet une gestion centralisée de la logistique de livraison.

## Fonctionnalités Disponibles

### 1. Accès à Toutes les Commandes
- L'admin peut voir toutes les commandes de tous les commerces
- Filtrage par statut, commerce, et recherche textuelle
- Vue en temps réel des commandes prêtes pour la livraison

### 2. Assignation de Livreurs
- Assignation de livreurs à toutes les commandes prêtes
- Sélection parmi tous les livreurs disponibles de la plateforme
- Mise à jour automatique du statut de commande

### 3. Gestion des Statuts
- Modification du statut de toutes les commandes
- Suivi du flux de livraison complet
- Gestion des commandes annulées

## Comment Utiliser

### Accès à la Page de Gestion des Commandes

1. Connectez-vous en tant qu'administrateur
2. Accédez au dashboard admin : `/admin-dashboard`
3. Cliquez sur "Gérer Commandes" dans les actions rapides
4. Ou naviguez directement vers `/admin-dashboard/orders`

### Assigner un Livreur à une Commande

1. **Identifier les Commandes Prêtes**
   - Les commandes avec le statut "Prête" affichent un bouton "Assigner livreur"
   - Ces commandes sont prêtes pour la livraison

2. **Sélectionner un Livreur**
   - Cliquez sur "Assigner livreur"
   - Une fenêtre de dialogue s'ouvre avec la liste des livreurs disponibles
   - Les livreurs sont filtrés par commerce de la commande

3. **Confirmer l'Assignation**
   - Sélectionnez le livreur souhaité
   - Vérifiez les informations du livreur (nom, téléphone, véhicule, note)
   - Cliquez sur "Assigner le livreur"

4. **Suivi de l'Assignation**
   - Le statut de la commande passe automatiquement à "En livraison"
   - Le livreur est marqué comme occupé
   - Une notification est envoyée au livreur

### Filtrer et Rechercher les Commandes

1. **Filtre par Statut**
   - Sélectionnez un statut spécifique (En attente, Confirmée, etc.)
   - Utilisez "Tous les statuts" pour voir toutes les commandes

2. **Filtre par Commerce**
   - Sélectionnez un commerce spécifique
   - Utilisez "Tous les commerces" pour voir toutes les commandes

3. **Recherche Textuelle**
   - Recherchez par nom de client, nom de commerce, téléphone, ou ID de commande
   - La recherche est en temps réel

### Modifier le Statut d'une Commande

1. Cliquez sur le menu "..." à côté de chaque commande
2. Sélectionnez "Marquer comme [nouveau statut]"
3. Le statut est mis à jour immédiatement

## Avantages de l'Assignation Admin

### 1. Gestion Centralisée
- Vue d'ensemble de toutes les commandes de la plateforme
- Optimisation de l'assignation des livreurs
- Réduction des temps d'attente

### 2. Flexibilité Opérationnelle
- Possibilité d'assigner des livreurs indépendants
- Gestion des pics de demande
- Répartition équitable des commandes

### 3. Qualité de Service
- Assignation basée sur la proximité et la disponibilité
- Suivi en temps réel des livraisons
- Amélioration de la satisfaction client

## Cas d'Usage Typiques

### 1. Période de Forte Demande
- L'admin peut répartir les commandes entre tous les livreurs disponibles
- Optimisation des temps de livraison
- Gestion des commandes urgentes

### 2. Livreurs Indépendants
- Assignation de livreurs indépendants à tous les commerces
- Flexibilité maximale dans l'assignation
- Utilisation optimale des ressources

### 3. Support aux Commerces
- Aide aux commerces qui n'ont pas de livreurs
- Gestion des commandes orphelines
- Maintien de la qualité de service

## Sécurité et Permissions

### Politiques RLS
- Seuls les utilisateurs avec le rôle "admin" peuvent accéder à cette fonctionnalité
- Les politiques RLS garantissent l'accès sécurisé aux données
- Audit trail complet des actions d'assignation

### Validation des Actions
- Vérification de la disponibilité du livreur avant assignation
- Validation du statut de commande
- Protection contre les assignations multiples

## Configuration Requise

### Base de Données
Exécutez le script SQL pour configurer les permissions :
```sql
-- Exécuter le script admin-orders-access.sql
```

### Frontend
La page AdminOrders est automatiquement disponible après l'ajout des routes.

## Support et Maintenance

### Monitoring
- Suivi des assignations en temps réel
- Statistiques de performance des livreurs
- Alertes en cas de problème

### Maintenance
- Nettoyage automatique des assignations expirées
- Optimisation des requêtes de base de données
- Mise à jour des politiques de sécurité

## Conclusion

L'assignation de livreurs par l'administrateur offre une flexibilité maximale dans la gestion de la logistique de livraison. Cette fonctionnalité permet d'optimiser les ressources, d'améliorer la qualité de service et de gérer efficacement les périodes de forte demande.

Pour toute question ou support, contactez l'équipe technique de BraPrime. 