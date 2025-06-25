# Guide de Gestion des Adresses - BraPrime

## Vue d'ensemble

La gestion des adresses utilisateur a été déplacée vers une page dédiée accessible via `/dashboard/addresses`. Cette page permet aux utilisateurs de gérer complètement leurs adresses de livraison.

## Fonctionnalités

### ✅ Fonctionnalités disponibles

1. **Affichage des adresses**
   - Liste de toutes les adresses de l'utilisateur
   - Indication de l'adresse par défaut
   - Affichage des informations complètes (rue, ville, région, etc.)

2. **Ajout d'adresse**
   - Formulaire complet avec validation
   - Champs : libellé, rue, ville, région, code postal, pays
   - Option pour définir comme adresse par défaut

3. **Modification d'adresse**
   - Édition de toutes les informations
   - Possibilité de changer l'adresse par défaut

4. **Suppression d'adresse**
   - Suppression sécurisée avec confirmation
   - Protection de l'adresse par défaut

5. **Gestion de l'adresse par défaut**
   - Une seule adresse peut être par défaut à la fois
   - Changement automatique lors de la définition d'une nouvelle adresse par défaut

### 🎨 Interface utilisateur

- **Design moderne** avec des cartes pour chaque adresse
- **Icônes distinctives** pour les adresses par défaut vs autres
- **Badges** pour identifier le pays et l'adresse par défaut
- **Boutons d'action** clairs (éditer, supprimer, définir par défaut)
- **États de chargement** et messages d'erreur

## Navigation

### Accès à la page
1. Connectez-vous à votre compte
2. Allez dans le tableau de bord utilisateur (`/dashboard`)
3. Cliquez sur "Adresses" dans le menu de navigation

### Structure de navigation
```
Dashboard
├── Tableau de bord
├── Commandes
├── Réservations
├── Profil
├── **Adresses** ← Page dédiée
├── Moyens de paiement
└── Notifications
```

## Configuration de la base de données

### Scripts SQL nécessaires

1. **Configuration RLS** : `scripts/fix-user-addresses-rls.sql`
   - Active RLS sur la table `user_addresses`
   - Crée les politiques de sécurité
   - Configure les triggers pour la gestion automatique

2. **Test de vérification** : `scripts/test-user-addresses.sql`
   - Vérifie la structure de la table
   - Teste les politiques RLS
   - Valide les triggers et index

### Structure de la table

```sql
CREATE TABLE user_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    country TEXT DEFAULT 'Guinée',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Utilisation

### Ajouter une nouvelle adresse

1. Cliquez sur le bouton "Ajouter une adresse"
2. Remplissez le formulaire :
   - **Libellé** : Nom pour identifier l'adresse (ex: "Domicile", "Bureau")
   - **Rue** : Numéro et nom de rue
   - **Ville** : Nom de la ville
   - **Région** : Nom de la région/quartier
   - **Code postal** : Code postal (optionnel)
   - **Pays** : Pays (par défaut "Guinée")
   - **Adresse par défaut** : Cochez si c'est votre adresse principale
3. Cliquez sur "Créer l'adresse"

### Modifier une adresse existante

1. Cliquez sur l'icône "Éditer" (crayon) à côté de l'adresse
2. Modifiez les informations souhaitées
3. Cliquez sur "Mettre à jour"

### Définir une adresse par défaut

1. Cliquez sur "Définir par défaut" à côté de l'adresse souhaitée
2. L'adresse sera automatiquement définie comme adresse par défaut
3. Les autres adresses ne seront plus par défaut

### Supprimer une adresse

1. Cliquez sur l'icône "Supprimer" (poubelle) à côté de l'adresse
2. Confirmez la suppression
3. L'adresse sera supprimée définitivement

## Sécurité et permissions

### Politiques RLS (Row Level Security)

- **Lecture** : Les utilisateurs ne peuvent voir que leurs propres adresses
- **Création** : Les utilisateurs peuvent créer des adresses pour leur compte
- **Modification** : Les utilisateurs peuvent modifier leurs propres adresses
- **Suppression** : Les utilisateurs peuvent supprimer leurs propres adresses

### Validation des données

- **Libellé** : Minimum 2 caractères
- **Rue** : Minimum 5 caractères
- **Ville** : Minimum 2 caractères
- **Région** : Minimum 2 caractères
- **Code postal** : Optionnel
- **Pays** : Par défaut "Guinée"

## Gestion des erreurs

### Messages d'erreur courants

1. **Erreur de chargement** : Problème de connexion à la base de données
2. **Erreur de validation** : Données du formulaire invalides
3. **Erreur de permission** : Problème avec les politiques RLS
4. **Erreur de réseau** : Problème de connexion internet

### Dépannage

1. **Vérifiez votre connexion internet**
2. **Rafraîchissez la page**
3. **Vérifiez que vous êtes connecté**
4. **Contactez le support si le problème persiste**

## Intégration avec le reste de l'application

### Utilisation dans les commandes

Les adresses sont automatiquement disponibles lors du processus de commande :
- Sélection de l'adresse de livraison
- Adresse par défaut pré-sélectionnée
- Possibilité de changer l'adresse au moment de la commande

### Synchronisation

- Les modifications sont immédiatement synchronisées
- Pas besoin de rafraîchir la page
- Les changements sont visibles dans toute l'application

## Support et maintenance

### Mise à jour de la base de données

Si vous devez mettre à jour la structure de la table :

1. Exécutez le script `fix-user-addresses-rls.sql`
2. Vérifiez avec le script `test-user-addresses.sql`
3. Testez les fonctionnalités dans l'interface

### Logs et monitoring

- Les actions sont loggées dans la base de données
- Les timestamps sont automatiquement mis à jour
- Les erreurs sont capturées et affichées à l'utilisateur

## Conclusion

La page de gestion des adresses offre une expérience utilisateur complète et sécurisée pour gérer les adresses de livraison. Elle s'intègre parfaitement avec le reste de l'application et respecte les standards de sécurité de Supabase. 