# 📋 Gestion des Abonnements BraPrime

## 🎯 Vue d'ensemble

Le système de gestion des abonnements BraPrime permet aux partenaires commerciaux de souscrire à différents plans d'abonnement selon leurs besoins et leur budget.

## 🗄️ Structure de la Base de Données

### Tables Principales

#### 1. `subscription_plans`
Plans d'abonnement disponibles avec leurs caractéristiques.

```sql
CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY,
  plan_type subscription_plan_type NOT NULL, -- '1_month', '3_months', '6_months', '12_months'
  name character varying NOT NULL,
  description text,
  duration_months integer NOT NULL,
  price numeric NOT NULL, -- Prix total du plan
  monthly_price numeric NOT NULL, -- Prix mensuel équivalent
  savings_percentage numeric, -- Pourcentage d'économie
  features jsonb, -- Fonctionnalités incluses
  is_active boolean DEFAULT true
);
```

#### 2. `partner_subscriptions`
Abonnements actifs des partenaires.

```sql
CREATE TABLE partner_subscriptions (
  id uuid PRIMARY KEY,
  partner_id uuid REFERENCES partners(id),
  plan_id uuid REFERENCES subscription_plans(id),
  status subscription_status NOT NULL, -- 'active', 'expired', 'cancelled', 'pending', 'suspended'
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  auto_renew boolean DEFAULT false,
  total_paid numeric NOT NULL,
  monthly_amount numeric NOT NULL,
  savings_amount numeric DEFAULT 0,
  billing_email character varying,
  billing_phone character varying,
  billing_address text,
  tax_id character varying
);
```

#### 3. `subscription_payments`
Historique des paiements d'abonnement.

```sql
CREATE TABLE subscription_payments (
  id uuid PRIMARY KEY,
  subscription_id uuid REFERENCES partner_subscriptions(id),
  amount numeric NOT NULL,
  payment_method payment_method NOT NULL, -- 'card', 'bank_transfer', 'mobile_money', 'cash'
  status payment_status NOT NULL, -- 'pending', 'completed', 'failed', 'refunded', 'cancelled'
  transaction_reference character varying,
  payment_date timestamp with time zone,
  processed_date timestamp with time zone,
  failure_reason text,
  receipt_url character varying
);
```

#### 4. `subscription_invoices`
Factures générées pour les abonnements.

```sql
CREATE TABLE subscription_invoices (
  id uuid PRIMARY KEY,
  subscription_id uuid REFERENCES partner_subscriptions(id),
  payment_id uuid REFERENCES subscription_payments(id),
  invoice_number character varying UNIQUE,
  amount numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  status payment_status NOT NULL,
  due_date timestamp with time zone NOT NULL,
  paid_date timestamp with time zone,
  invoice_url character varying
);
```

#### 5. `subscription_changes`
Historique des changements de plan.

```sql
CREATE TABLE subscription_changes (
  id uuid PRIMARY KEY,
  subscription_id uuid REFERENCES partner_subscriptions(id),
  old_plan_id uuid REFERENCES subscription_plans(id),
  new_plan_id uuid REFERENCES subscription_plans(id),
  change_reason text,
  effective_date timestamp with time zone NOT NULL,
  price_difference numeric
);
```

#### 6. `subscription_notifications`
Notifications liées aux abonnements.

```sql
CREATE TABLE subscription_notifications (
  id uuid PRIMARY KEY,
  subscription_id uuid REFERENCES partner_subscriptions(id),
  type character varying NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  sent_at timestamp with time zone DEFAULT now()
);
```

## 💰 Plans d'Abonnement

### Plans Disponibles

| Plan | Durée | Prix Total | Prix Mensuel | Économie |
|------|-------|------------|--------------|----------|
| 1 Mois | 1 mois | 200,000 GNF | 200,000 GNF | 0% |
| 3 Mois | 3 mois | 450,000 GNF | 150,000 GNF | 25% |
| 6 Mois | 6 mois | 800,000 GNF | 133,333 GNF | 33% |
| 12 Mois | 12 mois | 1,400,000 GNF | 116,667 GNF | 41,7% |

### Fonctionnalités Incluses

Tous les plans incluent :
- ✅ Visibilité continue sur l'application BraPrime
- ✅ Accès à des centaines d'utilisateurs actifs
- ✅ Service de livraison écoresponsable
- ✅ Plateforme moderne 100% guinéenne
- ✅ Support client
- ✅ Gestion de base du menu
- ✅ Commandes en ligne
- ✅ Notifications par SMS

## 🔧 Fonctions PostgreSQL

### 1. `create_partner_subscription()`
Crée un nouvel abonnement pour un partenaire.

```sql
SELECT create_partner_subscription(
  p_partner_id uuid,
  p_plan_id uuid,
  p_billing_email character varying DEFAULT NULL,
  p_billing_phone character varying DEFAULT NULL,
  p_billing_address text DEFAULT NULL,
  p_tax_id character varying DEFAULT NULL
);
```

