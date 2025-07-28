# 📧 Documentation API Emails - BraPrime

## 🎯 Vue d'Ensemble

Cette documentation décrit toutes les routes API pour l'envoi d'emails dans le système BraPrime. Toutes les routes utilisent le service Resend pour l'envoi d'emails.

---

## 🔧 Configuration

### Variables d'Environnement Requises

```env
RESEND_API_KEY=votre_cle_api_resend_ici
ADMIN_EMAILS=admin@bradelivery.com,manager@bradelivery.com
SUPPORT_EMAIL=support@bradelivery.com
SUPPORT_PHONE=+224 621 00 00 00
```

### Base URL

```
http://localhost:3000/api/emails
```

---

## 📋 Routes API

### 1. Confirmation de Demande

**Endpoint :** `POST /api/emails/request-confirmation`

**Description :** Envoie un email de confirmation au demandeur après soumission d'une demande.

#### Exemple Postman

**Request :**
```
Method: POST
URL: http://localhost:3000/api/emails/request-confirmation
Headers:
  Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "request_id": "req_123456789",
  "request_type": "partner",
  "user_name": "Mamadou Diallo",
  "user_email": "morykoulibaly2023@gmail.com",
  "user_phone": "+224 621 123 456",
  "business_name": "Restaurant Le Gourmet",
  "business_type": "Restaurant",
  "business_address": "123 Rue de la Paix, Conakry",
  "selected_plan_name": "Plan Premium",
  "selected_plan_price": 50000,
  "notes": "Restaurant spécialisé dans la cuisine locale",
  "submitted_at": "2024-01-15T10:30:00Z"
}
```

**Response (200) :**
```json
{
  "success": true,
  "message": "Email de confirmation envoyé avec succès",
  "email_id": "email_abc123",
  "sent_at": "2024-01-15T10:30:05Z",
  "request_id": "req_123456789"
}
```

#### Test avec cURL

```bash
curl -X POST http://localhost:3000/api/emails/request-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "req_123456789",
    "request_type": "partner",
    "user_name": "Mamadou Diallo",
    "user_email": "morykoulibaly2023@gmail.com",
    "user_phone": "+224 621 123 456",
    "business_name": "Restaurant Le Gourmet",
    "business_type": "Restaurant",
    "business_address": "123 Rue de la Paix, Conakry",
    "selected_plan_name": "Plan Premium",
    "selected_plan_price": 50000,
    "notes": "Restaurant spécialisé dans la cuisine locale",
    "submitted_at": "2024-01-15T10:30:00Z"
  }'
```

---

### 2. Notification Admin

**Endpoint :** `POST /api/emails/admin-notification`

**Description :** Envoie une notification aux administrateurs quand une nouvelle demande est soumise.

#### Exemple Postman

**Request :**
```
Method: POST
URL: http://localhost:3000/api/emails/admin-notification
Headers:
  Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "request_id": "req_123456789",
  "request_type": "driver",
  "user_name": "Fatou Camara",
  "user_email": "fatou.camara@email.com",
  "user_phone": "+224 621 789 123",
  "vehicle_type": "Moto",
  "vehicle_plate": "ABC-123-GN",
  "notes": "Chauffeur expérimenté avec 5 ans d'expérience",
  "submitted_at": "2024-01-15T14:20:00Z",
  "admin_dashboard_url": "https://bradelivery.com/admin-dashboard/requests"
}
```

**Response (200) :**
```json
{
  "success": true,
  "message": "Notification admin envoyée avec succès",
  "email_ids": ["email_def456", "email_ghi789"],
  "sent_at": "2024-01-15T14:20:05Z",
  "admin_emails": ["admin@bradelivery.com", "manager@bradelivery.com"],
  "request_id": "req_123456789"
}
```

#### Test avec cURL

```bash
curl -X POST http://localhost:3000/api/emails/admin-notification \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "req_123456789",
    "request_type": "driver",
    "user_name": "Fatou Camara",
    "user_email": "fatou.camara@email.com",
    "user_phone": "+224 621 789 123",
    "vehicle_type": "Moto",
    "vehicle_plate": "ABC-123-GN",
    "notes": "Chauffeur expérimenté avec 5 ans d'expérience",
    "submitted_at": "2024-01-15T14:20:00Z",
    "admin_dashboard_url": "https://bradelivery.com/admin-dashboard/requests"
  }'
```

