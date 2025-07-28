# 📧 **Documentation API - Système d'Emails BraPrime**

## 🎯 **Vue d'Ensemble**

Ce document décrit les routes API nécessaires pour l'envoi automatique d'emails dans le système BraPrime. Les emails sont envoyés à différents moments du cycle de vie de l'application.

---

## 📋 **Routes API Requises**

### **1. Route d'Envoi d'Email de Confirmation de Demande**

#### **Endpoint**
```
POST /api/emails/request-confirmation
```

#### **Description**
Envoie un email de confirmation au demandeur après soumission d'une demande de partenariat ou chauffeur.

#### **Payload**
```json
{
  "request_id": "uuid",
  "request_type": "partner" | "driver",
  "user_name": "string",
  "user_email": "string",
  "user_phone": "string",
  "business_name": "string", // Pour les partenaires
  "business_type": "string", // Pour les partenaires
  "business_address": "string", // Pour les partenaires
  "vehicle_type": "string", // Pour les chauffeurs
  "vehicle_plate": "string", // Pour les chauffeurs
  "selected_plan_id": "uuid", // Pour les partenaires
  "selected_plan_name": "string", // Pour les partenaires
  "selected_plan_price": "number", // Pour les partenaires
  "notes": "string",
  "submitted_at": "2024-01-15T10:30:00Z"
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Email de confirmation envoyé avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T10:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email de confirmation de demande -->
<h2>Confirmation de votre demande BraPrime</h2>
<p>Bonjour {{user_name}},</p>
<p>Nous avons bien reçu votre demande de {{request_type === 'partner' ? 'partenariat' : 'chauffeur'}}.</p>

<h3>Détails de votre demande :</h3>
<ul>
  <li><strong>Nom :</strong> {{user_name}}</li>
  <li><strong>Email :</strong> {{user_email}}</li>
  <li><strong>Téléphone :</strong> {{user_phone}}</li>
  {{#if business_name}}
  <li><strong>Commerce :</strong> {{business_name}}</li>
  <li><strong>Type :</strong> {{business_type}}</li>
  <li><strong>Adresse :</strong> {{business_address}}</li>
  {{/if}}
  {{#if vehicle_type}}
  <li><strong>Véhicule :</strong> {{vehicle_type}}</li>
  <li><strong>Plaque :</strong> {{vehicle_plate}}</li>
  {{/if}}
  {{#if selected_plan_name}}
  <li><strong>Plan sélectionné :</strong> {{selected_plan_name}} - {{selected_plan_price}} FG</li>
  {{/if}}
</ul>

<p>Notre équipe va examiner votre demande et vous contactera dans les 24-48 heures.</p>
<p>Numéro de demande : {{request_id}}</p>
```

---

### **2. Route d'Envoi d'Email de Notification Admin**

#### **Endpoint**
```
POST /api/emails/admin-notification
```

#### **Description**
Envoie une notification aux administrateurs quand une nouvelle demande est soumise.

#### **Payload**
```json
{
  "request_id": "uuid",
  "request_type": "partner" | "driver",
  "user_name": "string",
  "user_email": "string",
  "user_phone": "string",
  "business_name": "string", // Pour les partenaires
  "business_type": "string", // Pour les partenaires
  "business_address": "string", // Pour les partenaires
  "vehicle_type": "string", // Pour les chauffeurs
  "vehicle_plate": "string", // Pour les chauffeurs
  "selected_plan_id": "uuid", // Pour les partenaires
  "selected_plan_name": "string", // Pour les partenaires
  "selected_plan_price": "number", // Pour les partenaires
  "notes": "string",
  "submitted_at": "2024-01-15T10:30:00Z",
  "admin_dashboard_url": "https://bradelivery.com/admin-dashboard/requests"
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Notification admin envoyée avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T10:30:05Z",
  "admin_emails": ["admin@bradelivery.com", "manager@bradelivery.com"]
}
```

