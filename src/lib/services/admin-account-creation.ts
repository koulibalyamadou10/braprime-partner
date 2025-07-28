import { supabase } from '@/lib/supabase';
import { EmailService } from './email';

export interface CreateAccountData {
  email: string;
  password: string;
  name: string;
  role: 'partner' | 'driver';
  phone_number?: string;
  requestId?: string;
}

export interface CreateAccountResult {
  success: boolean;
  user?: any;
  business?: any;
  credentials?: {
    email: string;
    password: string;
  };
  error?: string;
}

export class AdminAccountCreationService {
  // Vérifier si un email existe déjà
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  // Créer un compte utilisateur avec business associé
  static async createUserAccount(data: CreateAccountData): Promise<CreateAccountResult> {
    try {
      console.log('Début création compte:', data.email);

      // 1. Récupérer les données de la demande
      let requestData: any = null;
      if (data.requestId) {
        const { data: reqData, error: reqError } = await supabase
          .from('requests')
          .select('*')
          .eq('id', data.requestId)
          .single();

        if (!reqError && reqData) {
          requestData = reqData;
        }
      }

      // 2. Récupérer le type de business par défaut
      const { data: businessTypeData, error: businessTypeError } = await supabase
        .from('business_types')
        .select('id')
        .eq('name', 'Restaurant')
        .single();

      if (businessTypeError) {
        console.error('Erreur récupération type business:', businessTypeError);
        throw new Error('Type de business par défaut non trouvé');
      }

      const businessTypeId = businessTypeData.id;

      // 3. Récupérer la catégorie par défaut
      const { data: categoryData, error: categoryError } = await supabase
        .from('menu_categories')
        .select('id')
        .eq('name', 'Plats principaux')
        .single();

      if (categoryError) {
        console.error('Erreur récupération catégorie:', categoryError);
        throw new Error('Catégorie par défaut non trouvée');
      }

      const categoryId = categoryData.id;

      // 4. Créer le business si c'est un partenaire
      let businessData: any = null;
      if (data.role === 'partner') {
        const { data: createdBusiness, error: businessError } = await supabase
          .from('businesses')
          .insert({
            name: requestData?.business_name || `${data.name} - Commerce`,
            description: requestData?.business_description || 'Commerce créé automatiquement',
            address: requestData?.business_address || 'Adresse à compléter',
            phone: requestData?.business_phone || data.phone_number || '',
            email: requestData?.business_email || data.email,
            opening_hours: requestData?.opening_hours || '8h-22h',
            cuisine_type: requestData?.cuisine_type || 'Générale',
            business_type_id: businessTypeId,
            category_id: categoryId,
            is_active: true,
            is_open: true,
            delivery_time: '30-45 min',
            delivery_fee: 5000,
            rating: 0,
            review_count: 0,
            owner_id: null // temporaire
          })
          .select()
          .single();
        if (businessError || !createdBusiness) {
          throw new Error('Erreur lors de la création du business');
        }
        businessData = createdBusiness;
      }

      // 5. Créer l'utilisateur dans Supabase Auth
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
      if (authError || !authData.user) {
        // Rollback business si user échoue
        if (businessData) {
          await supabase.from('businesses').delete().eq('id', businessData.id);
        }
        throw new Error(`Erreur lors de la création du compte auth: ${authError?.message || 'Utilisateur non créé'}`);
      }

      // 6. Récupérer l'ID du rôle dynamiquement
      const roleName = data.role === 'partner' ? 'partner' : 'driver';
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !roleData) {
        throw new Error(`Rôle ${roleName} non trouvé`);
      }

      // 7. Créer le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone_number: data.phone_number || '',
          role_id: roleData.id,
          is_active: true,
          is_verified: true
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
      }

      // 8. Associer le business au propriétaire si c'est un partenaire
      if (data.role === 'partner' && businessData) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ owner_id: authData.user.id })
          .eq('id', businessData.id);

        if (updateError) {
          console.error('Erreur association business-propriétaire:', updateError);
        }
      }

      // 9. Créer les catégories de menu par défaut si c'est un partenaire
      if (data.role === 'partner' && businessData) {
        await this.createMenuCategoriesFromTemplate(businessData.id, businessTypeId);
      }

      // 10. Envoyer les emails automatiquement
      try {
        if (data.role === 'partner') {
          await EmailService.sendAccountCredentials({
            account_type: 'partner',
            user_name: data.name,
            user_email: data.email,
            login_email: data.email,
            login_password: data.password,
            business_name: businessData?.name || 'Commerce',
            business_id: businessData?.id?.toString() || '',
            selected_plan_name: 'Plan Standard',
            selected_plan_price: 0,
            dashboard_url: `${window.location.origin}/partner-dashboard`,
            account_created_at: new Date().toISOString(),
            created_by: 'admin@bradelivery.com',
            support_email: 'support@bradelivery.com',
            support_phone: '+224 621 00 00 00'
          });
        } else if (data.role === 'driver') {
          await EmailService.sendAccountCredentials({
            account_type: 'driver',
            user_name: data.name,
            user_email: data.email,
            login_email: data.email,
            login_password: data.password,
            dashboard_url: `${window.location.origin}/driver-dashboard`,
            account_created_at: new Date().toISOString(),
            created_by: 'admin@bradelivery.com',
            support_email: 'support@bradelivery.com',
            support_phone: '+224 621 00 00 00'
          });
        }
      } catch (emailError) {
        console.warn('Erreur lors de l\'envoi des emails:', emailError);
        // Ne pas faire échouer la création à cause des emails
      }

      return {
        success: true,
        user: profileData,
        business: businessData,
        credentials: {
          email: data.email,
          password: data.password
        }
      };

    } catch (error) {
      console.error('Erreur création compte:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création du compte'
      };
    }
  }

  // Mapper le type de business vers la catégorie appropriée
  private static mapBusinessTypeToCategory(businessType: string): string {
    const mapping: Record<string, string> = {
      'restaurant': 'Restaurants',
      'cafe': 'Cafés',
      'market': 'Marchés',
      'supermarket': 'Supermarchés',
      'pharmacy': 'Pharmacie',
      'electronics': 'Électronique',
      'beauty': 'Beauté',
      'other': 'Restaurants' // Par défaut
    };
    
    return mapping[businessType] || 'Restaurants';
  }

  // Créer les catégories de menu basées sur le template du type de business
  private static async createMenuCategoriesFromTemplate(businessId: number, businessTypeId: number) {
    try {
      // Récupérer les templates de catégories pour ce type de business
      const { data: templates, error: templateError } = await supabase
        .from('business_type_menu_templates')
        .select('category_name, category_description, sort_order')
        .eq('business_type_id', businessTypeId)
        .order('sort_order');

      if (templateError) {
        console.error('Erreur récupération templates catégories:', templateError);
        return;
      }

      if (!templates || templates.length === 0) {
        console.log('Aucun template trouvé pour le type de business:', businessTypeId);
        return;
      }

      // Créer les catégories basées sur les templates
      for (const template of templates) {
        await supabase
          .from('menu_categories')
          .insert({
            name: template.category_name,
            description: template.category_description,
            business_id: businessId,
            is_active: true,
            sort_order: template.sort_order
          });
      }

      console.log(`Catégories créées pour le business ${businessId} avec ${templates.length} templates`);
    } catch (error) {
      console.error('Erreur création catégories par template:', error);
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