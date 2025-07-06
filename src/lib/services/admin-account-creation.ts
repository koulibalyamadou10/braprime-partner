import { supabase } from '@/lib/supabase';

interface CreateAccountData {
  email: string;
  password: string;
  name: string;
  phone_number?: string;
  role: 'partner' | 'driver';
  requestId: string;
}

export class AdminAccountCreationService {
  /**
   * Créer un compte utilisateur après approbation d'une demande
   */
  static async createUserAccount(data: CreateAccountData) {
    try {
      // 1. Créer l'utilisateur dans Supabase Auth (comme les autres services)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role
          }
        }
      });

      if (authError) {
        throw new Error(`Erreur lors de la création du compte auth: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur créé');
      }

      // 2. Récupérer l'ID du rôle dynamiquement
      const roleName = data.role === 'partner' ? 'partner' : 'driver';
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !roleData) {
        throw new Error(`Rôle ${roleName} non trouvé dans la base de données`);
      }

      // 3. Créer le profil utilisateur
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone_number: data.phone_number || null,
          role_id: roleData.id, // Utiliser l'ID récupéré dynamiquement
          is_active: true,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        // Si erreur profil, on ne peut pas supprimer l'utilisateur auth directement
        // L'utilisateur devra être supprimé manuellement par l'admin si nécessaire
        console.error('Erreur lors de la création du profil:', profileError);
        throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
      }

      // 4. Si c'est un partenaire, créer le profil business
      if (data.role === 'partner') {
        const { error: businessError } = await supabase
          .from('businesses')
          .insert({
            name: data.name, // Nom temporaire, sera mis à jour
            description: 'Commerce créé via demande approuvée',
            address: 'Adresse à compléter',
            phone: data.phone_number || null,
            email: data.email,
            owner_id: authData.user.id,
            is_active: true,
            is_open: true,
            delivery_time: '30-45 min',
            delivery_fee: 5000,
            rating: 0,
            review_count: 0
          });

        if (businessError) {
          console.error('Erreur lors de la création du business:', businessError);
          // Ne pas faire échouer la création du compte pour cette erreur
        }
      }

      // 5. Si c'est un chauffeur, créer le profil driver (comme les autres services)
      if (data.role === 'driver') {
        const { error: driverError } = await supabase
          .from('drivers')
          .insert({
            id: authData.user.id, // Utiliser l'ID du compte auth comme ID du driver
            name: data.name,
            phone: data.phone_number || '',
            email: data.email,
            is_active: true,
            is_verified: true,
            total_deliveries: 0,
            total_earnings: 0,
            rating: 0,
            active_sessions: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (driverError) {
          console.error('Erreur lors de la création du profil chauffeur:', driverError);
          // Ne pas faire échouer la création du compte pour cette erreur
        }
      }

      // 6. Marquer la demande comme traitée (optionnel)
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          admin_notes: `Compte créé le ${new Date().toLocaleDateString('fr-FR')}. Email: ${data.email}. Mot de passe généré automatiquement.`,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.requestId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de la demande:', updateError);
      }

      return {
        success: true,
        userId: authData.user.id,
        email: data.email
      };

    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email avec les informations de connexion
   */
  static async sendLoginCredentials(email: string, password: string, name: string, role: string) {
    try {
      // Ici, vous pouvez intégrer votre service d'email
      // Pour l'instant, on simule l'envoi
      console.log('Email à envoyer:', {
        to: email,
        subject: 'Vos accès BraPrime',
        body: `
          Bonjour ${name},
          
          Votre demande de ${role === 'partner' ? 'partenariat' : 'chauffeur'} a été approuvée !
          
          Voici vos informations de connexion :
          Email: ${email}
          Mot de passe: ${password}
          
          Connectez-vous sur : https://bradelivery.com/login
          
          Cordialement,
          L'équipe BraPrime
        `
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un email existe déjà
   */
  static async checkEmailExists(email: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      return false;
    }
  }

  /**
   * Connecter automatiquement l'utilisateur après création du compte
   */
  static async autoLoginUser(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(`Erreur lors de la connexion automatique: ${error.message}`);
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Erreur lors de la connexion automatique:', error);
      throw error;
    }
  }
}
} 