#### **Template Email**
```html
<!-- Email de notification admin -->
<h2>🆕 Nouvelle demande {{request_type}}</h2>
<p>Une nouvelle demande a été soumise sur BraPrime.</p>

<h3>Détails de la demande :</h3>
<ul>
  <li><strong>ID Demande :</strong> {{request_id}}</li>
  <li><strong>Type :</strong> {{request_type}}</li>
  <li><strong>Nom :</strong> {{user_name}}</li>
  <li><strong>Email :</strong> {{user_email}}</li>
  <li><strong>Téléphone :</strong> {{user_phone}}</li>
  {{#if business_name}}
  <li><strong>Commerce :</strong> {{business_name}}</li>
  <li><strong>Type :</strong> {{business_type}}</li>
  <li><strong>Adresse :</strong> {{business_address}}</li>
  {{/if}}
  {{#if vehicle_type}}
  <li><strong>Véhicule :</strong> {{vehicle_type}}</li>
  <li><strong>Plaque :</strong> {{vehicle_plate}}</li>
  {{/if}}
  {{#if selected_plan_name}}
  <li><strong>Plan sélectionné :</strong> {{selected_plan_name}} - {{selected_plan_price}} FG</li>
  {{/if}}
  {{#if notes}}
  <li><strong>Notes :</strong> {{notes}}</li>
  {{/if}}
</ul>

<p><strong>Soumis le :</strong> {{submitted_at}}</p>

<a href="{{admin_dashboard_url}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
  Voir la demande
</a>
```

---

### **3. Route d'Envoi d'Email d'Approbation avec Identifiants**

#### **Endpoint**
```
POST /api/emails/request-approval
```

#### **Description**
Envoie un email au demandeur quand sa demande est approuvée, avec les informations de connexion générées automatiquement.

#### **Payload**
```json
{
  "request_id": "uuid",
  "request_type": "partner" | "driver",
  "user_name": "string",
  "user_email": "string",
  "user_phone": "string",
  "business_name": "string", // Pour les partenaires
  "selected_plan_id": "uuid", // Pour les partenaires
  "selected_plan_name": "string", // Pour les partenaires
  "selected_plan_price": "number", // Pour les partenaires
  "login_email": "string",
  "login_password": "string",
  "dashboard_url": "https://bradelivery.com/partner-dashboard",
  "approved_at": "2024-01-15T14:30:00Z",
  "approved_by": "admin@bradelivery.com",
  "account_created": true,
  "business_created": true, // Pour les partenaires
  "subscription_created": true // Pour les partenaires
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Email d'approbation avec identifiants envoyé avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T14:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email d'approbation avec identifiants -->
<h2>🎉 Votre demande a été approuvée !</h2>
<p>Bonjour {{user_name}},</p>
<p>Félicitations ! Votre demande de {{request_type === 'partner' ? 'partenariat' : 'chauffeur'}} a été approuvée par notre équipe.</p>

<h3>✅ Votre compte a été créé avec succès</h3>
<p>Votre compte a été automatiquement créé et est prêt à être utilisé.</p>

<h3>🔐 Vos identifiants de connexion :</h3>
<div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
  <p><strong>Email de connexion :</strong> {{login_email}}</p>
  <p><strong>Mot de passe temporaire :</strong> <span style="font-family: monospace; background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">{{login_password}}</span></p>
</div>

<p><strong>⚠️ Important :</strong> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion.</p>

{{#if business_name}}
<h3>🏪 Votre commerce a été configuré</h3>
<p>Votre commerce <strong>{{business_name}}</strong> a été créé et est maintenant visible sur notre plateforme.</p>
{{/if}}

{{#if selected_plan_name}}
<h3>💳 Plan d'abonnement sélectionné</h3>
<p>Plan : <strong>{{selected_plan_name}}</strong> - {{selected_plan_price}} FG</p>
<p>Vous pourrez effectuer le paiement depuis votre tableau de bord après votre première connexion.</p>
{{/if}}

<h3>🚀 Prochaines étapes :</h3>
<ol>
  <li><strong>Connectez-vous</strong> avec vos identifiants ci-dessus</li>
  <li><strong>Changez votre mot de passe</strong> pour plus de sécurité</li>
  <li><strong>Complétez votre profil</strong> avec vos informations</li>
  {{#if business_name}}
  <li><strong>Configurez votre commerce</strong> (horaires, menu, etc.)</li>
  {{/if}}
  {{#if selected_plan_name}}
  <li><strong>Effectuez le paiement</strong> de votre abonnement</li>
  {{/if}}
  <li><strong>Commencez à utiliser</strong> votre espace partenaire</li>
</ol>

<a href="{{dashboard_url}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
  🔗 Accéder à mon tableau de bord
</a>

<h3>📞 Besoin d'aide ?</h3>
<p>Si vous rencontrez des difficultés pour vous connecter :</p>
<ul>
  <li>Email : support@bradelivery.com</li>
  <li>Téléphone : +224 621 00 00 00</li>
  <li>Horaires : Lundi-Vendredi, 8h-18h</li>
</ul>

<p><small>✅ Compte créé le {{approved_at}} par {{approved_by}}</small></p>
```

