# 🔐 Guide de Dépannage - Authentification Supabase

## 🚨 **Erreurs Courantes d'Authentification**

### **1. Erreur 429 (Too Many Requests)**
```
POST https://jeumizxzlwjvgerrcpjr.supabase.co/auth/v1/signup 429 (Too Many Requests)
```

**Cause :** Trop de tentatives d'inscription/connexion en peu de temps

**Solutions :**
- ⏰ **Attendez 1-2 minutes** avant de réessayer
- 🔄 **Utilisez un autre navigateur** ou mode incognito
- 🕐 **Attendez 15-30 minutes** pour que les limites se réinitialisent

### **2. Erreur 401 (Unauthorized)**
```
POST https://jeumizxzlwjvgerrcpjr.supabase.co/rest/v1/users?select=* 401 (Unauthorized)
```

**Cause :** Tentative d'accès à la table `users` sans authentification valide

**Solutions :**
- ✅ **Vérifiez que l'utilisateur est connecté**
- 🔑 **Vérifiez les variables d'environnement**
- 🗄️ **Vérifiez que la base de données est initialisée**

### **3. Erreur 403 (Forbidden)**
```
DELETE https://jeumizxzlwjvgerrcpjr.supabase.co/auth/v1/admin/users/... 403 (Forbidden)
```

**Cause :** Utilisation de l'API admin sans privilèges

**Solutions :**
- ❌ **Ne pas utiliser l'API admin** côté client
- 🔧 **Utiliser les triggers automatiques** pour créer les profils
- 📝 **Gérer les erreurs** sans supprimer les utilisateurs

## ✅ **Corrections Apportées**

### **1. Suppression de l'API Admin**
```typescript
// ❌ AVANT (problématique)
await supabase.auth.admin.deleteUser(authData.user.id)

// ✅ APRÈS (corrigé)
// Le profil sera créé automatiquement par le trigger
```

### **2. Gestion des Erreurs Améliorée**
```typescript
// ✅ Gestion robuste des erreurs
if (profileError) {
  console.warn('Profil utilisateur non trouvé:', profileError.message)
  // Fallback vers les données de session
  return { user: fallbackUser, error: null }
}
```

### **3. Utilisation des Métadonnées**
```typescript
// ✅ Stockage des données dans les métadonnées
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: userData.email,
  password: userData.password,
  options: {
    data: {
      name: userData.name,
      role: userData.role,
      phone_number: userData.phone_number,
      address: userData.address,
    }
  }
})
```

## 🔧 **Configuration Requise**

### **1. Variables d'Environnement**
Vérifiez que `.env.local` contient :
```env
VITE_SUPABASE_URL=https://jeumizxzlwjvgerrcpjr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Configuration Supabase**
Dans le dashboard Supabase :
- ✅ **Authentication > Settings** : URL configurée
- ✅ **Database > Tables** : Table `users` créée
- ✅ **Database > Policies** : RLS configuré
- ✅ **Database > Functions** : Trigger `handle_new_user` créé

### **3. Base de Données**
Exécutez le schéma corrigé :
```bash
# Utilisez le fichier supabase-schema-fixed.sql
# Il inclut le trigger pour créer automatiquement les profils
```

## 🧪 **Tests de Fonctionnement**

### **1. Test d'Inscription**
```typescript
// Test simple d'inscription
const result = await AuthService.signup({
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'customer'
})

console.log('Résultat:', result)
```

### **2. Test de Connexion**
```typescript
// Test de connexion
const result = await AuthService.login('test@example.com', 'password123')
console.log('Utilisateur connecté:', result.user)
```

### **3. Test de Récupération**
```typescript
// Test de récupération de l'utilisateur actuel
const result = await AuthService.getCurrentUser()
console.log('Utilisateur actuel:', result.user)
```

## 🚀 **Bonnes Pratiques**

### **1. Gestion des Erreurs**
```typescript
// ✅ Toujours gérer les erreurs
try {
  const result = await AuthService.signup(userData)
  if (result.error) {
    console.error('Erreur:', result.error)
    // Afficher un message à l'utilisateur
  }
} catch (error) {
  console.error('Erreur inattendue:', error)
}
```

### **2. Validation des Données**
```typescript
// ✅ Valider les données avant envoi
if (!email || !password || !name) {
  return { user: null, error: 'Tous les champs sont requis' }
}
```

### **3. Logs de Débogage**
```typescript
// ✅ Ajouter des logs pour le débogage
console.log('Tentative d\'inscription:', { email, name })
console.log('Résultat:', result)
```

## 📞 **Support**

Si les problèmes persistent :

1. **Vérifiez les logs** dans la console du navigateur
2. **Consultez les logs** dans le dashboard Supabase
3. **Testez avec des données minimales**
4. **Vérifiez la configuration** de l'authentification

## 🎯 **Prochaines Étapes**

Une fois l'authentification fonctionnelle :

1. **Testez l'inscription** avec différents rôles
2. **Testez la connexion/déconnexion**
3. **Vérifiez la persistance** de la session
4. **Testez la mise à jour** du profil

---

**💡 Conseil** : Les erreurs 429 sont normales lors du développement. Attendez quelques minutes entre les tests pour éviter les limites de taux. 