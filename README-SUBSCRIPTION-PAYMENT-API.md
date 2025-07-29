# 💳 **API de Paiement d'Abonnements - Backend BraPrime**

## 🎯 Vue d'Ensemble

L'API de paiement d'abonnements BraPrime intègre la passerelle de paiement **Lengo Pay API v1** pour créer des URLs de paiement sécurisées pour les abonnements partenaires via mobile money, cartes bancaires et autres méthodes de paiement populaires en Guinée.

### **🏗️ Architecture**

Ce backend Next.js expose des routes API REST pour :
- ✅ **Création de paiements d'abonnement** via Lengo Pay
- ✅ **Vérification des statuts** de paiement
- ✅ **Activation automatique** des abonnements après paiement
- ✅ **Gestion des callbacks** et notifications

---

## 🔗 **Endpoints API**

### **1. Créer un Paiement d'Abonnement**
- **URL** : `POST /api/subscription-payments/lengo-pay`
- **Description** : Crée une URL de paiement unique pour un abonnement partenaire

### **2. Vérifier le Statut du Paiement**
- **URL** : `GET /api/subscription-payments/status`
- **Description** : Récupère le statut d'un paiement d'abonnement

### **3. Activer l'Abonnement**
- **URL** : `POST /api/subscription-payments/activate`
- **Description** : Active automatiquement l'abonnement après paiement réussi

---

## 📋 **1. Créer un Paiement d'Abonnement**

### **Endpoint**
```
POST /api/subscription-payments/lengo-pay
```

### **Headers**
```http
Content-Type: application/json
```

### **Payload JSON**
```json
{
  "subscription_id": "uuid-de-l-abonnement",
  "partner_id": 123,
  "plan_id": "uuid-du-plan",
  "amount": 50000,
  "currency": "GNF",
  "payment_method": "lp-om-gn",
  "phone_number": "+224 123 456 789",
  "subscription_number": "SUB-2024-001",
  "business_name": "BraPrime Partenariat",
  "partner_name": "Restaurant Le Gourmet",
  "partner_email": "contact@legourmet.gn",
  "plan_name": "Plan Premium",
  "duration_months": 12
}
```

### **Paramètres Requis**

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `subscription_id` | string | ID unique de l'abonnement | `"uuid-de-l-abonnement"` |
| `partner_id` | number | ID du partenaire | `123` |
| `plan_id` | string | ID du plan d'abonnement | `"uuid-du-plan"` |
| `amount` | number | Montant en centimes | `50000` (50,000 GNF) |
| `currency` | string | Devise | `"GNF"` |
| `payment_method` | string | Méthode de paiement | `"lp-om-gn"` (Orange Money) |
| `phone_number` | string | Numéro de téléphone | `"+224 123 456 789"` |
| `subscription_number` | string | Numéro de référence | `"SUB-2024-001"` |
| `business_name` | string | Nom de l'entreprise | `"BraPrime Partenariat"` |
| `partner_name` | string | Nom du partenaire | `"Restaurant Le Gourmet"` |
| `partner_email` | string | Email du partenaire | `"contact@legourmet.gn"` |
| `plan_name` | string | Nom du plan | `"Plan Premium"` |
| `duration_months` | number | Durée en mois | `12` |

### **Méthodes de Paiement Supportées**

| Code | Description | Méthode |
|------|-------------|---------|
| `lp-om-gn` | Orange Money Guinée | Mobile Money |
| `lp-mtn-gn` | MTN Mobile Money Guinée | Mobile Money |
| `lp-card-gn` | Cartes bancaires Guinée | Carte |
| `lp-bank-gn` | Virement bancaire Guinée | Virement |

### **Réponse Succès**
```json
{
  "success": true,
  "pay_id": "WTVWaTBOUXVlNTB1NXNzbUhldGF0eENSV3VkeTJuV3E=",
  "payment_url": "https://payment.lengopay.com/WTVWaTBOUXVlNTB1NXNzbUhldGF0eENSV3VkeTJuV3E=",
  "message": "URL de paiement créée avec succès",
  "data": {
    "subscription_id": "uuid-de-l-abonnement",
    "amount": 50000,
    "currency": "GNF",
    "status": "pending",
    "payment_url": "https://payment.lengopay.com/WTVWaTBOUXVlNTB1NXNzbUhldGF0eENSV3VkeTJuV3E="
  }
}
```

### **Réponse Erreur**
```json
{
  "success": false,
  "error": "Données manquantes",
  "required": ["subscription_id", "partner_id", "amount", "phone_number"]
}
```

