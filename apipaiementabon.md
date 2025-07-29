# 💳 Documentation API Paiement Abonnements - BraPrime

## 🎯 Vue d'Ensemble

Cette documentation décrit les routes API pour le paiement des abonnements via Lengo Pay. Ces routes sont spécifiques aux abonnements et utilisent les tables `partner_subscriptions` et `subscription_payments`.

---

## 🔧 Configuration

### Variables d'Environnement Requises

```env
LENGO_PAY_LICENSE_KEY=votre_cle_licence_lengo_pay
LENGO_PAY_WEBSITE_ID=votre_website_id_lengo_pay
RESEND_API_KEY=votre_cle_api_resend
```

### Base URL

```
https://braprime-backend.vercel.app/api
```

---

## 📋 Routes API

### 1. Paiement d'Abonnement

**Endpoint :** `POST /api/subscriptions/pay`

**Description :** Créer une URL de paiement pour un abonnement via Lengo Pay.

#### Exemple Postman

**Request :**
```
Method: POST
URL: https://braprime-backend.vercel.app/api/subscriptions/pay
Headers:
  Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "subscription_id": "sub_123456",
  "amount": 50000,
  "payment_method": "lengo_pay"
}
```

**Response (200) :**
```json
{
  "success": true,
  "pay_id": "SnFoZXVPZU9nYTlYcmFGOEd6ZUVrUGVJQzlCeUR3S3Y=",
  "payment_url": "https://payment.lengopay.com/SnFoZXVPZU9nYTlYcmFGOEd6ZUVrUGVJQzlCeUR3S3Y=",
  "message": "URL de paiement d'abonnement créée avec succès",
  "data": {
    "subscription_id": "sub_123456",
    "amount": 50000,
    "currency": "GNF",
    "status": "pending",
    "payment_url": "https://payment.lengopay.com/SnFoZXVPZU9nYTlYcmFGOEd6ZUVrUGVJQzlCeUR3S3Y=",
    "pay_id": "SnFoZXVPZU9nYTlYcmFGOEd6ZUVrUGVJQzlCeUR3S3Y=",
    "business_name": "Restaurant Le Gourmet"
  }
}
```

#### Test avec cURL

```bash
curl -X POST https://braprime-backend.vercel.app/api/subscriptions/pay \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_id": "sub_123456",
    "amount": 50000,
    "payment_method": "lengo_pay"
  }'
```

---

### 2. Callback de Paiement d'Abonnement

**Endpoint :** `POST /api/subscriptions/callback`

**Description :** Cette route gère les notifications de paiement d'abonnements de Lengo Pay.

#### Payload Attendu de Lengo Pay

```json
{
  "pay_id": "SnFoZXVPZU9nYTlYcmFGOEd6ZUVrUGVJQzlCeUR3S3Y=",
  "status": "SUCCESS",
  "amount": 50000,
  "message": "Transaction Successful",
  "client": "+224 621 123 456"
}
```

#### Actions Automatiques

1. **Mise à jour du statut d'abonnement** dans `partner_subscriptions`
2. **Mise à jour du paiement** dans `subscription_payments`
3. **Envoi d'email** de confirmation/échec au partenaire
4. **Activation automatique du business** via le trigger

#### Response (200) :
```json
{
  "success": true,
  "message": "Callback abonnement traité avec succès",
  "data": {
    "pay_id": "SnFoZXVPZU9nYTlYcmFGOEd6ZUVrUGVJQzlCeUR3S3Y=",
    "status": "SUCCESS",
    "subscription_id": "sub_123456",
    "database_updated": true,
    "email_sent": true
  }
}
```

---

## 🔄 Workflow Complet

### **Étape 1: Création du Paiement**
```
Frontend → POST /api/subscriptions/pay → Lengo Pay → URL de paiement
```

### **Étape 2: Paiement Client**
```
Client → URL de paiement → Lengo Pay → Paiement effectué
```