---

### 3. Approbation de Demande

**Endpoint :** `POST /api/emails/request-approval`

**Description :** Envoie un email au demandeur quand sa demande est approuvée, avec les informations de connexion.

#### Exemple Postman

**Request :**
```
Method: POST
URL: http://localhost:3000/api/emails/request-approval
Headers:
  Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "request_id": "req_123456789",
  "request_type": "partner",
  "user_name": "Mamadou Diallo",
  "user_email": "morykoulibaly2023@gmail.com",
  "user_phone": "+224 621 123 456",
  "business_name": "Restaurant Le Gourmet",
  "selected_plan_name": "Plan Premium",
  "selected_plan_price": 50000,
  "login_email": "mamadou@restaurant-legourmet.com",
  "login_password": "MotDePasse123!",
  "dashboard_url": "https://bradelivery.com/partner-dashboard",
  "approved_at": "2024-01-16T09:15:00Z",
  "approved_by": "admin@bradelivery.com"
}
```

**Response (200) :**
```json
{
  "success": true,
  "message": "Email d'approbation envoyé avec succès",
  "email_id": "email_jkl012",
  "sent_at": "2024-01-16T09:15:05Z",
  "request_id": "req_123456789"
}
```

#### Test avec cURL

```bash
curl -X POST http://localhost:3000/api/emails/request-approval \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "req_123456789",
    "request_type": "partner",
    "user_name": "Mamadou Diallo",
    "user_email": "morykoulibaly2023@gmail.com",
    "user_phone": "+224 621 123 456",
    "business_name": "Restaurant Le Gourmet",
    "selected_plan_name": "Plan Premium",
    "selected_plan_price": 50000,
    "login_email": "mamadou@restaurant-legourmet.com",
    "login_password": "MotDePasse123!",
    "dashboard_url": "https://bradelivery.com/partner-dashboard",
    "approved_at": "2024-01-16T09:15:00Z",
    "approved_by": "admin@bradelivery.com"
  }'
```

---

### 4. Identifiants de Connexion

**Endpoint :** `POST /api/emails/account-credentials`

**Description :** Envoie un email avec les identifiants de connexion après création automatique d'un compte.

#### Exemple Postman

**Request :**
```
Method: POST
URL: http://localhost:3000/api/emails/account-credentials
Headers:
  Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "account_type": "partner",
  "user_name": "Mamadou Diallo",
  "user_email": "morykoulibaly2023@gmail.com",
  "login_email": "mamadou@restaurant-legourmet.com",
  "login_password": "MotDePasse123!",
  "business_name": "Restaurant Le Gourmet",
  "business_id": "business_456789",
  "selected_plan_name": "Plan Premium",
  "selected_plan_price": 50000,
  "dashboard_url": "https://bradelivery.com/partner-dashboard",
  "account_created_at": "2024-01-16T09:15:00Z",
  "created_by": "admin@bradelivery.com",
  "support_email": "support@bradelivery.com",
  "support_phone": "+224 621 00 00 00"
}
```

**Response (200) :**
```json
{
  "success": true,
  "message": "Email avec identifiants envoyé avec succès",
  "email_id": "email_xyz789",
  "sent_at": "2024-01-16T09:15:05Z",
  "account_type": "partner"
}
```

#### Test avec cURL

```bash
curl -X POST http://localhost:3000/api/emails/account-credentials \
  -H "Content-Type: application/json" \
  -d '{
    "account_type": "partner",
    "user_name": "Mamadou Diallo",
    "user_email": "morykoulibaly2023@gmail.com",
    "login_email": "mamadou@restaurant-legourmet.com",
    "login_password": "MotDePasse123!",
    "business_name": "Restaurant Le Gourmet",
    "business_id": "business_456789",
    "selected_plan_name": "Plan Premium",
    "selected_plan_price": 50000,
    "dashboard_url": "https://bradelivery.com/partner-dashboard",
    "account_created_at": "2024-01-16T09:15:00Z",
    "created_by": "admin@bradelivery.com",
    "support_email": "support@bradelivery.com",
    "support_phone": "+224 621 00 00 00"
  }'
```