---

### **4. Route d'Envoi d'Email avec Identifiants de Connexion**

#### **Endpoint**
```
POST /api/emails/account-credentials
```

#### **Description**
Envoie un email avec les identifiants de connexion après la création automatique d'un compte partenaire ou chauffeur.

#### **Payload**
```json
{
  "account_type": "partner" | "driver",
  "user_name": "string",
  "user_email": "string",
  "login_email": "string",
  "login_password": "string",
  "business_name": "string", // Pour les partenaires
  "business_id": "uuid", // Pour les partenaires
  "selected_plan_name": "string", // Pour les partenaires
  "selected_plan_price": "number", // Pour les partenaires
  "dashboard_url": "https://bradelivery.com/partner-dashboard",
  "account_created_at": "2024-01-15T14:30:00Z",
  "created_by": "admin@bradelivery.com",
  "support_email": "support@bradelivery.com",
  "support_phone": "+224 621 00 00 00"
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Email avec identifiants envoyé avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T14:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email avec identifiants de connexion -->
<h2>🔐 Vos identifiants de connexion BraPrime</h2>
<p>Bonjour {{user_name}},</p>

<p>Votre compte {{account_type === 'partner' ? 'partenaire' : 'chauffeur'}} a été créé avec succès et est maintenant actif.</p>

<h3>✅ Compte créé automatiquement</h3>
<p>Votre compte a été généré automatiquement par notre système et est prêt à être utilisé.</p>

<h3>🔑 Vos identifiants de connexion :</h3>
<div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; border: 2px solid #dc2626; margin: 20px 0;">
  <div style="margin-bottom: 15px;">
    <strong>📧 Email de connexion :</strong><br>
    <span style="font-family: monospace; background-color: #e5e7eb; padding: 8px 12px; border-radius: 6px; font-size: 14px;">{{login_email}}</span>
  </div>
  <div>
    <strong>🔒 Mot de passe temporaire :</strong><br>
    <span style="font-family: monospace; background-color: #e5e7eb; padding: 8px 12px; border-radius: 6px; font-size: 14px; color: #dc2626;">{{login_password}}</span>
  </div>
</div>

<p><strong>⚠️ Sécurité importante :</strong></p>
<ul>
  <li>Changez votre mot de passe dès votre première connexion</li>
  <li>Ne partagez jamais vos identifiants</li>
  <li>Utilisez un mot de passe fort et unique</li>
</ul>

{{#if business_name}}
<h3>🏪 Votre commerce</h3>
<p>Commerce : <strong>{{business_name}}</strong></p>
<p>ID Commerce : <code>{{business_id}}</code></p>
{{/if}}

{{#if selected_plan_name}}
<h3>💳 Abonnement configuré</h3>
<p>Plan : <strong>{{selected_plan_name}}</strong></p>
<p>Montant : <strong>{{selected_plan_price}} FG</strong></p>
<p>Le paiement peut être effectué depuis votre tableau de bord.</p>
{{/if}}

<h3>🚀 Première connexion</h3>
<ol>
  <li>Cliquez sur le bouton ci-dessous pour accéder à votre tableau de bord</li>
  <li>Connectez-vous avec vos identifiants</li>
  <li>Changez immédiatement votre mot de passe</li>
  <li>Complétez votre profil</li>
  {{#if business_name}}
  <li>Configurez votre commerce</li>
  {{/if}}
  {{#if selected_plan_name}}
  <li>Effectuez le paiement de votre abonnement</li>
  {{/if}}
</ol>

<a href="{{dashboard_url}}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin: 20px 0;">
  🔗 Accéder à mon tableau de bord
</a>

<h3>📞 Support technique</h3>
<p>En cas de problème de connexion :</p>
<ul>
  <li>📧 Email : <a href="mailto:{{support_email}}">{{support_email}}</a></li>
  <li>📱 Téléphone : <a href="tel:{{support_phone}}">{{support_phone}}</a></li>
  <li>🕒 Horaires : Lundi-Vendredi, 8h-18h</li>
</ul>

<h3>🔒 Sécurité</h3>
<p>Pour votre sécurité, ce mot de passe temporaire expire dans 24h. Connectez-vous rapidement pour le changer.</p>

<p><small>✅ Compte créé le {{account_created_at}} par {{created_by}}</small></p>
```

