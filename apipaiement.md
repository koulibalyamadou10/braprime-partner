# 💳 **Documentation API - Système de Paiement BraPrime (Frontend)**

## 🎯 Vue d'Ensemble

L'API de paiement BraPrime intègre la passerelle de paiement Lengo Pay **API v1** pour créer des URLs de paiement sécurisées via mobile money, cartes bancaires et autres méthodes de paiement populaires en Guinée.

### **🏗️ Architecture**

Ce projet Next.js sert de **backend API** pour votre application frontend :

- ✅ **Backend API** : Expose des routes API REST
- ✅ **Frontend séparé** : Votre application consomme ces APIs
- ✅ **Intégration** : Lengo Pay + Resend pour emails

---

## 🔗 **Endpoints Client**

### 1. **Créer une URL de Paiement**
- **URL** : `POST /api/payments/lengo-pay`
- **Description** : Crée une URL de paiement unique via Lengo Pay API v1

### 2. **Vérifier le Statut des Paiements**
- **URL** : `GET /api/payments/status`
- **Description** : Récupère le statut via l'API Lengo Pay

---

## 🔄 **Flux d'Utilisation Client**

### **1. Création de Paiement**
```
Frontend → POST /api/payments/lengo-pay → URL de paiement
```

### **2. Redirection vers Lengo Pay**
```
Frontend → Redirige vers payment_url → Page de paiement Lengo Pay
```

### **3. Retour automatique avec vérification**
```
Lengo Pay → Redirige vers return_url → Page de statut frontend
Frontend → GET /api/payments/status → Affiche le statut final
```

### **🎯 Flux Complet avec return_url**

```
1. Utilisateur clique "Payer" → Page de paiement Lengo Pay
2. Utilisateur effectue le paiement → Lengo Pay traite
3. Lengo Pay redirige automatiquement → Votre page /payment-status
4. Votre page vérifie le statut → Affiche "Paiement confirmé !"
```

---

## 📋 **1. Créer une Transaction de Paiement**

### **Endpoint**
```
POST /api/payments/lengo-pay
```

### **Headers**
```http
Content-Type: application/json
```

### **Payload JSON**
```json
{
  "order_id": "uuid-de-la-commande",
  "user_id": "uuid-de-l-utilisateur",
  "amount": 15000,
  "currency": "GNF",
  "order_number": "CMD-2024-001",
  "business_name": "Restaurant Le Gourmet",
  "customer_name": "John Doe",
  "customer_email": "john@example.com"
}
```

**Note** : 
- L'API BraPrime convertit automatiquement le montant en string pour Lengo Pay selon la documentation officielle.
- L'utilisateur choisit sa méthode de paiement et son numéro directement sur la page Lengo Pay.

### **Réponse Succès**
```json
{
  "success": true,
  "pay_id": "WTVWaTBOUXVlNTB1NXNzbUhldGF0eENSV3VkeTJuV3E=",
  "payment_url": "https://payment.lengopay.com/WTVWaTBOUXVlNTB1NXNzbUhldGF0eENSV3VkeTJuV3E=",
  "message": "URL de paiement créée avec succès",
  "data": {
    "order_id": "uuid-de-la-commande",
    "amount": 15000,
    "currency": "GNF",
    "status": "pending",
    "payment_url": "https://payment.lengopay.com/WTVWaTBOUXVlNTB1NXNzbUhldGF0eENSV3VkeTJuV3E="
  }
}
```

### **Réponse Erreur**
```json
{
  "error": "Données manquantes",
  "required": ["order_id", "user_id", "amount", "phone_number"]
}
```

### **cURL Example**
```bash
curl -X POST http://localhost:3000/api/payments/lengo-pay \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "uuid-de-la-commande",
    "user_id": "uuid-de-l-utilisateur",
    "amount": 15000,
    "currency": "GNF",
    "order_number": "CMD-2024-001",
    "business_name": "Restaurant Le Gourmet",
    "customer_name": "John Doe",
    "customer_email": "john@example.com"
  }'
```

---

## 📋 **2. Vérifier le Statut des Paiements**

### **Endpoint**
```
GET /api/payments/status
```