---

### 5. Réinitialisation de Mot de Passe

**Endpoint :** `POST /api/emails/password-reset`

**Description :** Envoie un email de réinitialisation de mot de passe pour tous les types d'utilisateurs.

#### Exemple Postman

**Request :**
```
Method: POST
URL: http://localhost:3000/api/emails/password-reset
Headers:
  Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "user_email": "morykoulibaly2023@gmail.com",
  "user_name": "Mamadou Diallo",
  "user_type": "partner",
  "reset_token": "reset_token_abc123",
  "reset_url": "https://bradelivery.com/reset-password?token=reset_token_abc123",
  "expires_at": "2024-01-15T18:30:00Z"
}
```

**Response (200) :**
```json
{
  "success": true,
  "message": "Email de réinitialisation envoyé avec succès",
  "email_id": "email_reset456",
  "sent_at": "2024-01-15T10:30:05Z",
  "user_type": "partner"
}
```

#### Test avec cURL

```bash
curl -X POST http://localhost:3000/api/emails/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "morykoulibaly2023@gmail.com",
    "user_name": "Mamadou Diallo",
    "user_type": "partner",
    "reset_token": "reset_token_abc123",
    "reset_url": "https://bradelivery.com/reset-password?token=reset_token_abc123",
    "expires_at": "2024-01-15T18:30:00Z"
  }'
```

---

### 6. Confirmation de Commande

**Endpoint :** `POST /api/emails/order-confirmation`

**Description :** Envoie un email de confirmation après la création d'une commande.

#### Exemple Postman

**Request :**
```
Method: POST
URL: http://localhost:3000/api/emails/order-confirmation
Headers:
  Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "order_id": "order_123456",
  "user_name": "Fatou Camara",
  "user_email": "fatou.camara@email.com",
  "business_name": "Restaurant Le Gourmet",
  "business_address": "123 Rue de la Paix, Conakry",
  "order_items": [
    {
      "name": "Poulet Yassa",
      "quantity": 2,
      "price": 5000
    },
    {
      "name": "Riz au gras",
      "quantity": 1,
      "price": 2000
    }
  ],
  "subtotal": 12000,
  "delivery_fee": 1000,
  "tax": 600,
  "total": 13600,
  "delivery_address": "456 Avenue de la Liberté, Conakry",
  "estimated_delivery": "30-45 minutes",
  "order_number": "ORD-2024-001",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Response (200) :**
```json
{
  "success": true,
  "message": "Email de confirmation de commande envoyé avec succès",
  "email_id": "email_order789",
  "sent_at": "2024-01-15T10:30:05Z",
  "order_id": "order_123456",
  "order_number": "ORD-2024-001"
}
```

#### Test avec cURL

```bash
curl -X POST http://localhost:3000/api/emails/order-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_123456",
    "user_name": "Fatou Camara",
    "user_email": "fatou.camara@email.com",
    "business_name": "Restaurant Le Gourmet",
    "business_address": "123 Rue de la Paix, Conakry",
    "order_items": [
      {
        "name": "Poulet Yassa",
        "quantity": 2,
        "price": 5000
      },
      {
        "name": "Riz au gras",
        "quantity": 1,
        "price": 2000
      }
    ],
    "subtotal": 12000,
    "delivery_fee": 1000,
    "tax": 600,
    "total": 13600,
    "delivery_address": "456 Avenue de la Liberté, Conakry",
    "estimated_delivery": "30-45 minutes",
    "order_number": "ORD-2024-001",
    "created_at": "2024-01-15T10:30:00Z"
  }'