---

### **5. Route d'Envoi d'Email de Rejet**

#### **Endpoint**
```
POST /api/emails/request-rejection
```

#### **Description**
Envoie un email au demandeur quand sa demande est rejetée, avec les raisons.

#### **Payload**
```json
{
  "request_id": "uuid",
  "request_type": "partner" | "driver",
  "user_name": "string",
  "user_email": "string",
  "business_name": "string", // Pour les partenaires
  "rejection_reason": "string",
  "admin_notes": "string",
  "rejected_at": "2024-01-15T16:30:00Z",
  "rejected_by": "admin@bradelivery.com",
  "contact_email": "support@bradelivery.com",
  "contact_phone": "+224 621 00 00 00"
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Email de rejet envoyé avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T16:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email de rejet -->
<h2>Décision concernant votre demande</h2>
<p>Bonjour {{user_name}},</p>
<p>Nous avons examiné votre demande de {{request_type === 'partner' ? 'partenariat' : 'chauffeur'}} avec attention.</p>

<p>Malheureusement, nous ne pouvons pas approuver votre demande à ce moment.</p>

<h3>Raison :</h3>
<p>{{rejection_reason}}</p>

{{#if admin_notes}}
<h3>Détails supplémentaires :</h3>
<p>{{admin_notes}}</p>
{{/if}}

<h3>Que faire maintenant ?</h3>
<ul>
  <li>Vous pouvez soumettre une nouvelle demande avec des informations complémentaires</li>
  <li>Contactez notre équipe pour plus de détails</li>
  <li>Consultez nos critères d'éligibilité sur notre site</li>
</ul>

<h3>Nous contacter :</h3>
<ul>
  <li>Email : {{contact_email}}</li>
  <li>Téléphone : {{contact_phone}}</li>
</ul>

<p>Nous vous remercions de votre intérêt pour BraPrime.</p>
```

---

### **5. Route d'Envoi d'Email de Rappel de Paiement**

#### **Endpoint**
```
POST /api/emails/payment-reminder
```

#### **Description**
Envoie un email de rappel pour le paiement de l'abonnement (partenaires uniquement).

#### **Payload**
```json
{
  "partner_id": "uuid",
  "partner_name": "string",
  "partner_email": "string",
  "business_name": "string",
  "subscription_id": "uuid",
  "plan_name": "string",
  "plan_price": "number",
  "days_remaining": "number",
  "payment_url": "https://bradelivery.com/partner-dashboard/settings/billing",
  "reminder_type": "first" | "second" | "final"
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Rappel de paiement envoyé avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T10:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email de rappel de paiement -->
<h2>💰 Rappel de paiement - Abonnement BraPrime</h2>
<p>Bonjour {{partner_name}},</p>

<p>Nous vous rappelons que votre abonnement BraPrime pour <strong>{{business_name}}</strong> nécessite un paiement.</p>

<h3>Détails de l'abonnement :</h3>
<ul>
  <li><strong>Plan :</strong> {{plan_name}}</li>
  <li><strong>Montant :</strong> {{plan_price}} FG</li>
  <li><strong>Jours restants :</strong> {{days_remaining}}</li>
</ul>

{{#if reminder_type === 'final'}}
<p><strong>⚠️ Attention :</strong> Ceci est votre dernier rappel. Votre compte sera suspendu si le paiement n'est pas effectué.</p>
{{/if}}

<a href="{{payment_url}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
  Effectuer le paiement
</a>

<p>Merci de votre confiance.</p>
```

---

### **6. Route d'Envoi d'Email de Réinitialisation de Mot de Passe**

#### **Endpoint**
```
POST /api/emails/password-reset
```

#### **Description**
Envoie un email de réinitialisation de mot de passe pour tous les types d'utilisateurs.

