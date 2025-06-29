# Guide des Nouvelles Fonctionnalités Mobile - BraPrime

## Vue d'ensemble

Ce guide décrit les nouvelles fonctionnalités ajoutées au schéma mobile de BraPrime pour supporter une application mobile complète avec gestion avancée des chauffeurs, des offres de livraison, des documents, et des sessions de travail.

## 🚗 Nouvelles Fonctionnalités Ajoutées

### 1. Système d'Offres de Livraison (`delivery_offers`)

**Objectif** : Permettre aux chauffeurs de faire des offres sur les commandes disponibles.

**Fonctionnalités** :
- Les chauffeurs peuvent proposer un prix pour livrer une commande
- Système d'expiration automatique des offres
- Statuts : `pending`, `accepted`, `rejected`, `expired`
- Calcul automatique des gains basé sur les offres acceptées

**Utilisation** :
```sql
-- Chauffeur fait une offre
INSERT INTO delivery_offers (driver_id, order_id, offer_amount, expires_at)
VALUES ('driver-uuid', 'order-uuid', 1500, NOW() + INTERVAL '30 minutes');
```

### 2. Gestion des Documents des Chauffeurs (`driver_documents`)

**Objectif** : Centraliser et vérifier les documents des chauffeurs.

**Types de documents supportés** :
- Permis de conduire
- Carte grise
- Assurance
- Certificat médical
- Autres documents requis

**Fonctionnalités** :
- Upload et stockage des documents
- Statuts de vérification : `pending`, `approved`, `rejected`
- Dates d'expiration avec alertes
- Traçabilité des vérifications

### 3. Sessions de Travail (`work_sessions`)

**Objectif** : Suivre les heures de travail et les performances des chauffeurs.

**Métriques collectées** :
- Heures de début et fin de session
- Gains totaux par session
- Nombre de livraisons
- Distance parcourue
- Statuts : `active`, `completed`, `paused`

**Avantages** :
- Calcul précis des gains
- Analyse des performances
- Conformité légale (heures de travail)
- Optimisation des plannings

### 4. Historique Détaillé des Statuts (`order_status_history`)

**Objectif** : Traçabilité complète des changements de statut des commandes.

**Fonctionnalités** :
- Enregistrement automatique de chaque changement
- Horodatage précis
- Identification de qui a fait le changement
- Descriptions détaillées des actions

**Trigger automatique** :
```sql
-- Se déclenche automatiquement à chaque mise à jour de statut
CREATE TRIGGER create_order_status_history_trigger 
    AFTER UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION create_order_status_history();
```

### 5. Coordonnées GPS Avancées

**Objectif** : Suivi en temps réel et calculs de distance précis.

**Nouvelles colonnes dans `orders`** :
- `pickup_lat`, `pickup_lng` : Coordonnées du point de retrait
- `delivery_lat`, `delivery_lng` : Coordonnées de livraison
- `driver_lat`, `driver_lng` : Position actuelle du chauffeur

**Fonctions GPS** :
- `calculate_distance()` : Calcul de distance entre deux points
- `get_order_distance()` : Distance totale d'une commande
- Index géospatiaux pour performances optimales

### 6. Statistiques Avancées des Chauffeurs

**Nouvelles colonnes dans `drivers`** :
- `total_earnings` : Gains totaux (en centimes)
- `is_verified` : Statut de vérification par l'admin
- `avatar_url` : Photo de profil du chauffeur

**Mise à jour automatique** :
- Calcul des gains basé sur les commandes livrées
- Mise à jour du nombre de livraisons
- Calcul de la note moyenne

## 📊 Vues Utiles Créées

### 1. `available_delivery_offers`
Vue des offres de livraison actives et non expirées.

### 2. `driver_documents_with_details`
Vue des documents avec informations du chauffeur et statuts.

### 3. `work_sessions_with_details`
Vue des sessions avec calculs de durée et gains horaires.

### 4. `order_status_history_with_details`
Vue de l'historique avec informations contextuelles.

### 5. `orders_with_gps`
Vue des commandes avec calculs de distance automatiques.

## 🔧 Scripts de Migration

### Script Principal : `scripts/add-driver-stats-columns.sql`

Ce script ajoute les nouvelles colonnes à la base existante :

```sql
-- Ajout des colonnes statistiques
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Mise à jour des données existantes
UPDATE drivers SET total_earnings = COALESCE(
    (SELECT SUM(delivery_fee) FROM orders 
     WHERE driver_id = drivers.id AND status = 'delivered'), 0.0
);
```

## 🎯 Avantages pour l'Application Mobile

### Pour les Chauffeurs :
- Interface intuitive pour faire des offres
- Suivi en temps réel des gains
- Gestion des documents simplifiée
- Sessions de travail claires

### Pour les Restaurants :
- Meilleur contrôle sur les livraisons
- Traçabilité complète des commandes
- Optimisation des coûts de livraison

### Pour l'Administration :
- Données complètes pour l'analyse
- Conformité réglementaire
- Gestion des risques améliorée

## 🚀 Prochaines Étapes

1. **Déployer le script de migration** sur la base de données
2. **Mettre à jour l'API** pour supporter les nouvelles fonctionnalités
3. **Développer l'interface mobile** pour les chauffeurs
4. **Implémenter les notifications** en temps réel
5. **Ajouter les calculs GPS** dans l'application

## 📱 Intégration Mobile

Les nouvelles fonctionnalités sont conçues pour une intégration mobile optimale :

- **Offres de livraison** : Interface push/pull pour les chauffeurs
- **Documents** : Upload direct depuis l'appareil photo
- **GPS** : Intégration native avec les services de localisation
- **Sessions** : Détection automatique du début/fin de travail
- **Notifications** : Alertes en temps réel pour les changements de statut

---

*Ce schéma mobile étendu transforme BraPrime en une plateforme complète de livraison avec gestion avancée des chauffeurs, comparable aux meilleures applications du marché.* 