### **cURL Example**
```bash
curl -X POST http://localhost:3000/api/subscription-payments/lengo-pay \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_id": "uuid-de-l-abonnement",
    "partner_id": 123,
    "plan_id": "uuid-du-plan",
    "amount": 50000,
    "currency": "GNF",
    "payment_method": "lp-om-gn",
    "phone_number": "+224 123 456 789",
    "subscription_number": "SUB-2024-001",
    "business_name": "BraPrime Partenariat",
    "partner_name": "Restaurant Le Gourmet",
    "partner_email": "contact@legourmet.gn",
    "plan_name": "Plan Premium",
    "duration_months": 12
  }'
```

---

## 📋 **2. Vérifier le Statut du Paiement**

### **Endpoint**
```
GET /api/subscription-payments/status
```

### **Paramètres de Requête**

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `pay_id` | string | ID spécifique du paiement | `WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8=` |
| `subscription_id` | string | ID de l'abonnement | `uuid-de-l-abonnement` |
| `partner_id` | number | ID du partenaire | `123` |
| `status` | string | Statut à filtrer | `pending`, `success`, `failed` |
| `limit` | number | Nombre de résultats | `10` |
| `offset` | number | Décalage pour pagination | `0` |

### **Réponse Succès**
```json
{
  "success": true,
  "data": {
    "subscription_id": "uuid-de-l-abonnement",
    "pay_id": "WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8=",
    "amount": 50000,
    "currency": "GNF",
    "status": "success",
    "payment_method": "lp-om-gn",
    "gateway_response": {
      "transaction_id": "TXN123456",
      "payment_method": "Orange Money",
      "phone_number": "+224 123 456 789"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:35:00Z"
  }
}
```

### **Statuts Possibles**

| Statut | Description | Action |
|--------|-------------|--------|
| `pending` | Paiement en attente | Continuer le polling |
| `success` | Paiement réussi | Activer l'abonnement |
| `failed` | Paiement échoué | Notifier l'échec |
| `initiated` | Paiement initié | Attendre la confirmation |

### **cURL Example**
```bash
curl -X GET "http://localhost:3000/api/subscription-payments/status?pay_id=WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8=" \
  -H "Content-Type: application/json"
```

---

## 📋 **3. Activer l'Abonnement**

### **Endpoint**
```
POST /api/subscription-payments/activate
```

### **Headers**
```http
Content-Type: application/json
```

### **Payload JSON**
```json
{
  "subscription_id": "uuid-de-l-abonnement",
  "pay_id": "WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8=",
  "payment_status": "success",
  "gateway_response": {
    "transaction_id": "TXN123456",
    "payment_method": "Orange Money",
    "phone_number": "+224 123 456 789",
    "amount": 50000,
    "currency": "GNF"
  }
}
```

### **Réponse Succès**
```json
{
  "success": true,
  "message": "Abonnement activé avec succès",
  "data": {
    "business_id": 123,
    "subscription_id": "uuid-de-l-abonnement",
    "activated_at": "2024-01-15T10:35:00Z"
  }
}
```

### **Réponse Erreur**
```json
{
  "success": false,
  "error": "Erreur lors de l'activation de l'abonnement"
}
```

### **cURL Example**
```bash
curl -X POST http://localhost:3000/api/subscription-payments/activate \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_id": "uuid-de-l-abonnement",
    "pay_id": "WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8=",
    "payment_status": "success",
    "gateway_response": {
      "transaction_id": "TXN123456",
      "payment_method": "Orange Money",
      "phone_number": "+224 123 456 789"
    }
  }'
```

---

## 🔄 **Flux d'Utilisation Complet**

### **1. Création du Paiement**
```
Frontend → POST /api/subscription-payments/lengo-pay → URL de paiement
```

### **2. Redirection vers Lengo Pay**
```
Frontend → Redirige vers payment_url → Page de paiement Lengo Pay
```

### **3. Retour avec vérification**
```
Lengo Pay → Redirige vers return_url → Page de statut frontend
Frontend → GET /api/subscription-payments/status → Affiche le statut
```

### **4. Activation automatique**
```
Frontend → POST /api/subscription-payments/activate → Business activé
```

### **🎯 Flux Complet avec return_url**

```
1. Partenaire choisit un plan → Page de paiement Lengo Pay
2. Partenaire effectue le paiement → Lengo Pay traite
3. Lengo Pay redirige automatiquement → Votre page /subscription-payment-status
4. Votre page vérifie le statut → Affiche "Abonnement activé !"
5. Business devient actif automatiquement → Dashboard accessible
```

---

## ⚙️ **Configuration Requise**

### **Variables d'Environnement**

```env
# Lengo Pay Configuration
LENGO_PAY_WEBSITE_ID=your_website_id
LENGO_PAY_LICENSE_KEY=your_license_key

# URLs Configuration
FRONTEND_URL=http://localhost:8080
API_URL=https://your-api-url.com

# Database Configuration
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration (optionnel)
RESEND_API_KEY=your_resend_api_key
```