```

---

### 7. Mise à Jour de Statut de Commande

**Endpoint :** `POST /api/emails/order-status-update`

**Description :** Envoie un email de mise à jour quand le statut d'une commande change.

#### Exemple Postman

**Request :**
```
Method: POST
URL: http://localhost:3000/api/emails/order-status-update
Headers:
  Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "order_id": "order_123456",
  "user_name": "Fatou Camara",
  "user_email": "fatou.camara@email.com",
  "business_name": "Restaurant Le Gourmet",
  "order_number": "ORD-2024-001",
  "old_status": "preparing",
  "new_status": "out_for_delivery",
  "status_label": "En cours de livraison",
  "estimated_delivery": "15-20 minutes",
  "driver_name": "Ibrahim Traoré",
  "driver_phone": "+224 621 456 789",
  "updated_at": "2024-01-15T11:15:00Z"
}
```

**Response (200) :**
```json
{
  "success": true,
  "message": "Email de mise à jour de statut envoyé avec succès",
  "email_id": "email_status456",
  "sent_at": "2024-01-15T11:15:05Z",
  "order_id": "order_123456",
  "order_number": "ORD-2024-001",
  "new_status": "out_for_delivery"
}
```

#### Test avec cURL

```bash
curl -X POST http://localhost:3000/api/emails/order-status-update \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_123456",
    "user_name": "Fatou Camara",
    "user_email": "fatou.camara@email.com",
    "business_name": "Restaurant Le Gourmet",
    "order_number": "ORD-2024-001",
    "old_status": "preparing",
    "new_status": "out_for_delivery",
    "status_label": "En cours de livraison",
    "estimated_delivery": "15-20 minutes",
    "driver_name": "Ibrahim Traoré",
    "driver_phone": "+224 621 456 789",
    "updated_at": "2024-01-15T11:15:00Z"
  }'
```

---

### 8. Rejet de Demande

**Endpoint :** `POST /api/emails/request-rejection`

**Description :** Envoie un email au demandeur quand sa demande est rejetée, avec les raisons.

#### Exemple Postman

**Request :**
```
Method: POST
URL: http://localhost:3000/api/emails/request-rejection
Headers:
  Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "request_id": "req_987654321",
  "request_type": "driver",
  "user_name": "Ibrahim Traoré",
  "user_email": "ibrahim.traore@email.com",
  "business_name": "Transport Traoré",
  "rejection_reason": "Documents d'identité incomplets. Veuillez fournir une pièce d'identité valide et un permis de conduire en cours de validité.",
  "admin_notes": "Le permis de conduire fourni a expiré depuis 3 mois. Demander un nouveau permis valide.",
  "rejected_at": "2024-01-16T11:30:00Z",
  "rejected_by": "admin@bradelivery.com",
  "contact_email": "support@bradelivery.com",
  "contact_phone": "+224 621 00 00 00"
}
```

**Response (200) :**
```json
{
  "success": true,
  "message": "Email de rejet envoyé avec succès",
  "email_id": "email_mno345",
  "sent_at": "2024-01-16T11:30:05Z",
  "request_id": "req_987654321"
}
```

#### Test avec cURL

```bash
curl -X POST http://localhost:3000/api/emails/request-rejection \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "req_987654321",
    "request_type": "driver",
    "user_name": "Ibrahim Traoré",
    "user_email": "ibrahim.traore@email.com",
    "business_name": "Transport Traoré",
    "rejection_reason": "Documents d'identité incomplets. Veuillez fournir une pièce d'identité valide et un permis de conduire en cours de validité.",
    "admin_notes": "Le permis de conduire fourni a expiré depuis 3 mois. Demander un nouveau permis valide.",
    "rejected_at": "2024-01-16T11:30:00Z",
    "rejected_by": "admin@bradelivery.com",
    "contact_email": "support@bradelivery.com",
    "contact_phone": "+224 621 00 00 00"
  }'
```

---

### 9. Rappel de Paiement

**Endpoint :** `POST /api/emails/payment-reminder`

**Description :** Envoie un email de rappel pour le paiement de l'abonnement (partenaires uniquement).

#### Exemple Postman

**Request :**
```
Method: POST
URL: http://localhost:3000/api/emails/payment-reminder
Headers:
  Content-Type: application/json
