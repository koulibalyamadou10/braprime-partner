# Configuration du Storage Supabase pour BraPrime

## Problème
Si vous ne pouvez pas uploader des fichiers, c'est probablement parce que les buckets de storage ne sont pas configurés dans votre projet Supabase.

## Solution

### 1. Exécuter les scripts de configuration

1. Allez dans votre dashboard Supabase
2. Ouvrez l'éditeur SQL
3. Exécutez les scripts dans l'ordre suivant :

#### a) Configuration du bucket avatars (images de profil utilisateurs)
```sql
-- Copiez et exécutez le contenu du fichier scripts/setup-storage.sql
```

#### b) Configuration du bucket business-images (images des restaurants)
```sql
-- Copiez et exécutez le contenu du fichier scripts/setup-business-storage.sql
```

### 2. Vérifier la configuration

Après avoir exécuté les scripts, vous pouvez vérifier que tout fonctionne en exécutant les scripts de test :

```sql
-- Test du bucket avatars
-- Copiez et exécutez le contenu du fichier scripts/test-storage.sql

-- Test du bucket business-images  
-- Copiez et exécutez le contenu du fichier scripts/test-business-storage.sql
```

### 3. Configuration manuelle (alternative)

Si les scripts ne fonctionnent pas, vous pouvez configurer manuellement :

#### Créer le bucket avatars
1. Allez dans **Storage** dans votre dashboard Supabase
2. Cliquez sur **New bucket**
3. Nom : `avatars`
4. Public bucket : ✅ Activé
5. File size limit : `5MB`
6. Allowed MIME types : `image/jpeg, image/png, image/gif, image/webp`

#### Créer le bucket business-images
1. Allez dans **Storage** dans votre dashboard Supabase
2. Cliquez sur **New bucket**
3. Nom : `business-images`
4. Public bucket : ✅ Activé
5. File size limit : `10MB`
6. Allowed MIME types : `image/jpeg, image/png, image/gif, image/webp`

#### Configurer les politiques RLS pour avatars
1. Allez dans **Storage** > **Policies**
2. Ajoutez les politiques suivantes pour le bucket `avatars` :

**Politique d'insertion :**
```sql
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'profile-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );
```

**Politique de sélection :**
```sql
CREATE POLICY "Anyone can view public avatars" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars'
  );
```

**Politique de mise à jour :**
```sql
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'profile-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );
```

**Politique de suppression :**
```sql
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'profile-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );
```

#### Configurer les politiques RLS pour business-images
1. Allez dans **Storage** > **Policies**
2. Ajoutez les politiques suivantes pour le bucket `business-images` :

**Politique d'insertion :**
```sql
CREATE POLICY "Partners can upload their own business images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'business-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );
```

**Politique de sélection :**
```sql
CREATE POLICY "Anyone can view public business images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'business-images'
  );
```

**Politique de mise à jour :**
```sql
CREATE POLICY "Partners can update their own business images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'business-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'business-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );
```

**Politique de suppression :**
```sql
CREATE POLICY "Partners can delete their own business images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'business-images' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );
```

### 4. Vérification

Après la configuration, vous devriez voir :
- Un bucket `avatars` dans la section Storage
- Un bucket `business-images` dans la section Storage
- Des politiques RLS configurées pour les deux buckets
- La possibilité d'uploader des images depuis l'interface utilisateur

### 5. Dépannage

Si vous avez encore des problèmes :

1. **Vérifiez les logs** : Ouvrez la console du navigateur et regardez les logs lors de l'upload
2. **Vérifiez l'authentification** : Assurez-vous d'être connecté
3. **Vérifiez les permissions** : Assurez-vous que les politiques RLS sont correctement configurées
4. **Vérifiez la taille du fichier** : Les fichiers ne doivent pas dépasser les limites définies
5. **Vérifiez le nom du bucket** : Assurez-vous que le code utilise le bon nom de bucket

### 6. Logs de débogage

Le code a été amélioré avec des logs détaillés. Regardez la console du navigateur pour voir :
- ✅ Utilisateur authentifié
- ✅ Bucket trouvé
- ✅ Fichier uploadé avec succès
- ❌ Erreurs spécifiques

### 7. Erreurs courantes

- **"Bucket not found"** : Le bucket n'existe pas, exécutez le script de configuration
- **"Permission denied"** : Les politiques RLS ne sont pas configurées
- **"File too large"** : Le fichier dépasse la limite de taille
- **"Invalid MIME type"** : Le type de fichier n'est pas autorisé 