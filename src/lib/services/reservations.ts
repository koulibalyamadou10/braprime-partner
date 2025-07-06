import { supabase } from '@/lib/supabase';
import { NotificationService } from './notifications';

export interface Reservation {
  id: string;
  user_id: string;
  business_id: number;
  business_name: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  special_requests?: string;
  table_number?: number;
  created_at: string;
  updated_at: string;
  // Propriétés du restaurant (ajoutées par la jointure)
  business_logo?: string;
  business_cover_image?: string;
  business_address?: string;
  business_phone?: string;
  business_opening_hours?: string;
  business_cuisine_type?: string;
}

export interface CreateReservationData {
  business_id: number;
  business_name: string;
  date: string;
  time: string;
  guests: number;
  special_requests?: string;
}

export interface UpdateReservationData {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  table_number?: number;
  special_requests?: string;
}

export const ReservationService = {
  // Créer une nouvelle réservation
  create: async (data: CreateReservationData): Promise<{ data: Reservation | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          user_id: user.id,
          business_id: data.business_id,
          business_name: data.business_name,
          date: data.date,
          time: data.time,
          guests: data.guests,
          special_requests: data.special_requests,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        return { data: null, error: error.message };
      }

      // Créer une notification pour la nouvelle réservation
      await NotificationService.create({
        user_id: user.id,
        type: 'reservation',
        title: 'Réservation en attente',
        message: `Votre réservation chez ${data.business_name} pour le ${data.date} à ${data.time} est en attente de confirmation.`,
        priority: 'medium',
        data: {
          reservation_id: reservation.id,
          business_name: data.business_name,
          date: data.date,
          time: data.time,
          guests: data.guests
        }
      });

      return { data: reservation, error: null };
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Récupérer les réservations d'un utilisateur
  getUserReservations: async (): Promise<{ data: Reservation[]; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: [], error: 'Utilisateur non authentifié' };
      }

      // D'abord récupérer les réservations
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        return { data: [], error: error.message };
      }

      if (!reservations || reservations.length === 0) {
        return { data: [], error: null };
      }

      // Ensuite récupérer les informations des restaurants pour ces réservations
      const businessIds = [...new Set(reservations.map(r => r.business_id))];
      const { data: businesses, error: businessesError } = await supabase
        .from('businesses')
        .select('id, name, logo, cover_image, address, phone, opening_hours, cuisine_type')
        .in('id', businessIds);

      if (businessesError) {
        console.error('Erreur lors de la récupération des restaurants:', businessesError);
        // Retourner les réservations sans les informations des restaurants
        return { data: reservations, error: null };
      }

      // Créer un map des restaurants pour un accès rapide
      const businessesMap = new Map(businesses?.map(b => [b.id, b]) || []);

      // Transformer les données pour inclure les informations du restaurant
      const transformedReservations = reservations.map(reservation => {
        const business = businessesMap.get(reservation.business_id);
        return {
          ...reservation,
          business_logo: business?.logo,
          business_cover_image: business?.cover_image,
          business_address: business?.address,
          business_phone: business?.phone,
          business_opening_hours: business?.opening_hours,
          business_cuisine_type: business?.cuisine_type
        };
      });

      return { data: transformedReservations, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      return { data: [], error: 'Erreur de connexion' };
    }
  },

  // Récupérer les réservations d'un commerce (pour les partenaires)
  getBusinessReservations: async (businessId: number): Promise<{ data: Reservation[]; error: string | null }> => {
    try {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('business_id', businessId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des réservations du commerce:', error);
        return { data: [], error: error.message };
      }

      return { data: reservations || [], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations du commerce:', error);
      return { data: [], error: 'Erreur de connexion' };
    }
  },

  // Récupérer une réservation par ID
  getById: async (id: string): Promise<{ data: Reservation | null; error: string | null }> => {
    try {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la réservation:', error);
        return { data: null, error: error.message };
      }

      return { data: reservation, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération de la réservation:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Mettre à jour une réservation
  update: async (id: string, data: UpdateReservationData): Promise<{ data: Reservation | null; error: string | null }> => {
    try {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de la réservation:', error);
        return { data: null, error: error.message };
      }

      // Créer une notification si le statut a changé
      if (data.status && reservation) {
        await createReservationStatusNotification(reservation, data.status);
      }

      return { data: reservation, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Annuler une réservation
  cancel: async (id: string): Promise<{ data: Reservation | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Utilisateur non authentifié' };
      }

      // Vérifier que l'utilisateur est propriétaire de la réservation
      const { data: existingReservation, error: fetchError } = await supabase
        .from('reservations')
        .select('user_id, status')
        .eq('id', id)
        .single();

      if (fetchError) {
        return { data: null, error: 'Réservation non trouvée' };
      }

      if (existingReservation.user_id !== user.id) {
        return { data: null, error: 'Non autorisé à annuler cette réservation' };
      }

      if (existingReservation.status === 'cancelled') {
        return { data: null, error: 'Cette réservation est déjà annulée' };
      }

      if (existingReservation.status === 'completed') {
        return { data: null, error: 'Impossible d\'annuler une réservation terminée' };
      }

      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'annulation de la réservation:', error);
        return { data: null, error: error.message };
      }

      // Créer une notification pour l'annulation
      if (reservation) {
        await createReservationStatusNotification(reservation, 'cancelled');
      }

      return { data: reservation, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Confirmer une réservation (pour les partenaires)
  confirm: async (id: string): Promise<{ data: Reservation | null; error: string | null }> => {
    try {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la confirmation de la réservation:', error);
        return { data: null, error: error.message };
      }

      // Créer une notification pour la confirmation
      if (reservation) {
        await createReservationStatusNotification(reservation, 'confirmed');
      }

      return { data: reservation, error: null };
    } catch (error) {
      console.error('Erreur lors de la confirmation de la réservation:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Marquer une réservation comme terminée
  complete: async (id: string): Promise<{ data: Reservation | null; error: string | null }> => {
    try {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ status: 'completed' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la finalisation de la réservation:', error);
        return { data: null, error: error.message };
      }

      // Créer une notification pour la finalisation
      if (reservation) {
        await createReservationStatusNotification(reservation, 'completed');
      }

      return { data: reservation, error: null };
    } catch (error) {
      console.error('Erreur lors de la finalisation de la réservation:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Assigner un numéro de table
  assignTable: async (id: string, tableNumber: number): Promise<{ data: Reservation | null; error: string | null }> => {
    try {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ table_number: tableNumber })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'assignation de table:', error);
        return { data: null, error: error.message };
      }

      // Créer une notification pour l'assignation de table
      if (reservation) {
        await NotificationService.create({
          user_id: reservation.user_id,
          type: 'reservation',
          title: 'Table assignée',
          message: `Votre table numéro ${tableNumber} a été assignée pour votre réservation chez ${reservation.business_name}.`,
          priority: 'medium',
          data: {
            reservation_id: reservation.id,
            business_name: reservation.business_name,
            table_number: tableNumber,
            date: reservation.date,
            time: reservation.time
          }
        });
      }

      return { data: reservation, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'assignation de table:', error);
      return { data: null, error: 'Erreur de connexion' };
    }
  },

  // Récupérer les réservations par date
  getByDate: async (date: string, businessId?: number): Promise<{ data: Reservation[]; error: string | null }> => {
    try {
      let query = supabase
        .from('reservations')
        .select('*')
        .eq('date', date)
        .order('time', { ascending: true });

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data: reservations, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des réservations par date:', error);
        return { data: [], error: error.message };
      }

      return { data: reservations || [], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations par date:', error);
      return { data: [], error: 'Erreur de connexion' };
    }
  }
};

// Fonction helper pour créer des notifications selon le statut de réservation
const createReservationStatusNotification = async (reservation: Reservation, status: string) => {
  const statusMessages = {
    'confirmed': {
      title: 'Réservation confirmée',
      message: `Votre réservation chez ${reservation.business_name} pour le ${reservation.date} à ${reservation.time} a été confirmée.`,
      priority: 'medium' as const
    },
    'cancelled': {
      title: 'Réservation annulée',
      message: `Votre réservation chez ${reservation.business_name} pour le ${reservation.date} à ${reservation.time} a été annulée.`,
      priority: 'high' as const
    },
    'completed': {
      title: 'Réservation terminée',
      message: `Votre réservation chez ${reservation.business_name} pour le ${reservation.date} à ${reservation.time} a été marquée comme terminée.`,
      priority: 'low' as const
    }
  };

  const notificationData = statusMessages[status as keyof typeof statusMessages];
  
  if (notificationData) {
    await NotificationService.create({
      user_id: reservation.user_id,
      type: 'reservation',
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority,
      data: {
        reservation_id: reservation.id,
        business_name: reservation.business_name,
        status: status,
        date: reservation.date,
        time: reservation.time
      }
    });
  }
}; 