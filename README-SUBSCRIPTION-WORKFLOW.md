# 🔄 Workflow d'Abonnement Post-Approbation - BraPrime

## 📋 Vue d'ensemble

Ce document décrit le workflow complet pour l'approbation des partenaires et la gestion des abonnements dans BraPrime.

## 🎯 Objectif

Après approbation par l'admin, le partenaire doit choisir et payer un abonnement pour activer son compte et accéder au dashboard partenaire.

## 🔄 Workflow Complet

### **1. Demande Partenaire**
```
Partenaire soumet une demande → Admin reçoit la notification
```

### **2. Approbation Admin**
```
Admin approuve la demande → Business créé (inactif) → Partenaire notifié
```

### **3. Activation Post-Paiement**
```
Partenaire choisit un plan → Paiement → Business activé automatiquement → Accès dashboard
```

## 🛠️ Implémentation Technique

### **Étape 1 : Modification de l'approbation**

**Fichier modifié :** `src/lib/services/admin-requests.ts`

```typescript
// Business créé avec is_active: false
await supabase.from('businesses').insert({
  name: request.business_name,
  business_type_id: this.getBusinessTypeId(request.business_type),
  address: request.business_address,
  owner_id: request.user_id,
  is_active: false, // INACTIF jusqu'au paiement
  requires_subscription: true, // Nécessite un abonnement
  subscription_status: 'pending' // En attente d'abonnement
});
```

### **Étape 2 : Vérification d'accès**

**Fichier créé :** `src/lib/services/subscription.ts`

```typescript
async checkPartnerAccess(businessId: number): Promise<{
  canAccess: boolean;
  reason?: string;
  requiresSubscription?: boolean;
  subscription?: PartnerSubscription | null;
  business?: Record<string, unknown>;
}>
```

### **Étape 3 : Hook de vérification**

**Fichier modifié :** `src/hooks/use-subscription.ts`

```typescript
export const usePartnerAccessCheck = () => {
  // Vérifie si le partenaire a un abonnement actif
  // Retourne les informations d'accès
}
```

### **Étape 4 : Interface utilisateur**

**Fichier modifié :** `src/pages/dashboard/PartnerDashboard.tsx`

```typescript
// Affiche un message si abonnement requis
if (accessCheck && !accessCheck.canAccess && accessCheck.requiresSubscription) {
  return <SubscriptionRequiredMessage />;
}
```

### **Étape 5 : Base de données**

**Scripts créés :**
- `scripts/add-subscription-columns-to-businesses.sql`
- `scripts/activate-business-after-subscription.sql`

## 📊 Structure de la Base de Données

### **Table `businesses` - Nouvelles colonnes**

```sql
ALTER TABLE businesses ADD COLUMN requires_subscription BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'none' 
  CHECK (subscription_status IN ('none', 'pending', 'active', 'expired'));
```

### **Fonctions PostgreSQL créées**

1. **`activate_business_after_subscription(uuid)`**
   - Active le business après paiement réussi
   - Appelée automatiquement par trigger

2. **`trigger_activate_business()`**
   - Trigger qui s'exécute quand un abonnement devient actif
   - Active automatiquement le business associé

3. **`deactivate_business_on_expiry()`**
   - Désactive les businesses avec des abonnements expirés
   - Exécutée périodiquement

4. **`check_subscription_status()`**
   - Vérifie l'état de tous les abonnements
   - Retourne des statistiques

## 🎨 Interface Utilisateur

### **Message d'abonnement requis**

```tsx
<div className="text-center max-w-md">
  <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
  <h3 className="text-xl font-semibold mb-2">Abonnement Requis</h3>
  <p className="text-muted-foreground mb-6">
    Votre compte a été approuvé mais nécessite un abonnement pour être activé.
  </p>
  <Button asChild className="w-full bg-guinea-red hover:bg-guinea-red/90">
    <Link to="/partner-dashboard/settings?tab=billing">
      <CreditCard className="h-4 w-4 mr-2" />
      Choisir un abonnement
    </Link>
  </Button>
</div>
```

## 🔧 Scripts d'Installation

### **1. Ajouter les colonnes à la table businesses**

```bash
# Exécuter le script SQL
psql -d your_database -f scripts/add-subscription-columns-to-businesses.sql
```

### **2. Créer les fonctions d'activation**

```bash
# Exécuter le script SQL
psql -d your_database -f scripts/activate-business-after-subscription.sql
```

## 🧪 Tests

### **Test 1 : Approbation d'un partenaire**

1. Admin approuve une demande partenaire
2. Vérifier que le business est créé avec `is_active: false`
3. Vérifier que `requires_subscription: true`

### **Test 2 : Accès au dashboard**

1. Partenaire se connecte
2. Vérifier que le message d'abonnement requis s'affiche
3. Vérifier que le bouton "Choisir un abonnement" fonctionne

### **Test 3 : Création d'abonnement**

1. Partenaire choisit un plan
2. Partenaire paie l'abonnement
3. Vérifier que le business devient actif automatiquement
4. Vérifier que le dashboard complet s'affiche

## 🚨 Gestion des Erreurs

### **Erreurs possibles**

1. **Business non trouvé**
   - Vérifier que le partenaire a un business associé
   - Vérifier les permissions RLS

2. **Abonnement non trouvé**
   - Vérifier que l'abonnement existe
   - Vérifier les permissions RLS

3. **Erreur d'activation**
   - Vérifier les logs PostgreSQL
   - Vérifier que les fonctions existent

### **Logs de débogage**

```typescript
console.log('🔍 [usePartnerAccessCheck] Diagnostic:', {
  businessId,
  accessCheck,
  canAccess: accessCheck?.canAccess,
  requiresSubscription: accessCheck?.requiresSubscription
});
```

## 📈 Statistiques

### **Fonction de vérification**

```sql
SELECT check_subscription_status();
```

**Retourne :**
```json
{
  "active_subscriptions": 15,
  "expired_subscriptions": 3,
  "pending_subscriptions": 8,
  "checked_at": "2024-01-15T10:30:00Z"
}
```

## 🔄 Workflow Complet Exemple

### **1. Demande soumise**
```
Partenaire: "Restaurant Le Gourmet"
Email: contact@legourmet.gn
Status: pending
```

### **2. Admin approuve**
```
Admin clique "Approuver"
→ Business créé (is_active: false)
→ Partenaire reçoit email
→ Status: approved
```

### **3. Partenaire se connecte**
```
Partenaire va sur /partner-dashboard
→ Message "Abonnement Requis" s'affiche
→ Bouton "Choisir un abonnement"
```

### **4. Partenaire choisit un plan**
```
Partenaire clique "Choisir un abonnement"
→ Modal s'ouvre avec les plans
→ Partenaire sélectionne "Premium"
→ Partenaire paie
```

### **5. Business activé automatiquement**
```
Paiement réussi
→ Trigger s'exécute
→ Business devient actif
→ Dashboard complet s'affiche
```

## 🎯 Prochaines Étapes

1. **Tester le workflow complet**
2. **Ajouter des notifications email**
3. **Créer des rapports d'abonnement**
4. **Ajouter la gestion des renouvellements**
5. **Implémenter les remises et promotions**

---

**Note :** Ce workflow garantit que seuls les partenaires avec un abonnement actif peuvent accéder au dashboard partenaire, assurant ainsi la viabilité économique de la plateforme. 