### **Étape 3: Callback**
```
Lengo Pay → POST /api/subscriptions/callback → Mise à jour BDD → Email → Business activé
```

---

## 📊 Tables Utilisées

### **partner_subscriptions**
- `id` : ID de l'abonnement
- `partner_id` : ID du business
- `status` : pending → active/failed
- `monthly_amount` : Montant mensuel
- `billing_email` : Email de facturation
- `total_paid` : Montant total payé

### **subscription_payments**
- `subscription_id` : ID de l'abonnement
- `amount` : Montant du paiement
- `payment_method` : 'lengo_pay'
- `status` : pending → success/failed
- `transaction_reference` : pay_id de Lengo Pay

### **businesses**
- `id` : ID du business
- `name` : Nom du business
- `is_active` : false → true (après activation)
- `subscription_status` : pending → active

---

## 🔍 Validation et Sécurité

### **Validation des Données**
- ✅ Vérification de l'existence de l'abonnement
- ✅ Validation du montant
- ✅ Vérification du statut (pending uniquement)
- ✅ Validation de la devise (GNF)

### **Sécurité**
- ✅ Authentification Lengo Pay
- ✅ Validation des callbacks
- ✅ Gestion des erreurs robuste
- ✅ Logs détaillés

---

## 📧 Emails Automatiques

### **Email de Succès**
- Template HTML responsive
- Détails de l'abonnement
- Numéro de transaction
- Instructions de suite

### **Email d'Échec**
- Template HTML responsive
- Raisons possibles
- Instructions de réessai
- Contact support

---

## 🚨 Gestion d'Erreurs

### **Erreurs Courantes**

**400 - Données manquantes :**
```json
{
  "error": "Données manquantes",
  "required": ["subscription_id", "amount"]
}
```

**404 - Abonnement non trouvé :**
```json
{
  "error": "Abonnement non trouvé",
  "subscription_id": "sub_123456"
}
```

**400 - Montant incorrect :**
```json
{
  "error": "Montant incorrect",
  "expected": 50000,
  "received": 45000
}
```

**400 - Statut invalide :**
```json
{
  "error": "Abonnement non éligible au paiement",
  "current_status": "active"
}
```

---

## 🔗 URLs de Configuration

### **URLs de Callback**
```env
# Callback pour les abonnements
LENGO_PAY_CALLBACK_URL=https://braprime-backend.vercel.app/api/subscriptions/callback

# URL de retour frontend
FRONTEND_RETURN_URL=https://braprime-backend.vercel.app/subscription-status
```

### **URLs de Test**
```bash
# Test de paiement
curl -X POST https://braprime-backend.vercel.app/api/subscriptions/pay \
  -H "Content-Type: application/json" \
  -d '{"subscription_id": "test_sub", "amount": 50000}'

# Test de callback
curl -X POST https://braprime-backend.vercel.app/api/subscriptions/callback \
  -H "Content-Type: application/json" \
  -d '{"pay_id": "test_pay", "status": "SUCCESS", "amount": 50000}'
```

---

## 📝 Notes Importantes

1. **Séparation des tables** : Les abonnements utilisent `subscription_payments` et non `payments`
2. **Triggers automatiques** : L'activation du business se fait automatiquement
3. **Emails obligatoires** : Tous les paiements génèrent un email
4. **Validation stricte** : Vérification complète des données
5. **Logs détaillés** : Traçabilité complète des transactions

---

## 🎯 Avantages

- ✅ **Séparation claire** entre commandes et abonnements
- ✅ **Automatisation complète** via triggers
- ✅ **Emails automatiques** pour notifications
- ✅ **Validation robuste** des données
- ✅ **Intégration Lengo Pay** optimisée
- ✅ **Traçabilité complète** des transactions

---

Cette documentation couvre uniquement les routes de paiement d'abonnements. Le frontend gère le reste avec ses services ! 🚀 