#### **Payload**
```json
{
  "user_email": "string",
  "user_name": "string",
  "user_type": "customer" | "partner" | "driver" | "admin",
  "reset_token": "string",
  "reset_url": "https://bradelivery.com/reset-password?token={{reset_token}}",
  "expires_at": "2024-01-15T18:30:00Z"
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Email de réinitialisation envoyé avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T10:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email de réinitialisation de mot de passe -->
<h2>🔐 Réinitialisation de votre mot de passe</h2>
<p>Bonjour {{user_name}},</p>

<p>Vous avez demandé la réinitialisation de votre mot de passe BraPrime.</p>

<h3>Pour réinitialiser votre mot de passe :</h3>
<ol>
  <li>Cliquez sur le bouton ci-dessous</li>
  <li>Créez un nouveau mot de passe sécurisé</li>
  <li>Confirmez le changement</li>
</ol>

<a href="{{reset_url}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
  Réinitialiser mon mot de passe
</a>

<p><strong>⚠️ Important :</strong></p>
<ul>
  <li>Ce lien expire le {{expires_at}}</li>
  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
  <li>Votre mot de passe actuel reste valide jusqu'à la réinitialisation</li>
</ul>

<p>Merci de votre confiance.</p>
```

---

### **7. Route d'Envoi d'Email de Confirmation de Commande**

#### **Endpoint**
```
POST /api/emails/order-confirmation
```

#### **Description**
Envoie un email de confirmation après la création d'une commande.

#### **Payload**
```json
{
  "order_id": "uuid",
  "user_name": "string",
  "user_email": "string",
  "business_name": "string",
  "business_address": "string",
  "order_items": [
    {
      "name": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "subtotal": "number",
  "delivery_fee": "number",
  "tax": "number",
  "total": "number",
  "delivery_address": "string",
  "estimated_delivery": "string",
  "order_number": "string",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Email de confirmation de commande envoyé avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T10:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email de confirmation de commande -->
<h2>✅ Commande confirmée - BraPrime</h2>
<p>Bonjour {{user_name}},</p>

<p>Votre commande a été confirmée et est en cours de préparation.</p>

<h3>Détails de votre commande :</h3>
<ul>
  <li><strong>Numéro de commande :</strong> {{order_number}}</li>
  <li><strong>Commerce :</strong> {{business_name}}</li>
  <li><strong>Adresse de livraison :</strong> {{delivery_address}}</li>
  <li><strong>Livraison estimée :</strong> {{estimated_delivery}}</li>
</ul>

<h3>Articles commandés :</h3>
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Article</th>
      <th style="padding: 8px; text-align: center; border: 1px solid #d1d5db;">Quantité</th>
      <th style="padding: 8px; text-align: right; border: 1px solid #d1d5db;">Prix</th>
    </tr>
  </thead>
  <tbody>
    {{#each order_items}}
    <tr>
      <td style="padding: 8px; border: 1px solid #d1d5db;">{{name}}</td>
      <td style="padding: 8px; text-align: center; border: 1px solid #d1d5db;">{{quantity}}</td>
      <td style="padding: 8px; text-align: right; border: 1px solid #d1d5db;">{{price}} FG</td>
    </tr>
    {{/each}}
  </tbody>
</table>

<h3>Récapitulatif :</h3>
<ul>
  <li><strong>Sous-total :</strong> {{subtotal}} FG</li>
  <li><strong>Frais de livraison :</strong> {{delivery_fee}} FG</li>
  <li><strong>Taxes :</strong> {{tax}} FG</li>
  <li><strong>Total :</strong> <strong>{{total}} FG</strong></li>
</ul>

<a href="https://bradelivery.com/order-tracking/{{order_id}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
  Suivre ma commande
</a>

<p>Merci de votre confiance !</p>
```

---

### **8. Route d'Envoi d'Email de Mise à Jour de Statut de Commande**

#### **Endpoint**
```
POST /api/emails/order-status-update
```

#### **Description**
Envoie un email de mise à jour quand le statut d'une commande change.

#### **Payload**
```json
{
  "order_id": "uuid",
  "user_name": "string",
  "user_email": "string",
  "business_name": "string",
  "order_number": "string",
  "old_status": "string",
  "new_status": "string",
  "status_label": "string",
  "estimated_delivery": "string",
  "driver_name": "string", // Optionnel
  "driver_phone": "string", // Optionnel
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Email de mise à jour de statut envoyé avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T10:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email de mise à jour de statut -->
<h2>📦 Mise à jour de votre commande</h2>
<p>Bonjour {{user_name}},</p>

<p>Le statut de votre commande <strong>#{{order_number}}</strong> a été mis à jour.</p>

<h3>Nouveau statut : {{status_label}}</h3>

{{#if new_status === 'preparing'}}
<p>Votre commande est en cours de préparation chez <strong>{{business_name}}</strong>.</p>
{{/if}}

{{#if new_status === 'ready'}}
<p>Votre commande est prête et sera bientôt en route vers vous !</p>
{{/if}}

{{#if new_status === 'out_for_delivery'}}
<p>Votre commande est en cours de livraison !</p>
{{#if driver_name}}
<p>Livreur : <strong>{{driver_name}}</strong> ({{driver_phone}})</p>
{{/if}}
{{/if}}

{{#if new_status === 'delivered'}}
<p>Votre commande a été livrée ! Bon appétit ! 🍽️</p>
{{/if}}

{{#if estimated_delivery}}
<p><strong>Livraison estimée :</strong> {{estimated_delivery}}</p>
{{/if}}

<a href="https://bradelivery.com/order-tracking/{{order_id}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
  Suivre ma commande
</a>

<p>Merci de votre patience !</p>
```

