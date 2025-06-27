# Guide de la Page de Détails du Livreur - BraPrime

## Vue d'ensemble

La page de détails du livreur offre une vue complète et détaillée des informations, performances et historique d'un livreur spécifique. Cette page permet aux partenaires d'avoir une vision approfondie de chaque membre de leur équipe de livraison.

## Accès à la page

### Depuis la liste des livreurs
1. Allez dans **Dashboard Partenaire > Livreurs**
2. Dans la liste des livreurs, cliquez sur l'icône **👁️ (Œil)** dans la colonne "Actions"
3. Vous serez redirigé vers la page de détails du livreur

### URL directe
```
/partner-dashboard/drivers/{driverId}
```

## Structure de la page

### 1. En-tête avec navigation
- **Bouton "Retour aux livreurs"** : Retourne à la liste des livreurs
- **Nom du livreur** : Titre principal de la page
- **Description** : "Détails et performances du livreur"

### 2. Cartes d'informations principales

#### Carte "Informations"
- **Avatar** : Initiales du livreur
- **Nom complet** et ID du livreur
- **Coordonnées** : Téléphone et email
- **Véhicule** : Type et plaque d'immatriculation
- **Statut** : Actif/Inactif et En livraison

#### Carte "Statistiques"
- **Commandes totales** : Nombre total de commandes assignées
- **Commandes livrées** : Nombre de livraisons réussies
- **Note moyenne** : Note globale avec nombre d'avis
- **Revenus générés** : Montant total des commandes livrées
- **Temps moyen** : Durée moyenne de livraison

#### Carte "Commande actuelle"
- **Informations de la commande en cours** (si applicable)
- **Statut de la livraison**
- **Détails du client**
- **Montant de la commande**

### 3. Onglets détaillés

#### Onglet "Commandes" 
Affiche l'historique complet des commandes du livreur :

**Colonnes :**
- **Commande** : ID de la commande
- **Client** : Nom et téléphone du client
- **Adresse** : Adresse de livraison
- **Montant** : Montant total de la commande
- **Statut** : Statut actuel de la commande
- **Date** : Date de création
- **Note** : Note donnée par le client (si applicable)

**Fonctionnalités :**
- Tri par date (plus récent en premier)
- Affichage des 50 dernières commandes
- Badges colorés pour les statuts

#### Onglet "Avis"
Affiche tous les avis reçus par le livreur :

**Informations affichées :**
- **Nom du client** qui a laissé l'avis
- **Numéro de commande** associé
- **Note** (1-5 étoiles)
- **Commentaire** (si fourni)
- **Date** de l'avis

**Présentation :**
- Cartes individuelles pour chaque avis
- Note mise en évidence avec icône d'étoile
- Commentaires formatés pour une lecture facile

#### Onglet "Statistiques détaillées"
Affiche des métriques avancées sur les performances :

**Métriques affichées :**
- **Commandes totales** : Nombre total de commandes
- **Livrées** : Commandes livrées avec succès
- **À l'heure** : Livraisons respectant les délais
- **En retard** : Livraisons en retard
- **Revenus générés** : Chiffre d'affaires total
- **Note moyenne** : Note globale sur 5
- **Avis reçus** : Nombre total d'avis
- **Temps moyen** : Durée moyenne de livraison

## Fonctionnalités avancées

### Calculs automatiques
- **Note moyenne** : Calculée à partir de tous les avis reçus
- **Temps de livraison** : Basé sur la différence entre création et livraison
- **Livraisons à l'heure** : Considérées comme à l'heure si < 45 minutes
- **Revenus générés** : Somme de tous les montants des commandes livrées

### Filtrage et tri
- **Commandes** : Triées par date (plus récent en premier)
- **Avis** : Triés par date (plus récent en premier)
- **Statistiques** : Calculées en temps réel

### Responsive design
- **Mobile** : Adaptation automatique pour les petits écrans
- **Tablette** : Layout optimisé pour les écrans moyens
- **Desktop** : Affichage complet avec toutes les informations

## Utilisation pratique

### Évaluation des performances
1. **Consultez les statistiques** pour évaluer l'efficacité du livreur
2. **Analysez les avis** pour comprendre la satisfaction client
3. **Vérifiez les temps de livraison** pour identifier les améliorations possibles

### Gestion de l'équipe
1. **Comparez les performances** entre différents livreurs
2. **Identifiez les meilleurs livreurs** pour les commandes importantes
3. **Planifiez la formation** basée sur les points d'amélioration

### Suivi en temps réel
1. **Vérifiez la commande actuelle** pour le suivi en direct
2. **Surveillez les performances** pour les ajustements nécessaires
3. **Analysez les tendances** pour l'optimisation

## Données affichées

### Informations personnelles
- Nom complet
- Numéro de téléphone
- Adresse email (si fournie)
- Type de véhicule
- Plaque d'immatriculation
- Statut d'activité

### Métriques de performance
- Nombre total de commandes
- Taux de livraison réussie
- Temps moyen de livraison
- Note moyenne des clients
- Revenus générés
- Punctualité (à l'heure vs en retard)

### Historique détaillé
- Toutes les commandes assignées
- Statuts de chaque commande
- Avis et commentaires clients
- Dates et heures précises

## Sécurité et permissions

### Accès restreint
- **Authentification requise** : Seuls les utilisateurs connectés peuvent accéder
- **Rôle partenaire** : Réservé aux partenaires uniquement
- **Isolation des données** : Chaque partenaire ne voit que ses propres livreurs

### Protection des données
- **Informations client** : Affichées de manière sécurisée
- **Données personnelles** : Protégées par les politiques RLS
- **Historique** : Limité aux données pertinentes

## Dépannage

### Problème : Page ne se charge pas
**Solutions :**
1. Vérifiez votre connexion internet
2. Rechargez la page
3. Vérifiez que vous êtes connecté en tant que partenaire
4. Contactez le support si le problème persiste

### Problème : Données manquantes
**Solutions :**
1. Vérifiez que le livreur a des commandes assignées
2. Attendez quelques minutes pour le chargement complet
3. Utilisez le bouton "Réessayer" si disponible

### Problème : Statistiques incorrectes
**Solutions :**
1. Vérifiez que les commandes sont bien marquées comme "Livrées"
2. Assurez-vous que les avis sont correctement enregistrés
3. Contactez le support pour vérifier les calculs

## Avantages pour les partenaires

### Gestion optimisée
- **Vue d'ensemble complète** de chaque livreur
- **Données de performance** pour les décisions
- **Historique détaillé** pour l'analyse

### Amélioration continue
- **Identification des points forts** et faibles
- **Formation ciblée** basée sur les données
- **Optimisation des affectations** de commandes

### Satisfaction client
- **Suivi de la qualité** de service
- **Amélioration de la ponctualité**
- **Gestion proactive** des problèmes

---

**Note :** Cette page de détails offre une vision complète et professionnelle de chaque livreur, permettant aux partenaires de prendre des décisions éclairées pour optimiser leur service de livraison. 