```

**Body (JSON) - Premier Rappel :**
```json
{
  "partner_id": "partner_456789",
  "partner_name": "Mamadou Diallo",
  "partner_email": "morykoulibaly2023@gmail.com",
  "business_name": "Restaurant Le Gourmet",
  "subscription_id": "sub_123456",
  "plan_name": "Plan Premium",
  "plan_price": 50000,
  "days_remaining": 7,
  "payment_url": "https://bradelivery.com/partner-dashboard/settings/billing",
  "reminder_type": "first"
}
```

**Body (JSON) - Dernier Rappel :**
```json
{
  "partner_id": "partner_456789",
  "partner_name": "Mamadou Diallo",
  "partner_email": "morykoulibaly2023@gmail.com",
  "business_name": "Restaurant Le Gourmet",
  "subscription_id": "sub_123456",
  "plan_name": "Plan Premium",
  "plan_price": 50000,
  "days_remaining": 1,
  "payment_url": "https://bradelivery.com/partner-dashboard/settings/billing",
  "reminder_type": "final"
}
```

**Response (200) :**
```json
{
  "success": true,
  "message": "Rappel de paiement envoyé avec succès",
  "email_id": "email_pqr678",
  "sent_at": "2024-01-15T10:30:05Z",
  "partner_id": "partner_456789",
  "subscription_id": "sub_123456",
  "reminder_type": "first"
}
```

#### Test avec cURL

```bash
curl -X POST http://localhost:3000/api/emails/payment-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "partner_456789",
    "partner_name": "Mamadou Diallo",
    "partner_email": "morykoulibaly2023@gmail.com",
    "business_name": "Restaurant Le Gourmet",
    "subscription_id": "sub_123456",
    "plan_name": "Plan Premium",
    "plan_price": 50000,
    "days_remaining": 7,
    "payment_url": "https://bradelivery.com/partner-dashboard/settings/billing",
    "reminder_type": "first"
  }'