---

### **9. Route d'Envoi d'Email de Facture d'Abonnement**

#### **Endpoint**
```
POST /api/emails/subscription-invoice
```

#### **Description**
Envoie une facture d'abonnement aux partenaires.

#### **Payload**
```json
{
  "subscription_id": "uuid",
  "partner_name": "string",
  "partner_email": "string",
  "business_name": "string",
  "invoice_number": "string",
  "plan_name": "string",
  "plan_duration": "string",
  "amount": "number",
  "tax_amount": "number",
  "total_amount": "number",
  "due_date": "2024-01-15T00:00:00Z",
  "invoice_url": "https://bradelivery.com/invoices/{{invoice_number}}",
  "payment_methods": [
    {
      "name": "string",
      "instructions": "string"
    }
  ]
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Facture d'abonnement envoyée avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T10:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email de facture d'abonnement -->
<h2>📄 Facture d'abonnement BraPrime</h2>
<p>Bonjour {{partner_name}},</p>

<p>Votre facture d'abonnement pour <strong>{{business_name}}</strong> est disponible.</p>

<h3>Détails de la facture :</h3>
<ul>
  <li><strong>Numéro de facture :</strong> {{invoice_number}}</li>
  <li><strong>Plan :</strong> {{plan_name}}</li>
  <li><strong>Durée :</strong> {{plan_duration}}</li>
  <li><strong>Date d'échéance :</strong> {{due_date}}</li>
</ul>

<h3>Montants :</h3>
<ul>
  <li><strong>Montant HT :</strong> {{amount}} FG</li>
  <li><strong>Taxes :</strong> {{tax_amount}} FG</li>
  <li><strong>Total TTC :</strong> <strong>{{total_amount}} FG</strong></li>
</ul>

<h3>Méthodes de paiement acceptées :</h3>
<ul>
  {{#each payment_methods}}
  <li><strong>{{name}} :</strong> {{instructions}}</li>
  {{/each}}
</ul>

<a href="{{invoice_url}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
  Voir la facture complète
</a>

<p>Merci de votre confiance !</p>
```

---

### **10. Route d'Envoi d'Email de Confirmation de Réservation**

#### **Endpoint**
```
POST /api/emails/reservation-confirmation
```

#### **Description**
Envoie un email de confirmation de réservation.

#### **Payload**
```json
{
  "reservation_id": "uuid",
  "user_name": "string",
  "user_email": "string",
  "business_name": "string",
  "business_address": "string",
  "business_phone": "string",
  "date": "2024-01-20",
  "time": "19:00",
  "guests": "number",
  "special_requests": "string",
  "reservation_url": "https://bradelivery.com/reservations/{{reservation_id}}",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Email de confirmation de réservation envoyé avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T10:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email de confirmation de réservation -->
<h2>🍽️ Réservation confirmée - BraPrime</h2>
<p>Bonjour {{user_name}},</p>

<p>Votre réservation a été confirmée !</p>

<h3>Détails de votre réservation :</h3>
<ul>
  <li><strong>Restaurant :</strong> {{business_name}}</li>
  <li><strong>Adresse :</strong> {{business_address}}</li>
  <li><strong>Téléphone :</strong> {{business_phone}}</li>
  <li><strong>Date :</strong> {{date}}</li>
  <li><strong>Heure :</strong> {{time}}</li>
  <li><strong>Nombre de personnes :</strong> {{guests}}</li>
</ul>

{{#if special_requests}}
<h3>Demandes spéciales :</h3>
<p>{{special_requests}}</p>
{{/if}}

<a href="{{reservation_url}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
  Voir ma réservation
</a>

<p>Nous vous souhaitons un excellent repas !</p>
```

---

### **11. Route d'Envoi d'Email de Notification Système**

