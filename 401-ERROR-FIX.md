# 🔐 Guide de Dépannage - Erreur 401 (Unauthorized)

## 🚨 **Problème Identifié**

Vous rencontrez cette erreur :
```
POST https://jeumizxzlwjvgerrcpjr.supabase.co/rest/v1/orders?select=* 401 (Unauthorized)
```

## ✅ **Solutions Appliquées**

### 1. **Vérification d'Authentification Renforcée**
```typescript
// ✅ AVANT (problématique)
enabled: !!currentUser?.id && currentUser.role === 'partner'

// ✅ APRÈS (corrigé)
enabled: !!currentUser?.id && currentUser.role === 'partner' && isAuthenticated
```

### 2. **Gestion Intelligente des Erreurs 401**
```typescript
// ✅ Ne pas retry en cas d'erreur 401
retry: (failureCount, error) => {
  if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
    return false // Pas de retry pour les erreurs d'authentification
  }
  return failureCount < 3
}
```

### 3. **Vérification d'Accès dans les Dashboards**
```typescript
// ✅ Vérification avant affichage des données
if (!isAuthenticated) {
  return <AuthentificationRequise />
}

if (currentUser?.role !== 'partner') {
  return <AccesRestreint />
}
```

## 🔧 **Vérifications à Faire**

### 1. **Variables d'Environnement**
Vérifiez que `.env.local` contient :
```env
VITE_SUPABASE_URL=https://jeumizxzlwjvgerrcpjr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **État d'Authentification**
- ✅ L'utilisateur est-il connecté ?
- ✅ La session Supabase est-elle valide ?
- ✅ Le rôle utilisateur est-il correct ?

### 3. **Politiques RLS (Row Level Security)**
Vérifiez dans Supabase que les politiques sont correctes :
```sql
-- Politique pour les commandes
CREATE POLICY "Users can view their own orders" ON orders 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Partners can view orders for their restaurants" ON orders 
FOR SELECT USING (
  restaurant_id IN (SELECT id FROM restaurants WHERE partner_id = auth.uid())
);
```

## 🧪 **Tests de Fonctionnement**

### 1. **Test d'Authentification**
```typescript
// Dans la console du navigateur
const { data: { user } } = await supabase.auth.getUser()
console.log('Utilisateur connecté:', user)
```

### 2. **Test de Session**
```typescript
// Vérifier la session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session active:', !!session)
```

### 3. **Test d'Accès aux Données**
```typescript
// Test simple d'accès aux commandes
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .limit(1)

console.log('Erreur:', error)
console.log('Données:', data)
```

## 🚀 **Corrections Implémentées**

### 1. **Hooks React Query Améliorés**
- ✅ Vérification d'authentification avant activation
- ✅ Gestion des erreurs 401 sans retry
- ✅ Retour des informations d'authentification

### 2. **Dashboards Sécurisés**
- ✅ Vérification d'authentification
- ✅ Vérification du rôle utilisateur
- ✅ Messages d'erreur appropriés

### 3. **Gestion d'Erreurs Robuste**
- ✅ Détection des erreurs 401
- ✅ Messages utilisateur clairs
- ✅ Redirection vers la connexion

## 📋 **Checklist de Résolution**

### ✅ **Étapes à Suivre**

1. **Vérifiez l'authentification** :
   - Connectez-vous à l'application
   - Vérifiez que la session est active

2. **Testez les dashboards** :
   - Accédez au dashboard partenaire (si partenaire)
   - Accédez au dashboard client (si client)

3. **Vérifiez les données** :
   - Les statistiques s'affichent-elles ?
   - Les commandes récentes apparaissent-elles ?

4. **Testez les mises à jour** :
   - Cliquez sur "Rafraîchir"
   - Vérifiez que les données se mettent à jour

### ❌ **Si l'erreur persiste**

1. **Déconnectez-vous et reconnectez-vous**
2. **Videz le cache du navigateur**
3. **Vérifiez les variables d'environnement**
4. **Consultez les logs Supabase**

## 🔍 **Debugging Avancé**

### 1. **Logs de Debug**
```typescript
// Ajoutez ces logs pour déboguer
console.log('État authentification:', isAuthenticated)
console.log('Utilisateur actuel:', currentUser)
console.log('Rôle utilisateur:', currentUser?.role)
```

### 2. **Vérification des Requêtes**
Dans les outils de développement du navigateur :
- Onglet **Network**
- Filtrez par **XHR/Fetch**
- Vérifiez les requêtes vers Supabase

### 3. **Console Supabase**
- Allez sur https://jeumizxzlwjvgerrcpjr.supabase.co
- Naviguez vers **Logs**
- Vérifiez les erreurs d'authentification

## 🎯 **Résultat Attendu**

Après les corrections :
- ✅ **Plus d'erreurs 401** dans la console
- ✅ **Dashboards fonctionnels** avec données réelles
- ✅ **Authentification sécurisée** et vérifiée
- ✅ **Messages d'erreur clairs** si problème

## 🚀 **Prochaines Étapes**

1. **Testez l'application** avec un utilisateur connecté
2. **Vérifiez les dashboards** partenaire et client
3. **Testez les fonctionnalités** dynamiques
4. **Surveillez les logs** pour d'autres erreurs

---

**💡 Conseil :** L'erreur 401 est maintenant gérée gracieusement avec des messages clairs pour l'utilisateur ! 