### **Paramètres de Requête**
| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `pay_id` | string | ID spécifique du paiement | `WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8=` |
| `order_id` | string | ID de la commande | `uuid-de-la-commande` |
| `user_id` | string | ID de l'utilisateur | `uuid-de-l-utilisateur` |
| `status` | string | Statut du paiement | `success`, `pending`, `failed` |
| `limit` | number | Nombre de résultats | `10` |
| `offset` | number | Pagination | `0` |

### **Réponse Succès (Paiement Spécifique)**
```json
{
  "success": true,
  "data": {
    "id": "pay_WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8=",
    "order_id": "order_123",
    "pay_id": "WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8=",
    "amount": 1000,
    "currency": "GNF",
    "status": "initiated",
    "method": "lengo-pay",
    "created_at": "2025-07-25 13:18:53",
    "updated_at": "2025-07-25 13:18:53",
    "gateway_response": {
      "status": "INITIATED",
      "pay_id": "WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8=",
      "date": "2025-07-25 13:18:53",
      "amount": 1000
    }
  },
  "source": "lengo-pay-api"
}
```

### **cURL Examples**

#### Vérifier un paiement spécifique
```bash
curl -X GET "http://localhost:3000/api/payments/status?pay_id=WWVrc0wwWFBoaGpob3hZeVY5SmpzY3hDU0lUYVdPdE8="
```

#### Lister les paiements d'un utilisateur
```bash
curl -X GET "http://localhost:3000/api/payments/status?user_id=uuid-de-l-utilisateur&status=success&limit=5"
```

#### Lister tous les paiements avec pagination
```bash
curl -X GET "http://localhost:3000/api/payments/status?limit=10&offset=0"
```

---

## 🚀 **Implémentation Côté Client**

### **Étapes d'Implémentation**

1. **Créer la page de statut** : `/payment-status`
2. **Configurer les variables d'environnement** : `FRONTEND_RETURN_URL`
3. **Tester le flux complet** : Création → Paiement → Retour
4. **Personnaliser l'interface** : Styles et messages

### **🎯 Page de Statut Frontend (Obligatoire)**

Vous devez créer une page `/payment-status` dans votre frontend pour recevoir l'utilisateur après le paiement :

```javascript
// pages/payment-status.js ou components/PaymentStatusPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const PaymentStatusPage = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Vérification du paiement...');

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const payId = searchParams.get('pay_id');

    if (orderId && payId) {
      // Vérifier le statut du paiement
      checkPaymentStatus(payId);
    } else {
      setStatus('error');
      setMessage('Paramètres manquants');
    }
  }, [searchParams]);

  const checkPaymentStatus = async (payId) => {
    try {
      const response = await fetch(`/api/payments/status?pay_id=${payId}`);
      const data = await response.json();

      if (data.success) {
        const paymentStatus = data.data.status;
        
        switch (paymentStatus) {
          case 'success':
          case 'SUCCESS':
            setStatus('success');
            setMessage('✅ Paiement confirmé ! Votre commande est en cours de préparation.');
            break;
          case 'failed':
          case 'FAILED':
            setStatus('failed');
            setMessage('❌ Paiement échoué. Veuillez réessayer.');
            break;
          case 'initiated':
          case 'INITIATED':
            setStatus('pending');
            setMessage('⏳ Paiement en cours... Veuillez patienter.');
            // Continuer le polling
            setTimeout(() => checkPaymentStatus(payId), 5000);
            break;
          default:
            setStatus('unknown');
            setMessage('ℹ️ Statut inconnu');
        }
      } else {
        setStatus('error');
        setMessage('❌ Erreur de vérification');
      }
    } catch (error) {
      console.error('Erreur vérification statut:', error);
      setStatus('error');
      setMessage('❌ Erreur de connexion');
    }
  };

  return (
    <div className="payment-status-page">
      <div className={`status-container ${status}`}>
        <h1>Statut du Paiement</h1>
        <div className="status-message">{message}</div>
        
        {status === 'success' && (
          <div className="success-actions">
            <button onClick={() => window.location.href = '/'}>
              Retour à l'accueil
            </button>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="failed-actions">
            <button onClick={() => window.history.back()}>
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;
```

### **Exemple d'Intégration Complète**