### **Structure des Fichiers**

```
app/
├── api/
│   └── subscription-payments/
│       ├── lengo-pay/
│       │   └── route.ts
│       ├── status/
│       │   └── route.ts
│       └── activate/
│           └── route.ts
├── lib/
│   ├── supabase.ts
│   └── lengo-pay.ts
└── types/
    └── subscription-payment.ts
```

---

## 🗄️ **Base de Données**

### **Table `subscription_payments`**

```sql
CREATE TABLE subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES partner_subscriptions(id),
  amount numeric NOT NULL,
  payment_method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  transaction_reference character varying,
  payment_date timestamp with time zone,
  processed_date timestamp with time zone,
  failure_reason text,
  receipt_url character varying,
  gateway_response jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### **Fonctions PostgreSQL Requises**

```sql
-- Fonction pour activer le business après paiement
CREATE OR REPLACE FUNCTION activate_business_after_subscription(
  p_subscription_id uuid
) RETURNS json AS $$
-- ... (voir le script SQL fourni)
$$ LANGUAGE plpgsql;
```

---

## 🧪 **Tests**

### **Test 1 : Création de Paiement**

```bash
# Test de création de paiement
curl -X POST http://localhost:3000/api/subscription-payments/lengo-pay \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_id": "test-subscription-id",
    "partner_id": 123,
    "plan_id": "test-plan-id",
    "amount": 50000,
    "currency": "GNF",
    "payment_method": "lp-om-gn",
    "phone_number": "+224 123 456 789",
    "subscription_number": "SUB-TEST-001",
    "business_name": "Test Business",
    "partner_name": "Test Partner",
    "partner_email": "test@example.com",
    "plan_name": "Test Plan",
    "duration_months": 12
  }'
```

### **Test 2 : Vérification de Statut**

```bash
# Test de vérification de statut
curl -X GET "http://localhost:3000/api/subscription-payments/status?pay_id=test-pay-id" \
  -H "Content-Type: application/json"
```

### **Test 3 : Activation d'Abonnement**

```bash
# Test d'activation
curl -X POST http://localhost:3000/api/subscription-payments/activate \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_id": "test-subscription-id",
    "pay_id": "test-pay-id",
    "payment_status": "success"
  }'
```

---

## 🚨 **Gestion des Erreurs**

### **Codes d'Erreur**

| Code | Description | Solution |
|------|-------------|----------|
| `400` | Données manquantes | Vérifier tous les champs requis |
| `401` | Clé API invalide | Vérifier `LENGO_PAY_LICENSE_KEY` |
| `402` | Paiement échoué | Vérifier les informations de paiement |
| `500` | Erreur interne | Vérifier les logs du serveur |

### **Logs de Débogage**

```typescript
// Dans chaque route
console.log('Subscription Payment API:', {
  endpoint: '/api/subscription-payments/lengo-pay',
  requestData: body,
  response: data
});
```

---

## 📊 **Monitoring et Analytics**

### **Métriques à Surveiller**

- **Taux de conversion** : Paiements réussis / Total tentatives
- **Temps de traitement** : Durée moyenne des paiements
- **Erreurs par méthode** : Répartition des échecs par méthode de paiement
- **Revenus par plan** : Montants collectés par type d'abonnement

### **Webhooks et Notifications**

```typescript
// Callback URL pour Lengo Pay
POST /api/subscription-payments/callback
{
  "pay_id": "WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8=",
  "status": "success",
  "transaction_id": "TXN123456",
  "amount": 50000,
  "currency": "GNF"
}
```

---

## 🔒 **Sécurité**

### **Validation des Données**

- ✅ Validation des types de données
- ✅ Vérification des montants (min/max)
- ✅ Validation des devises supportées
- ✅ Vérification des méthodes de paiement

### **Authentification**

- ✅ Clé API Lengo Pay sécurisée
- ✅ Validation des tokens d'accès
- ✅ Rate limiting sur les endpoints

### **Chiffrement**

- ✅ HTTPS obligatoire
- ✅ Données sensibles chiffrées
- ✅ Logs sécurisés

---

## 📞 **Support**

### **Contact Technique**

- **Email** : tech@bradelivery.com
- **Téléphone** : +224 621 00 00 00
- **Documentation** : https://docs.bradelivery.com

### **Ressources**

- **Documentation Lengo Pay** : https://docs.lengopay.com
- **API Reference** : https://api.bradelivery.com/docs
- **Status Page** : https://status.bradelivery.com

---

**Note** : Cette API garantit un processus de paiement sécurisé et fiable pour les abonnements partenaires BraPrime, assurant ainsi la viabilité économique de la plateforme. 