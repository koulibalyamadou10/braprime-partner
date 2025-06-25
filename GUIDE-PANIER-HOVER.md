# Guide d'Utilisation - Système Panier et Checkout

## 🛒 Nouveau Système de Panier

### 1. Page Panier Simplifiée (`/cart`)

#### Fonctionnalités Principales
- **Gestion des articles** : Ajout, suppression, modification des quantités
- **Affichage du restaurant** : Nom du restaurant source
- **Calcul simple** : Sous-total uniquement
- **Navigation** : Bouton pour aller au checkout
- **Interface épurée** : Focus sur la gestion des articles

#### Structure de la Page
```
┌─────────────────────────────────────────────────────────┐
│                    Header de la Page                    │
│  "Mon Panier" + Nombre d'articles + "Continuer achats"  │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │   Restaurant Info   │  │   Résumé de commande    │   │
│  │   "Commander de"    │  │                         │   │
│  │   [Nom Restaurant]  │  │ Sous-total: 25,000 GNF  │   │
│  └─────────────────────┘  │ ─────────────────────   │   │
│                           │ Total: 25,000 GNF       │   │
│  ┌─────────────────────┐  │                         │   │
│  │   Articles (2/3)    │  │ [Passer à la caisse]    │   │
│  │                     │  │                         │   │
│  │ ┌─────────────────┐ │  │                         │   │
│  │ │ Pizza Margherita│ │  │                         │   │
│  │ │ Qty: 2          │ │  │                         │   │
│  │ │ Prix: 15,000    │ │  │                         │   │
│  │ └─────────────────┘ │  │                         │   │
│  │                     │  │                         │   │
│  │ ┌─────────────────┐ │  │                         │   │
│  │ │ Salade César    │ │  │                         │   │
│  │ │ Qty: 1          │ │  │                         │   │
│  │ │ Prix: 8,000     │ │  │                         │   │
│  │ └─────────────────┘ │  │                         │   │
│  └─────────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### Fonctionnalités Détaillées

##### Gestion des Articles
- **Modification des quantités** : Boutons +/- pour ajuster
- **Suppression d'articles** : Bouton poubelle pour retirer
- **Affichage des prix** : Prix unitaire et total par article
- **Notes spéciales** : Affichage des instructions spéciales
- **Vider le panier** : Bouton pour supprimer tous les articles

##### Informations du Restaurant
- **Nom du restaurant** : Affichage du restaurant source
- **Icône store** : Indication visuelle du restaurant

##### Résumé Simple
- **Sous-total** : Somme des articles uniquement
- **Pas de calculs complexes** : Pas de livraison ni taxes
- **Bouton checkout** : Redirection vers la page de finition

### 2. Page Checkout Complète (`/checkout`)

#### Fonctionnalités Principales
- **Informations client** : Nom, téléphone, email
- **Options de livraison** : Choix entre livraison et retrait
- **Méthodes de paiement** : Espèces, carte, Mobile Money
- **Calcul complet** : Sous-total, livraison, taxes, total final
- **Validation** : Vérification des champs obligatoires
- **Confirmation** : Dialog de succès avec détails

#### Structure de la Page
```
┌─────────────────────────────────────────────────────────┐
│                    Header de la Page                    │
│  "Finaliser la commande" + "Retour au panier"          │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │  Informations       │  │   Restaurant Info       │   │
│  │  personnelles       │  │   "Commander de"        │   │
│  │  • Nom complet      │  │   [Nom Restaurant]      │   │
│  │  • Téléphone        │  └─────────────────────────┘   │
│  │  • Email            │                                │
│  └─────────────────────┘  ┌─────────────────────────┐   │
│                           │   Résumé de commande    │   │
│  ┌─────────────────────┐  │                         │   │
│  │  Options de         │  │ Articles:               │   │
│  │  livraison          │  │ • Pizza Margherita      │   │
│  │  • Livraison/Retrait│  │ • Salade César          │   │
│  │  • Adresse          │  │                         │   │
│  │  • Instructions     │  │ Sous-total: 25,000 GNF  │   │
│  └─────────────────────┘  │ Livraison: 2,000 GNF    │   │
│                           │ Taxe: 3,750 GNF         │   │
│  ┌─────────────────────┐  │ ─────────────────────   │   │
│  │  Méthode de         │  │ Total: 30,750 GNF       │   │
│  │  paiement           │  │                         │   │
│  │  • Espèces          │  │ [Confirmer la commande] │   │
│  │  • Carte            │  │                         │   │
│  │  • Mobile Money     │  │ Livraison: 30-45 min    │   │
│  └─────────────────────┘  │ Paiement sécurisé       │   │
│                           └─────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### Fonctionnalités Détaillées

##### Informations Client
- **Nom complet** : Champ obligatoire
- **Téléphone** : Champ obligatoire pour contact
- **Email** : Champ optionnel pour confirmations

##### Options de Livraison
- **Livraison à domicile** : 
  - Frais de livraison : 2,000 GNF
  - Adresse obligatoire
  - Instructions optionnelles
- **Retrait en magasin** :
  - Frais de livraison : Gratuit
  - Pas d'adresse requise

##### Méthodes de Paiement
- **Espèces à la livraison** : Paiement en espèces
- **Carte bancaire** : Paiement par carte
- **Mobile Money** : Paiement mobile