```javascript
// 1. Page de commande (création du paiement)
const OrderPage = () => {
  const createPayment = async (orderData) => {
    const response = await fetch('/api/payments/lengo-pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Rediriger vers Lengo Pay
      window.location.href = result.payment_url;
    }
  };

  return (
    <div>
      <button onClick={() => createPayment(orderData)}>
        Payer maintenant
      </button>
    </div>
  );
};

// 2. Page de statut (return_url)
const PaymentStatusPage = () => {
  // ... code de la page de statut (voir plus haut)
};
```

### **Configuration Requise**

```env
# Dans votre frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3000
FRONTEND_RETURN_URL=http://localhost:8080/payment-status
```

### **🔗 Configuration du return_url**

Le `return_url` est automatiquement configuré dans l'API BraPrime :

```javascript
// Dans l'API BraPrime (app/api/payments/lengo-pay/route.ts)
const requestData = {
  websiteid: LENGO_PAY_CONFIG.websiteId!,
  currency: paymentData.currency,
  amount: Number(paymentData.amount),
  return_url: `${LENGO_PAY_CONFIG.returnUrl}?order_id=${paymentData.order_id}&pay_id=${paymentData.order_id}`,
  callback_url: `${LENGO_PAY_CONFIG.callbackBaseUrl}?order_id=${paymentData.order_id}`
};
```

**URLs configurées :**
- **Développement** : `http://localhost:8080/payment-status`
- **Production** : `https://votre-domaine.com/payment-status`

---

## 🔧 **Configuration**

### **Variables d'Environnement Configurées**

Vos clés Lengo Pay sont déjà configurées dans le fichier `.env.local` :

```env
# Configuration Lengo Pay
LENGO_PAY_LICENSE_KEY=MXNuTGhqVmc2eExqaE5vYlhUaEpONmRUMFg3eTFJbWlJN1hQdFg2T3A3U0gydHhKUWpLbHRrTWhJVDM1Q202Mw==
LENGO_PAY_WEBSITE_ID=DRclgwGVrQz4Tw0x
LENGO_PAY_CALLBACK_URL=http://localhost:3000/api/payments/lengo-pay/callback
FRONTEND_RETURN_URL=http://localhost:8080/payment-status

# Configuration Resend (pour les emails)
RESEND_API_KEY=votre_cle_api_resend

# Configuration Admin
ADMIN_EMAILS=admin@bradelivery.com,manager@bradelivery.com
SUPPORT_EMAIL=support@bradelivery.com
SUPPORT_PHONE=+224 621 00 00 00
```

### **Méthodes de Paiement Supportées**

| Méthode | Code | Description |
|---------|------|-------------|
| Orange Money Guinée | `lp-om-gn` | Paiement via Orange Money |
| MTN Mobile Money | `lp-momo-gn` | Paiement via MTN MoMo |
| Visa | `lp-visa` | Paiement par carte Visa |
| Mastercard | `lp-mastercard` | Paiement par carte Mastercard |

---

## 🧪 **Tests**

### **Test de Création de Paiement**

```javascript
// Test avec fetch
fetch('http://localhost:3000/api/payments/lengo-pay', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    order_id: 'test-order-123',
    user_id: 'test-user-456',
    amount: 15000,
    currency: 'GNF',
    order_number: 'CMD-TEST-001',
    business_name: 'Restaurant Test',
    customer_name: 'Test User',
    customer_email: 'test@example.com'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

### **Test de Vérification de Statut**

```javascript
// Vérifier le statut d'un paiement
fetch('http://localhost:3000/api/payments/status?pay_id=test-pay-id')
.then(response => response.json())
.then(data => console.log('Status:', data))
.catch(error => console.error('Error:', error));
```



## 📝 **Notes Importantes**

1. **Test en Développement** : Utilisez des numéros de téléphone de test
2. **Production** : Configurez les domaines autorisés dans Lengo Pay
3. **Monitoring** : Surveillez les logs pour détecter les échecs
4. **Backup** : Sauvegardez régulièrement les données de paiement
5. **Support** : Contactez le support Lengo Pay pour toute question technique

---

L'API de paiement BraPrime est maintenant prête à être utilisée ! 🎉 