#### **Endpoint**
```
POST /api/emails/system-notification
```

#### **Description**
Envoie des notifications système importantes (maintenance, nouvelles fonctionnalités, etc.).

#### **Payload**
```json
{
  "notification_type": "maintenance" | "feature_update" | "security_alert" | "general",
  "user_email": "string",
  "user_name": "string",
  "title": "string",
  "message": "string",
  "priority": "low" | "medium" | "high",
  "action_url": "string",
  "action_text": "string",
  "scheduled_at": "2024-01-15T10:30:00Z"
}
```

#### **Réponse**
```json
{
  "success": true,
  "message": "Notification système envoyée avec succès",
  "email_id": "uuid",
  "sent_at": "2024-01-15T10:30:05Z"
}
```

#### **Template Email**
```html
<!-- Email de notification système -->
<h2>{{title}}</h2>
<p>Bonjour {{user_name}},</p>

<p>{{message}}</p>

{{#if action_url}}
<a href="{{action_url}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
  {{action_text}}
</a>
{{/if}}

<p>Merci de votre compréhension.</p>
```

---

## ⚙️ **Configuration et Implémentation**

### **Variables d'Environnement Requises**
```env
# Configuration Email
EMAIL_SERVICE=sendgrid|mailgun|smtp
EMAIL_API_KEY=your_api_key
EMAIL_FROM=noreply@bradelivery.com
EMAIL_FROM_NAME=BraPrime

# Configuration Admin
ADMIN_EMAILS=admin@bradelivery.com,manager@bradelivery.com
SUPPORT_EMAIL=support@bradelivery.com
SUPPORT_PHONE=+224 621 00 00 00

# URLs
FRONTEND_URL=https://bradelivery.com
ADMIN_DASHBOARD_URL=https://bradelivery.com/admin-dashboard
```

### **Structure de Base de Données pour les Emails**
```sql
-- Table pour tracer les emails envoyés
CREATE TABLE email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type VARCHAR(50) NOT NULL, -- 'confirmation', 'admin_notification', 'approval', 'rejection', 'account_credentials', 'payment_reminder', 'password_reset', 'order_confirmation', 'order_status_update', 'subscription_invoice', 'reservation_confirmation', 'system_notification'
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(100),
  request_id uuid REFERENCES requests(id),
  order_id uuid REFERENCES orders(id),
  subscription_id uuid REFERENCES partner_subscriptions(id),
  reservation_id uuid REFERENCES reservations(id),
  email_data JSONB NOT NULL,
  template_used VARCHAR(100),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Index pour les performances
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_request ON email_logs(request_id);
CREATE INDEX idx_email_logs_order ON email_logs(order_id);
CREATE INDEX idx_email_logs_subscription ON email_logs(subscription_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
```

### **Gestion des Erreurs**
```json
{
  "error": {
    "code": "EMAIL_SEND_FAILED",
    "message": "Impossible d'envoyer l'email",
    "details": {
      "recipient": "user@example.com",
      "reason": "Invalid email address",
      "service": "sendgrid"
    }
  }
}
```

---

## 🔗 **Intégration avec le Frontend**

### **Hook pour l'Envoi d'Emails**
```typescript
// src/hooks/use-email-service.ts
export const useEmailService = () => {
  const sendRequestConfirmation = async (requestData: any) => {
    const response = await fetch('/api/emails/request-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de l\'email de confirmation');
    }
    
    return response.json();
  };

  const sendAdminNotification = async (requestData: any) => {
    const response = await fetch('/api/emails/admin-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de la notification admin');
    }
    
    return response.json();
  };

  const sendPasswordReset = async (emailData: any) => {
    const response = await fetch('/api/emails/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
    
    return response.json();
  };

  const sendOrderConfirmation = async (orderData: any) => {
    const response = await fetch('/api/emails/order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de l\'email de confirmation de commande');
    }
    
    return response.json();
  };

  const sendAccountCredentials = async (credentialsData: any) => {
    const response = await fetch('/api/emails/account-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentialsData)
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de l\'email avec identifiants');
    }
    
    return response.json();
  };

  return {
    sendRequestConfirmation,
    sendAdminNotification,
    sendPasswordReset,
    sendOrderConfirmation,
    sendAccountCredentials
  };
};
```