##### Calcul des Prix
- **Sous-total** : Somme des articles
- **Frais de livraison** : 2,000 GNF (livraison) ou 0 GNF (retrait)
- **Taxe** : 15% du sous-total
- **Total final** : Sous-total + Livraison + Taxe

##### Validation et Confirmation
- **Validation des champs** : Vérification des champs obligatoires
- **Traitement** : Simulation de création de commande
- **Confirmation** : Dialog avec numéro de commande et détails

### 3. Hover Cart dans le Header

#### Fonctionnalités
- **Aperçu rapide** : Affichage des 3 premiers articles
- **Gestion directe** : Modification des quantités sans quitter la page
- **Navigation rapide** : Liens vers panier complet et checkout
- **Indicateur visuel** : Badge avec nombre d'articles

#### Interface Desktop
```
┌─────────────────────────────────────────────────┐
│  🛒 Mon Panier                    [3 articles] │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ 🍕 Pizza Margherita                        │ │
│ │   15,000 GNF chacun                        │ │
│ │   [-] 2 [+]                   30,000 GNF 🗑 │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🥗 Salade César                            │ │
│ │   8,000 GNF chacun                         │ │
│ │   [-] 1 [+]                    8,000 GNF 🗑 │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ +1 autre article                                │
│ ─────────────────────────────────────────────── │
│ Sous-total: 50,000 GNF                          │
│                                                 │
│ [Voir le panier complet →]                      │
│ [Passer la commande]                            │
└─────────────────────────────────────────────────┘
```

#### Interface Mobile
- **Lien simple** : Redirection directe vers la page panier
- **Badge de notification** : Affichage du nombre d'articles
- **Pas de hover** : Interaction tactile non supportée

## 🔄 Workflow Utilisateur

### Processus Complet
1. **Ajout au panier** : Via les boutons "Ajouter au panier"
2. **Gestion du panier** : Via le hover ou la page `/cart`
3. **Passage au checkout** : Bouton "Passer à la caisse"
4. **Finalisation** : Page `/checkout` avec toutes les options
5. **Confirmation** : Dialog de succès avec numéro de commande

### Navigation
- **Panier → Checkout** : Bouton "Passer à la caisse"
- **Checkout → Panier** : Bouton "Retour au panier"
- **Checkout → Accueil** : Après confirmation
- **Checkout → Commandes** : Après confirmation

## 🎨 Design et UX

### Séparation des Responsabilités
- **Page Panier** : Focus sur la gestion des articles
- **Page Checkout** : Focus sur la finalisation de la commande
- **Hover Cart** : Aperçu rapide et gestion légère

### Avantages du Nouveau Système
- **Simplicité** : Chaque page a un objectif clair
- **Performance** : Chargement plus rapide des pages
- **UX améliorée** : Workflow plus intuitif
- **Maintenance** : Code plus modulaire

## 🔧 Intégration Technique

### Composants Utilisés
- `CartPage` : Page panier simplifiée
- `CheckoutPage` : Page de finalisation complète
- `CartHover` : Composant de hover dans le header
- `useCart` : Hook pour la gestion du panier

### Routes
- `/cart` : Page panier simplifiée
- `/checkout` : Page de finalisation
- `/categories` : Redirection pour continuer les achats
- `/dashboard/orders` : Redirection après commande

### État de l'Application
- **Panier persistant** : Stocké en base de données
- **Synchronisation** : Mise à jour en temps réel
- **Validation** : Vérification des données utilisateur

## 📱 Utilisation

### Pour les Utilisateurs

#### Gestion du Panier
1. **Ajouter** : Via les boutons "Ajouter au panier"
2. **Modifier** : Via le hover ou la page panier
3. **Supprimer** : Boutons poubelle individuels ou "Vider le panier"

#### Finalisation de Commande
1. **Aller au checkout** : Bouton "Passer à la caisse"
2. **Remplir les informations** : Données personnelles et livraison
3. **Choisir les options** : Méthode de livraison et paiement
4. **Confirmer** : Bouton "Confirmer la commande"

### Pour les Développeurs

#### Ajout de Fonctionnalités
- **Nouveaux modes de paiement** : Modifier les options dans `CheckoutPage`
- **Calculs personnalisés** : Ajuster les formules de calcul
- **Validation** : Ajouter des règles de validation

#### Personnalisation
- **Thème** : Modifier les couleurs dans `tailwind.config.ts`
- **Layout** : Ajuster la structure dans les composants
- **Comportement** : Modifier la logique dans les hooks

## 🚀 Améliorations Futures

### Fonctionnalités Prévues
- **Coupons et réductions** : Système de codes promo
- **Livraison programmée** : Choix de date/heure
- **Paiement en ligne** : Intégration de passerelles
- **Historique des commandes** : Sauvegarde des paniers

### Optimisations
- **Performance** : Lazy loading des images
- **Accessibilité** : Support des lecteurs d'écran
- **SEO** : Métadonnées optimisées
- **Analytics** : Suivi des interactions utilisateur

## 🐛 Dépannage

### Problèmes Courants
- **Panier vide** : Vérifier la connexion utilisateur
- **Erreurs de calcul** : Vérifier les données du panier
- **Problèmes de responsive** : Tester sur différents écrans

### Logs et Debug
- **Console browser** : Erreurs JavaScript
- **Network tab** : Requêtes API
- **React DevTools** : État des composants 