```

---

## 📊 Collection Postman Complète

### Import de la Collection

Vous pouvez importer cette collection dans Postman en créant un fichier JSON avec la structure suivante :

```json
{
  "info": {
    "name": "BraPrime Email API - Collection Complète",
    "description": "Collection pour tester toutes les routes API d'emails BraPrime"
  },
  "item": [
    {
      "name": "1. Confirmation de Demande",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/emails/request-confirmation",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "emails", "request-confirmation"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"request_id\": \"req_123456789\",\n  \"request_type\": \"partner\",\n  \"user_name\": \"Mamadou Diallo\",\n  \"user_email\": \"morykoulibaly2023@gmail.com\",\n  \"user_phone\": \"+224 621 123 456\",\n  \"business_name\": \"Restaurant Le Gourmet\",\n  \"business_type\": \"Restaurant\",\n  \"business_address\": \"123 Rue de la Paix, Conakry\",\n  \"selected_plan_name\": \"Plan Premium\",\n  \"selected_plan_price\": 50000,\n  \"notes\": \"Restaurant spécialisé dans la cuisine locale\",\n  \"submitted_at\": \"2024-01-15T10:30:00Z\"\n}"
        }
      }
    },
    {
      "name": "2. Notification Admin",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/emails/admin-notification",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "emails", "admin-notification"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"request_id\": \"req_123456789\",\n  \"request_type\": \"driver\",\n  \"user_name\": \"Fatou Camara\",\n  \"user_email\": \"fatou.camara@email.com\",\n  \"user_phone\": \"+224 621 789 123\",\n  \"vehicle_type\": \"Moto\",\n  \"vehicle_plate\": \"ABC-123-GN\",\n  \"notes\": \"Chauffeur expérimenté avec 5 ans d'expérience\",\n  \"submitted_at\": \"2024-01-15T14:20:00Z\",\n  \"admin_dashboard_url\": \"https://bradelivery.com/admin-dashboard/requests\"\n}"
        }
      }
    },
    {
      "name": "3. Approbation de Demande",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/emails/request-approval",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "emails", "request-approval"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"request_id\": \"req_123456789\",\n  \"request_type\": \"partner\",\n  \"user_name\": \"Mamadou Diallo\",\n  \"user_email\": \"morykoulibaly2023@gmail.com\",\n  \"user_phone\": \"+224 621 123 456\",\n  \"business_name\": \"Restaurant Le Gourmet\",\n  \"selected_plan_name\": \"Plan Premium\",\n  \"selected_plan_price\": 50000,\n  \"login_email\": \"mamadou@restaurant-legourmet.com\",\n  \"login_password\": \"MotDePasse123!\",\n  \"dashboard_url\": \"https://bradelivery.com/partner-dashboard\",\n  \"approved_at\": \"2024-01-16T09:15:00Z\",\n  \"approved_by\": \"admin@bradelivery.com\"\n}"
        }
      }
    },
    {
      "name": "4. Identifiants de Connexion",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/emails/account-credentials",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "emails", "account-credentials"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"account_type\": \"partner\",\n  \"user_name\": \"Mamadou Diallo\",\n  \"user_email\": \"morykoulibaly2023@gmail.com\",\n  \"login_email\": \"mamadou@restaurant-legourmet.com\",\n  \"login_password\": \"MotDePasse123!\",\n  \"business_name\": \"Restaurant Le Gourmet\",\n  \"business_id\": \"business_456789\",\n  \"selected_plan_name\": \"Plan Premium\",\n  \"selected_plan_price\": 50000,\n  \"dashboard_url\": \"https://bradelivery.com/partner-dashboard\",\n  \"account_created_at\": \"2024-01-16T09:15:00Z\",\n  \"created_by\": \"admin@bradelivery.com\",\n  \"support_email\": \"support@bradelivery.com\",\n  \"support_phone\": \"+224 621 00 00 00\"\n}"
        }
      }
    },
    {
      "name": "5. Réinitialisation de Mot de Passe",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/emails/password-reset",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "emails", "password-reset"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"user_email\": \"morykoulibaly2023@gmail.com\",\n  \"user_name\": \"Mamadou Diallo\",\n  \"user_type\": \"partner\",\n  \"reset_token\": \"reset_token_abc123\",\n  \"reset_url\": \"https://bradelivery.com/reset-password?token=reset_token_abc123\",\n  \"expires_at\": \"2024-01-15T18:30:00Z\"\n}"
        }
      }
    },
    {
      "name": "6. Confirmation de Commande",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/emails/order-confirmation",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "emails", "order-confirmation"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"order_id\": \"order_123456\",\n  \"user_name\": \"Fatou Camara\",\n  \"user_email\": \"fatou.camara@email.com\",\n  \"business_name\": \"Restaurant Le Gourmet\",\n  \"business_address\": \"123 Rue de la Paix, Conakry\",\n  \"order_items\": [\n    {\n      \"name\": \"Poulet Yassa\",\n      \"quantity\": 2,\n      \"price\": 5000\n    },\n    {\n      \"name\": \"Riz au gras\",\n      \"quantity\": 1,\n      \"price\": 2000\n    }\n  ],\n  \"subtotal\": 12000,\n  \"delivery_fee\": 1000,\n  \"tax\": 600,\n  \"total\": 13600,\n  \"delivery_address\": \"456 Avenue de la Liberté, Conakry\",\n  \"estimated_delivery\": \"30-45 minutes\",\n  \"order_number\": \"ORD-2024-001\",\n  \"created_at\": \"2024-01-15T10:30:00Z\"\n}"
        }
      }
    },
    {
      "name": "7. Mise à Jour de Statut de Commande",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/emails/order-status-update",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "emails", "order-status-update"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"order_id\": \"order_123456\",\n  \"user_name\": \"Fatou Camara\",\n  \"user_email\": \"fatou.camara@email.com\",\n  \"business_name\": \"Restaurant Le Gourmet\",\n  \"order_number\": \"ORD-2024-001\",\n  \"old_status\": \"preparing\",\n  \"new_status\": \"out_for_delivery\",\n  \"status_label\": \"En cours de livraison\",\n  \"estimated_delivery\": \"15-20 minutes\",\n  \"driver_name\": \"Ibrahim Traoré\",\n  \"driver_phone\": \"+224 621 456 789\",\n  \"updated_at\": \"2024-01-15T11:15:00Z\"\n}"
        }
      }
    },
    {
      "name": "8. Rejet de Demande",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/emails/request-rejection",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "emails", "request-rejection"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"request_id\": \"req_987654321\",\n  \"request_type\": \"driver\",\n  \"user_name\": \"Ibrahim Traoré\",\n  \"user_email\": \"ibrahim.traore@email.com\",\n  \"business_name\": \"Transport Traoré\",\n  \"rejection_reason\": \"Documents d'identité incomplets. Veuillez fournir une pièce d'identité valide et un permis de conduire en cours de validité.\",\n  \"admin_notes\": \"Le permis de conduire fourni a expiré depuis 3 mois. Demander un nouveau permis valide.\",\n  \"rejected_at\": \"2024-01-16T11:30:00Z\",\n  \"rejected_by\": \"admin@bradelivery.com\",\n  \"contact_email\": \"support@bradelivery.com\",\n  \"contact_phone\": \"+224 621 00 00 00\"\n}"
        }
      }
    },
    {
      "name": "9. Rappel de Paiement",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/emails/payment-reminder",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "emails", "payment-reminder"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"partner_id\": \"partner_456789\",\n  \"partner_name\": \"Mamadou Diallo\",\n  \"partner_email\": \"morykoulibaly2023@gmail.com\",\n  \"business_name\": \"Restaurant Le Gourmet\",\n  \"subscription_id\": \"sub_123456\",\n  \"plan_name\": \"Plan Premium\",\n  \"plan_price\": 50000,\n  \"days_remaining\": 7,\n  \"payment_url\": \"https://bradelivery.com/partner-dashboard/settings/billing\",\n  \"reminder_type\": \"first\"\n}"
        }
      }
    }
  ]
}
```

---

## 🔍 Tests et Validation

### Tests de Validation

Chaque route inclut des validations automatiques :

1. **Champs requis** : Vérification de la présence des champs obligatoires
2. **Types de données** : Validation des types (string, number, etc.)
3. **Valeurs autorisées** : Vérification des valeurs dans les énumérations
4. **Format des emails** : Validation basique des adresses email

### Exemples d'Erreurs

**Erreur 400 - Champs manquants :**
```json
{
  "error": "Champs manquants: request_id, request_type, user_name, user_email, user_phone sont requis"
}
```

**Erreur 400 - Type invalide :**
```json
{
  "error": "request_type doit être \"partner\" ou \"driver\""
}
```

**Erreur 500 - Erreur d'envoi :**
```json
{
  "error": "You can only send testing emails to your own email address"
}
```

---

## 🚀 Intégration

### Variables d'Environnement Postman

Créez un environnement Postman avec ces variables :

```json
{
  "base_url": "http://localhost:3000",
  "admin_email": "admin@bradelivery.com",
  "support_email": "support@bradelivery.com",
  "test_user_email": "morykoulibaly2023@gmail.com"
}
```

### Scripts de Test

Ajoutez ces scripts dans les tests Postman pour automatiser les vérifications :

```javascript
// Test de réponse réussie
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Response has email_id", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.email_id).to.be.a('string');
});
```

---

## 📝 Notes Importantes

1. **Email de test** : Pour les tests, utilisez uniquement `morykoulibaly2023@gmail.com` (votre email autorisé)
2. **Domaine vérifié** : Remplacez `onboarding@resend.dev` par votre domaine vérifié en production
3. **Variables d'environnement** : Configurez `ADMIN_EMAILS` pour les notifications admin
4. **Templates HTML** : Tous les emails utilisent des templates HTML responsifs avec CSS inline

---

## 🔗 Liens Utiles

- [Documentation Resend](https://resend.com/docs)
- [Guide d'intégration](https://resend.com/docs/send-with-api)
- [Validation des domaines](https://resend.com/domains)

---

Cette documentation fournit tous les exemples nécessaires pour tester et intégrer les routes API d'emails BraPrime. 🚀 