### **Intégration dans les Services**
```typescript
// Modification de src/lib/services/partner-registration.ts
const createRequest = async (data: CreateRequestData) => {
  // ... validation existante ...

  try {
    // 1. Créer la demande
    const { error } = await supabase
      .from('requests')
      .insert({
        // ... données existantes ...
      });

    if (error) throw error;

    // 2. Envoyer email de confirmation au demandeur
    await sendRequestConfirmation({
      request_id: result.data.id,
      ...data
    });

    // 3. Envoyer notification aux admins
    await sendAdminNotification({
      request_id: result.data.id,
      ...data
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    throw error;
  }
};

// Modification de src/lib/services/orders.ts
const createOrder = async (orderData: CreateOrderData) => {
  try {
    // ... création de commande existante ...

    // Envoyer email de confirmation
    await sendOrderConfirmation({
      order_id: data.id,
      ...orderData
    });

    return { order: data, error: null };
  } catch (error) {
    // ... gestion d'erreur ...
  }
};

// Modification de src/lib/services/admin-account-creation.ts
const createUserAccount = async (data: CreateAccountData) => {
  try {
    // ... création du compte existante ...

    // Envoyer email avec identifiants
    await sendAccountCredentials({
      account_type: data.role,
      user_name: data.name,
      user_email: data.email,
      login_email: data.email,
      login_password: data.password,
      business_name: businessData?.name,
      business_id: businessData?.id,
      selected_plan_name: requestData?.metadata?.selected_plan_name,
      selected_plan_price: requestData?.metadata?.selected_plan_price,
      dashboard_url: data.role === 'partner' ? 'https://bradelivery.com/partner-dashboard' : 'https://bradelivery.com/driver-dashboard',
      account_created_at: new Date().toISOString(),
      created_by: 'admin@bradelivery.com',
      support_email: 'support@bradelivery.com',
      support_phone: '+224 621 00 00 00'
    });

    return { success: true, userId: authData.user.id };
  } catch (error) {
    // ... gestion d'erreur ...
  }
};
```

---

## 📊 **Monitoring et Analytics**

### **Métriques à Tracker**
- Nombre d'emails envoyés par type
- Taux de livraison des emails
- Taux d'ouverture des emails
- Taux de clic sur les liens
- Temps de réponse après envoi d'email

### **Logs de Debug**
```json
{
  "timestamp": "2024-01-15T10:30:05Z",
  "level": "info",
  "service": "email-service",
  "action": "send_request_confirmation",
  "request_id": "uuid",
  "recipient": "user@example.com",
  "template": "request_confirmation",
  "status": "sent",
  "email_id": "uuid"
}
```

---

## ✅ **Tests Recommandés**

### **Tests Unitaires**
- Validation des payloads
- Génération des templates
- Gestion des erreurs

### **Tests d'Intégration**
- Envoi d'emails de test
- Vérification de la livraison
- Test des templates HTML

### **Tests End-to-End**
- Parcours complet de demande
- Vérification des emails reçus
- Test des liens dans les emails

---

## 🚀 **Exemples d'Implémentation**

### **Node.js avec Express**
```javascript
// routes/emails.js
const express = require('express');
const router = express.Router();
const emailService = require('../services/email-service');

router.post('/request-confirmation', async (req, res) => {
  try {
    const result = await emailService.sendRequestConfirmation(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: error.message
      }
    });
  }
});

router.post('/password-reset', async (req, res) => {
  try {
    const result = await emailService.sendPasswordReset(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: error.message
      }
    });
  }
});

router.post('/account-credentials', async (req, res) => {
  try {
    const result = await emailService.sendAccountCredentials(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: error.message
      }
    });
  }
});

module.exports = router;
```

### **Python avec FastAPI**
```python
# routes/emails.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.email_service import EmailService

router = APIRouter()

class RequestConfirmationData(BaseModel):
    request_id: str
    request_type: str
    user_name: str
    user_email: str
    # ... autres champs

class PasswordResetData(BaseModel):
    user_email: str
    user_name: str
    user_type: str
    reset_token: str
    reset_url: str
    expires_at: str

@router.post("/request-confirmation")
async def send_request_confirmation(data: RequestConfirmationData):
    try:
        result = await EmailService.send_request_confirmation(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/password-reset")
async def send_password_reset(data: PasswordResetData):
    try:
        result = await EmailService.send_password_reset(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

Cette documentation fournit une base complète pour implémenter le système d'emails dans votre backend. Les routes sont conçues pour être flexibles et s'adapter à différents services d'email (SendGrid, Mailgun, SMTP, etc.). 🚀 