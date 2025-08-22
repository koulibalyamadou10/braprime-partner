import { supabase } from '@/lib/supabase';

export interface DriverNotificationData {
  order_id: string;
  order_number: string;
  business_name: string;
  business_address: string;
  customer_name: string;
  customer_address: string;
  delivery_type: 'asap' | 'scheduled';
  scheduled_time?: string;
  total_amount: number;
  items_count: number;
  driver_emails: string[];
  order_status: string;
  available_for_drivers: boolean;
}

export class DriverNotificationService {
  // Récupérer tous les emails des drivers actifs et disponibles (indépendants uniquement)
  static async getActiveDriverEmails(businessId: number): Promise<{ emails: string[]; error: string | null }> {
    try {
      console.log(`🔍 Récupération des emails des drivers indépendants actifs`);

      const { data: drivers, error } = await supabase
        .from('driver_profiles')
        .select(`
          *,
          user_profiles!inner(
            id,
            email
          )
        `)
        .is('business_id', null) // Uniquement les drivers indépendants
        .eq('is_active', true)
        .eq('is_available', true);

      if (error) {
        console.error('Erreur récupération emails drivers:', error);
        return { emails: [], error: error.message };
      }

      // Extraire les emails valides
      const emails = (drivers || [])
        .filter(driver => driver.user_profiles?.email)
        .map(driver => driver.user_profiles.email)
        .filter(email => email && email.trim() !== '');

      console.log(`✅ ${emails.length} emails de drivers récupérés`);
      return { emails, error: null };

    } catch (error) {
      console.error('Erreur lors de la récupération des emails drivers:', error);
      return { 
        emails: [], 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des emails drivers' 
      };
    }
  }

  // Récupérer les détails d'une commande pour la notification
  static async getOrderDetails(orderId: string): Promise<{ order: any; error: string | null }> {
    try {
      console.log(`🔍 Récupération des détails de la commande ${orderId}`);

      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          businesses!inner(
            name,
            address
          ),
          user_profiles!inner(
            name,
            address
          ),
          order_items(
            quantity
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Erreur récupération détails commande:', error);
        return { order: null, error: error.message };
      }

      if (!order) {
        return { order: null, error: 'Commande non trouvée' };
      }

      // Calculer le nombre total d'articles
      const itemsCount = order.order_items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;

      const orderDetails = {
        ...order,
        business_name: order.businesses?.name || 'Commerce inconnu',
        business_address: order.businesses?.address || 'Adresse inconnue',
        customer_name: order.user_profiles?.name || 'Client inconnu',
        customer_address: order.user_profiles?.address || 'Adresse inconnue',
        items_count: itemsCount
      };

      console.log('✅ Détails de la commande récupérés');
      return { order: orderDetails, error: null };

    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la commande:', error);
      return { 
        order: null, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des détails de la commande' 
      };
    }
  }

  // Envoyer une notification aux drivers
  static async sendDriverNotification(
    orderId: string, 
    businessId: number, 
    availableForDrivers: boolean
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log(`📧 Envoi notification drivers pour commande ${orderId}, disponible: ${availableForDrivers}`);

      // Récupérer les détails de la commande
      const { order, error: orderError } = await this.getOrderDetails(orderId);
      if (orderError || !order) {
        return { success: false, error: orderError || 'Impossible de récupérer les détails de la commande' };
      }

      // Récupérer les emails des drivers
      const { emails, error: emailsError } = await this.getActiveDriverEmails(businessId);
      if (emailsError) {
        return { success: false, error: emailsError };
      }

      if (emails.length === 0) {
        console.log('⚠️ Aucun driver actif trouvé pour cette notification');
        return { success: true, error: null }; // Pas d'erreur, juste aucun driver à notifier
      }

      // Préparer les données pour l'API
      const notificationData: DriverNotificationData = {
        order_id: order.id,
        order_number: order.order_number || `CMD-${order.id.slice(0, 8)}`,
        business_name: order.business_name,
        business_address: order.business_address,
        customer_name: order.customer_name,
        customer_address: order.customer_address,
        delivery_type: order.delivery_type || 'asap',
        scheduled_time: order.scheduled_time,
        total_amount: order.total_amount || 0,
        items_count: order.items_count,
        driver_emails: emails,
        order_status: order.status || 'pending',
        available_for_drivers: availableForDrivers
      };

      // Appeler l'API backend pour envoyer les emails
      const { EMAIL_CONFIG } = await import('@/config/env');
      const apiUrl = EMAIL_CONFIG.API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/emails/driver-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API notification drivers:', errorData);
        return { 
          success: false, 
          error: errorData.error || `Erreur API: ${response.status}` 
        };
      }

      const result = await response.json();
      console.log('✅ Notification drivers envoyée avec succès:', result);

      return { success: true, error: null };

    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification drivers:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi de la notification drivers' 
      };
    }
  }

  // Méthode utilitaire pour notifier lors du changement de disponibilité
  // Note: Seuls les drivers indépendants (business_id = null) sont notifiés
  static async notifyAvailabilityChange(
    orderId: string, 
    businessId: number, 
    availableForDrivers: boolean
  ): Promise<void> {
    try {
      const { success, error } = await this.sendDriverNotification(orderId, businessId, availableForDrivers);
      
      if (!success) {
        console.error('❌ Échec notification drivers indépendants:', error);
        // Ne pas faire échouer l'opération principale si la notification échoue
      } else {
        console.log('✅ Notification drivers indépendants envoyée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur notification drivers indépendants:', error);
      // Ne pas faire échouer l'opération principale
    }
  }
}
