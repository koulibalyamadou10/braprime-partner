/**
 * Service pour l'envoi d'emails liés aux réservations
 * Utilise l'Edge Function send-email de Supabase
 */

// Configuration de l'Edge Function
const SUPABASE_EDGE_FUNCTIONS_BASE_URL = 'https://jeumizxzlwjvgerrcpjr.supabase.co/functions/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1izeh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

// Types pour les données d'email
export interface ReservationConfirmationData {
  reservation_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  business_name: string;
  business_address?: string;
  business_phone?: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  special_requests?: string;
  reservation_created_at: string;
  confirmation_code?: string;
  support_email?: string;
  support_phone?: string;
}

export interface ReservationServiceNotificationData {
  reservation_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  business_name: string;
  business_email: string;
  business_phone?: string;
  business_address?: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  special_requests?: string;
  reservation_created_at: string;
  confirmation_code?: string;
  table_number?: string;
  admin_dashboard_url?: string;
}

export interface ReservationCancellationData {
  reservation_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  business_name: string;
  business_email: string;
  business_phone?: string;
  date: string;
  time: string;
  guests: number;
  cancellation_reason?: string;
  cancelled_at: string;
  cancelled_by: 'customer' | 'business' | 'admin';
  support_email?: string;
  support_phone?: string;
}

export interface TableAssignmentData {
  reservation_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  business_name: string;
  business_email: string;
  business_phone?: string;
  business_address?: string;
  date: string;
  time: string;
  guests: number;
  table_number: string;
  table_description?: string;
  assigned_at: string;
  assigned_by: string;
  special_requests?: string;
  support_email?: string;
  support_phone?: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  message?: string;
}

class ReservationEmailService {
  /**
   * Envoie un email de confirmation de réservation au client
   */
  static async sendReservationConfirmation(data: ReservationConfirmationData): Promise<EmailResult> {
    try {
      console.log('📧 [ReservationEmailService] Envoi confirmation réservation:', data.reservation_id);

      const response = await fetch(`${SUPABASE_EDGE_FUNCTIONS_BASE_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'reservation-confirmation',
          data: {
            ...data,
            support_email: data.support_email || 'support@bradelivery.com',
            support_phone: data.support_phone || '+224 621 00 00 00'
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ [ReservationEmailService] Erreur Edge Function:', result.error);
        return {
          success: false,
          error: result.error || 'Erreur lors de l\'envoi de l\'email de confirmation'
        };
      }

      console.log('✅ [ReservationEmailService] Email de confirmation envoyé:', result);
      return {
        success: true,
        message: 'Email de confirmation envoyé avec succès'
      };

    } catch (error) {
      console.error('❌ [ReservationEmailService] Erreur envoi confirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi de l\'email'
      };
    }
  }

  /**
   * Envoie une notification au service (restaurant) pour une nouvelle réservation
   */
  static async sendServiceNotification(data: ReservationServiceNotificationData): Promise<EmailResult> {
    try {
      console.log('📧 [ReservationEmailService] Envoi notification service:', data.reservation_id);

      const response = await fetch(`${SUPABASE_EDGE_FUNCTIONS_BASE_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'reservation-service-notification',
          data: {
            ...data,
            admin_dashboard_url: data.admin_dashboard_url || 'https://braprime-admin.app/reservations'
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ [ReservationEmailService] Erreur Edge Function:', result.error);
        return {
          success: false,
          error: result.error || 'Erreur lors de l\'envoi de la notification au service'
        };
      }

      console.log('✅ [ReservationEmailService] Notification service envoyée:', result);
      return {
        success: true,
        message: 'Notification envoyée au service avec succès'
      };

    } catch (error) {
      console.error('❌ [ReservationEmailService] Erreur envoi notification service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi de la notification'
      };
    }
  }

  /**
   * Envoie un email d'annulation de réservation
   */
  static async sendReservationCancellation(data: ReservationCancellationData): Promise<EmailResult> {
    try {
      console.log('📧 [ReservationEmailService] Envoi annulation réservation:', data.reservation_id);

      const response = await fetch(`${SUPABASE_EDGE_FUNCTIONS_BASE_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'reservation-cancellation',
          data: {
            ...data,
            support_email: data.support_email || 'support@bradelivery.com',
            support_phone: data.support_phone || '+224 621 00 00 00'
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ [ReservationEmailService] Erreur Edge Function:', result.error);
        return {
          success: false,
          error: result.error || 'Erreur lors de l\'envoi de l\'email d\'annulation'
        };
      }

      console.log('✅ [ReservationEmailService] Email d\'annulation envoyé:', result);
      return {
        success: true,
        message: 'Email d\'annulation envoyé avec succès'
      };

    } catch (error) {
      console.error('❌ [ReservationEmailService] Erreur envoi annulation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi de l\'email d\'annulation'
      };
    }
  }

  /**
   * Envoie un email d'assignation de table
   */
  static async sendTableAssignment(data: TableAssignmentData): Promise<EmailResult> {
    try {
      console.log('📧 [ReservationEmailService] Envoi assignation table:', data.reservation_id);

      const response = await fetch(`${SUPABASE_EDGE_FUNCTIONS_BASE_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'table-assignment',
          data: {
            ...data,
            support_email: data.support_email || 'support@bradelivery.com',
            support_phone: data.support_phone || '+224 621 00 00 00'
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ [ReservationEmailService] Erreur Edge Function:', result.error);
        return {
          success: false,
          error: result.error || 'Erreur lors de l\'envoi de l\'email d\'assignation de table'
        };
      }

      console.log('✅ [ReservationEmailService] Email d\'assignation envoyé:', result);
      return {
        success: true,
        message: 'Email d\'assignation de table envoyé avec succès'
      };

    } catch (error) {
      console.error('❌ [ReservationEmailService] Erreur envoi assignation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi de l\'email d\'assignation'
      };
    }
  }

  /**
   * Envoie un email de mise à jour de statut de réservation
   */
  static async sendStatusUpdate(
    reservation: any,
    newStatus: string,
    business: any,
    updatedBy: string
  ): Promise<EmailResult> {
    try {
      console.log('📧 [ReservationEmailService] Envoi mise à jour statut:', reservation.id, '→', newStatus);

      // Préparer les données selon le nouveau statut
      const emailData: ReservationConfirmationData = {
        reservation_id: reservation.id,
        user_name: reservation.customer_name || 'Client',
        user_email: reservation.customer_email || '',
        user_phone: reservation.customer_phone,
        business_name: business.name || 'Notre établissement',
        business_address: business.address,
        business_phone: business.phone,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests || 1,
        status: newStatus as any,
        special_requests: reservation.special_requests,
        reservation_created_at: reservation.created_at || new Date().toISOString(),
        confirmation_code: reservation.confirmation_code,
        support_email: 'support@bradelivery.com',
        support_phone: '+224 621 00 00 00'
      };

      // Envoyer l'email de confirmation avec le nouveau statut
      return await this.sendReservationConfirmation(emailData);

    } catch (error) {
      console.error('❌ [ReservationEmailService] Erreur envoi mise à jour statut:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi de la mise à jour'
      };
    }
  }
}

export default ReservationEmailService;