### 2. `activate_subscription()`
Active un abonnement après paiement.

```sql
SELECT activate_subscription(p_subscription_id uuid);
```

### 3. `check_expired_subscriptions()`
Vérifie et marque les abonnements expirés.

```sql
SELECT check_expired_subscriptions();
```

## 📊 Vues Utiles

### 1. `active_subscriptions`
Liste des abonnements actifs avec les informations des partenaires.

```sql
SELECT * FROM active_subscriptions;
```

### 2. `subscription_payments_summary`
Résumé des paiements par abonnement.

```sql
SELECT * FROM subscription_payments_summary;
```

## 🔄 Workflow d'Abonnement

### 1. Création d'Abonnement
```sql
-- Créer un nouvel abonnement
SELECT create_partner_subscription(
  'partner-uuid',
  'plan-uuid',
  'facturation@entreprise.gn',
  '+224 123 456 789',
  'Adresse de facturation',
  '123456789'
);
```

### 2. Paiement
```sql
-- Enregistrer un paiement
INSERT INTO subscription_payments (
  subscription_id,
  amount,
  payment_method,
  status,
  transaction_reference
) VALUES (
  'subscription-uuid',
  450000,
  'bank_transfer',
  'completed',
  'TXN-2024-001'
);
```

### 3. Activation
```sql
-- Activer l'abonnement après paiement
SELECT activate_subscription('subscription-uuid');
```

## 🔔 Notifications Automatiques

Le système génère automatiquement des notifications pour :
- ✅ Activation d'abonnement
- ⚠️ Expiration d'abonnement (7 jours avant)
- ❌ Abonnement expiré
- 🔄 Renouvellement automatique

## 📈 Statistiques

### Requêtes Utiles

```sql
-- Nombre d'abonnements actifs par plan
SELECT 
  sp.name,
  sp.plan_type,
  COUNT(ps.id) as active_subscriptions
FROM subscription_plans sp
LEFT JOIN partner_subscriptions ps ON sp.id = ps.plan_id AND ps.status = 'active'
GROUP BY sp.id, sp.name, sp.plan_type;

-- Revenus mensuels
SELECT 
  DATE_TRUNC('month', ps.start_date) as month,
  SUM(ps.total_paid) as total_revenue,
  COUNT(ps.id) as new_subscriptions
FROM partner_subscriptions ps
WHERE ps.status = 'active'
GROUP BY DATE_TRUNC('month', ps.start_date)
ORDER BY month DESC;

-- Taux de rétention
SELECT 
  sp.plan_type,
  COUNT(CASE WHEN ps.status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN ps.status = 'expired' THEN 1 END) as expired,
  ROUND(
    COUNT(CASE WHEN ps.status = 'active' THEN 1 END) * 100.0 / 
    COUNT(ps.id), 2
  ) as retention_rate
FROM subscription_plans sp
LEFT JOIN partner_subscriptions ps ON sp.id = ps.plan_id
GROUP BY sp.plan_type;
```

## 🛡️ Sécurité et Contraintes

### Contraintes de Base
- Un partenaire ne peut avoir qu'un seul abonnement actif à la fois
- Les dates de fin sont calculées automatiquement
- Les montants d'économie sont calculés automatiquement

### Index de Performance
```sql
CREATE INDEX idx_partner_subscriptions_partner_id ON partner_subscriptions(partner_id);
CREATE INDEX idx_partner_subscriptions_status ON partner_subscriptions(status);
CREATE INDEX idx_partner_subscriptions_end_date ON partner_subscriptions(end_date);
```

## 🔄 Maintenance

### Tâches Automatiques
1. **Vérification quotidienne des abonnements expirés**
2. **Génération des factures mensuelles**
3. **Envoi des notifications de renouvellement**
4. **Nettoyage des données anciennes**

### Script de Maintenance
```sql
-- À exécuter quotidiennement
SELECT check_expired_subscriptions();

-- Nettoyage des notifications anciennes (plus de 90 jours)
DELETE FROM subscription_notifications 
WHERE created_at < NOW() - INTERVAL '90 days' AND is_read = true;
```

## 📝 Migration

Pour déployer le système d'abonnement :

1. **Exécuter le script de migration** :
   ```bash
   psql -d your_database -f scripts/create-subscription-tables.sql
   ```

2. **Vérifier les données** :
   ```sql
   SELECT * FROM subscription_plans;
   SELECT * FROM active_subscriptions;
   ```

3. **Tester les fonctions** :
   ```sql
   -- Créer un abonnement de test
   SELECT create_partner_subscription(
     (SELECT id FROM partners LIMIT 1),
     (SELECT id FROM subscription_plans WHERE plan_type = '3_months')
   );
   ```

---

*Ce système de gestion des abonnements est conçu pour être scalable, sécurisé et facile à maintenir.* 