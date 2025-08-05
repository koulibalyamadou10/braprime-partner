import { supabase } from '@/lib/supabase';
import { EmailService } from './email';

export interface BusinessRequest {
  id: number;
  name: string;
  business_type_id: number;
  address: string;
  owner_id: string | null;
  is_active: boolean;
  requires_subscription: boolean;
  subscription_status: string;
  request_status: 'pending' | 'approved' | 'rejected';
  request_notes: string | null;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  business_phone: string;
  business_email: string;
  business_description: string;
  opening_hours: string;
  delivery_radius: number;
  cuisine_type: string | null;
  specialties: string[] | null;
  current_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessRequestFilters {
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
  date_from?: string;
  date_to?: string;
}

export class AdminBusinessRequestsService {
  // Récupérer toutes les demandes avec filtres
  static async getBusinessRequests(filters: BusinessRequestFilters = {}): Promise<{ data: BusinessRequest[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('businesses')
        .select(`
          *,
          business_types!businesses_business_type_id_fkey (
            name
          )
        `)
        .not('request_status', 'is', null) // Seulement les business avec un request_status (demandes)
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.status) {
        query = query.eq('request_status', filters.status);
      }
      // Si pas de filtre de statut, afficher toutes les demandes (pas seulement pending)
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%,owner_email.ilike.%${filters.search}%`);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        return { data: null, error: error.message };
      }

      return { data: data as BusinessRequest[], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      return { data: null, error: 'Erreur lors de la récupération des demandes' };
    }
  }

  // Récupérer une demande spécifique
  static async getBusinessRequest(id: number): Promise<{ data: BusinessRequest | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_types!businesses_business_type_id_fkey (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la demande:', error);
        return { data: null, error: error.message };
      }

      return { data: data as BusinessRequest, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération de la demande:', error);
      return { data: null, error: 'Erreur lors de la récupération de la demande' };
    }
  }

  // Approuver une demande partenaire (sans créer de compte)
  static async approveBusinessRequest(businessId: number, adminNotes?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Récupérer les informations du business
      const { data: business, error: businessError } = await this.getBusinessRequest(businessId);
      
      if (businessError || !business) {
        return { success: false, error: 'Business non trouvé' };
      }

      // Approuver la demande avec la fonction PostgreSQL (sans user_id)
      const { error: approveError } = await supabase
        .rpc('approve_partner_request_simple', {
          p_business_id: businessId
        });

      if (approveError) {
        console.error('Erreur approbation:', approveError);
        return { success: false, error: 'Erreur lors de l\'approbation' };
      }

      // Envoyer seulement l'email d'approbation
      await EmailService.sendRequestApproval({
        request_id: businessId.toString(),
        request_type: 'partner',
        user_name: business.owner_name,
        user_email: business.owner_email,
        user_phone: business.owner_phone,
        business_name: business.name,
        selected_plan_name: 'Plan Standard',
        selected_plan_price: 0,
        login_email: business.owner_email,
        login_password: 'À définir lors de la création du compte',
        dashboard_url: `${window.location.origin}/partner-dashboard`,
        approved_at: new Date().toISOString(),
        approved_by: 'admin@bradelivery.com'
      });

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      return { success: false, error: 'Erreur lors de l\'approbation' };
    }
  }

  // Créer un compte utilisateur pour un business approuvé
  static async createUserAccountForBusiness(businessId: number): Promise<{ success: boolean; error: string | null; userId?: string; password?: string }> {
    try {
      // Récupérer les informations du business
      const { data: business, error: businessError } = await this.getBusinessRequest(businessId);
      
      if (businessError || !business) {
        return { success: false, error: 'Business non trouvé' };
      }

      // Vérifier que le business est approuvé
      if (business.request_status !== 'approved') {
        return { success: false, error: 'Le business doit être approuvé avant de créer un compte' };
      }

      // Vérifier qu'il n'y a pas déjà un owner_id
      if (business.owner_id) {
        return { success: false, error: 'Un compte utilisateur existe déjà pour ce business' };
      }

      // Créer le compte utilisateur via la fonction PostgreSQL
      const { data: result, error: createError } = await supabase
        .rpc('create_user_account_for_business', {
          p_business_id: businessId
        });

      if (createError) {
        console.error('Erreur création utilisateur:', createError);
        return { success: false, error: 'Erreur lors de la création du compte utilisateur' };
      }

      if (!result || !result.success) {
        return { success: false, error: 'Erreur lors de la création du compte utilisateur' };
      }

      // Envoyer les emails avec identifiants
      await EmailService.sendRequestApproval({
        request_id: businessId.toString(),
        request_type: 'partner',
        user_name: business.owner_name,
        user_email: business.owner_email,
        user_phone: business.owner_phone,
        business_name: business.name,
        selected_plan_name: 'Plan Standard',
        selected_plan_price: 0,
        login_email: business.owner_email,
        login_password: result.password,
        dashboard_url: `${window.location.origin}/partner-dashboard`,
        approved_at: new Date().toISOString(),
        approved_by: 'admin@bradelivery.com'
      });

      await EmailService.sendAccountCredentials({
        account_type: 'partner',
        user_name: business.owner_name,
        user_email: business.owner_email,
        login_email: business.owner_email,
        login_password: result.password,
        business_name: business.name,
        business_id: businessId.toString(),
        selected_plan_name: 'Plan Standard',
        selected_plan_price: 0,
        dashboard_url: `${window.location.origin}/partner-dashboard`,
        account_created_at: new Date().toISOString(),
        created_by: 'admin@bradelivery.com',
        support_email: 'support@bradelivery.com',
        support_phone: '+225 0123456789'
      });

      return { 
        success: true, 
        error: null, 
        userId: result.user_id,
        password: result.password
      };
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      return { success: false, error: 'Erreur lors de la création du compte' };
    }
  }

  // Rejeter une demande partenaire
  static async rejectBusinessRequest(businessId: number, reason: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Récupérer les informations du business
      const { data: business, error: businessError } = await this.getBusinessRequest(businessId);
      
      if (businessError || !business) {
        return { success: false, error: 'Business non trouvé' };
      }

      // Rejeter la demande avec la fonction PostgreSQL
      const { error: rejectError } = await supabase
        .rpc('reject_partner_request', {
          p_business_id: businessId,
          p_reason: reason
        });

      if (rejectError) {
        console.error('Erreur rejet:', rejectError);
        return { success: false, error: 'Erreur lors du rejet' };
      }

      // Envoyer l'email de rejet
      await EmailService.sendRequestRejection({
        request_id: businessId.toString(),
        request_type: 'partner',
        user_name: business.owner_name,
        user_email: business.owner_email,
        business_name: business.name,
        rejection_reason: reason,
        admin_notes: reason,
        rejected_at: new Date().toISOString(),
        rejected_by: 'admin@bradelivery.com',
        contact_email: 'support@bradelivery.com',
        contact_phone: '+225 0123456789'
      });

      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      return { success: false, error: 'Erreur lors du rejet' };
    }
  }

  // Envoyer les emails d'approbation
  private static async sendApprovalEmails(business: BusinessRequest, userId: string): Promise<void> {
    try {
      // Envoyer l'email d'approbation
      await EmailService.sendRequestApproval({
        user_name: business.owner_name,
        user_email: business.owner_email,
        business_name: business.name,
        business_type: business.business_type_id.toString()
      });

      // Envoyer les identifiants de connexion
      await EmailService.sendAccountCredentials({
        user_name: business.owner_name,
        user_email: business.owner_email,
        business_name: business.name,
        user_id: userId
      });

      console.log('Emails d\'approbation envoyés avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails:', error);
    }
  }

  // Générer un mot de passe temporaire
  private static generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Obtenir les statistiques des demandes
  static async getBusinessRequestStats(): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('request_status, created_at')
        .not('request_status', 'is', null); // Toutes les demandes

      if (error) {
        return { data: null, error: error.message };
      }

      const stats = {
        total: data.length,
        pending: data.filter((item: any) => item.request_status === 'pending').length,
        approved: data.filter((item: any) => item.request_status === 'approved').length,
        rejected: data.filter((item: any) => item.request_status === 'rejected').length
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { data: null, error: 'Erreur lors de la récupération des statistiques' };
    }
  }
} 