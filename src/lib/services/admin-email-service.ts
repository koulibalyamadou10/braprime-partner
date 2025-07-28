
// Types pour les emails admin
export interface AccountCredentialsEmailData {
  account_type: 'partner' | 'driver';
  user_name: string;
  user_email: string;
  login_email: string;
  login_password: string;
  business_name?: string;
  business_id?: string;
  selected_plan_name?: string;
  selected_plan_price?: number;
  dashboard_url: string;
  account_created_at: string;
  created_by: string;
  support_email: string;
  support_phone: string;
}

export interface RequestApprovalEmailData {
  request_id: string;
  request_type: 'partner' | 'driver';
  user_name: string;
  user_email: string;
  user_phone: string;
  business_name?: string;
  selected_plan_name?: string;
  selected_plan_price?: number;
  login_email: string;
  login_password: string;
  dashboard_url: string;
  approved_at: string;
  approved_by: string;
  account_created?: boolean;
  business_created?: boolean;
  subscription_created?: boolean;
}

export interface RequestRejectionEmailData {
  request_id: string;
  request_type: 'partner' | 'driver';
  user_name: string;
  user_email: string;
  business_name?: string;
  rejection_reason: string;
  admin_notes?: string;
  rejected_at: string;
  rejected_by: string;
  contact_email: string;
  contact_phone: string;
}

export class AdminEmailService {
  private static API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  /**
   * Envoyer un email avec les identifiants de connexion
   */
  static async sendAccountCredentials(data: AccountCredentialsEmailData) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/account-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Email avec identifiants envoyé:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email avec identifiants:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email d'approbation de demande
   */
  static async sendRequestApproval(data: RequestApprovalEmailData) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/request-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Email d\'approbation envoyé:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email d\'approbation:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email de rejet de demande
   */
  static async sendRequestRejection(data: RequestRejectionEmailData) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/request-rejection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Email de rejet envoyé:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de rejet:', error);
      throw error;
    }
  }

  /**
   * Envoyer les emails d'approbation avec identifiants
   */
  static async sendApprovalWithCredentials(
    approvalData: RequestApprovalEmailData,
    credentialsData: AccountCredentialsEmailData
  ) {
    try {
      const [approvalResult, credentialsResult] = await Promise.all([
        this.sendRequestApproval(approvalData),
        this.sendAccountCredentials(credentialsData)
      ]);

      console.log('Emails d\'approbation envoyés avec succès');
      return {
        approval: approvalResult,
        credentials: credentialsResult
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails d\'approbation:', error);
      throw error;
    }
  }

  /**
   * Préparer les données d'email pour l'approbation d'un partenaire
   */
  static preparePartnerApprovalEmails(
    requestData: any,
    userData: any,
    businessData: any,
    generatedPassword: string
  ) {
    const approvalData: RequestApprovalEmailData = {
      request_id: requestData.id,
      request_type: 'partner',
      user_name: requestData.user_name,
      user_email: requestData.user_email,
      user_phone: requestData.user_phone,
      business_name: requestData.business_name,
      selected_plan_name: requestData.metadata?.selected_plan_name,
      selected_plan_price: requestData.metadata?.selected_plan_price,
      login_email: userData.email,
      login_password: generatedPassword,
      dashboard_url: 'https://bradelivery.com/partner-dashboard',
      approved_at: new Date().toISOString(),
      approved_by: 'admin@bradelivery.com',
      account_created: true,
      business_created: !!businessData,
      subscription_created: !!requestData.metadata?.selected_plan_id
    };

    const credentialsData: AccountCredentialsEmailData = {
      account_type: 'partner',
      user_name: requestData.user_name,
      user_email: requestData.user_email,
      login_email: userData.email,
      login_password: generatedPassword,
      business_name: requestData.business_name,
      business_id: businessData?.id,
      selected_plan_name: requestData.metadata?.selected_plan_name,
      selected_plan_price: requestData.metadata?.selected_plan_price,
      dashboard_url: 'https://bradelivery.com/partner-dashboard',
      account_created_at: new Date().toISOString(),
      created_by: 'admin@bradelivery.com',
      support_email: 'support@bradelivery.com',
      support_phone: '+224 621 00 00 00'
    };

    return { approvalData, credentialsData };
  }

  /**
   * Préparer les données d'email pour l'approbation d'un chauffeur
   */
  static prepareDriverApprovalEmails(
    requestData: any,
    userData: any,
    generatedPassword: string
  ) {
    const approvalData: RequestApprovalEmailData = {
      request_id: requestData.id,
      request_type: 'driver',
      user_name: requestData.user_name,
      user_email: requestData.user_email,
      user_phone: requestData.user_phone,
      login_email: userData.email,
      login_password: generatedPassword,
      dashboard_url: 'https://bradelivery.com/driver-dashboard',
      approved_at: new Date().toISOString(),
      approved_by: 'admin@bradelivery.com',
      account_created: true
    };

    const credentialsData: AccountCredentialsEmailData = {
      account_type: 'driver',
      user_name: requestData.user_name,
      user_email: requestData.user_email,
      login_email: userData.email,
      login_password: generatedPassword,
      dashboard_url: 'https://bradelivery.com/driver-dashboard',
      account_created_at: new Date().toISOString(),
      created_by: 'admin@bradelivery.com',
      support_email: 'support@bradelivery.com',
      support_phone: '+224 621 00 00 00'
    };

    return { approvalData, credentialsData };
  }
} 