import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Reservation, ReservationService } from '@/lib/services/reservations';

export interface PartnerReservation extends Reservation {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  business_name: string;
}

export const usePartnerReservations = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState<PartnerReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les réservations du partenaire
  const fetchPartnerReservations = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      // Récupérer d'abord l'ID du business du partenaire
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', currentUser.id)
        .single();

      if (businessError) {
        console.error('Erreur business:', businessError);
        throw new Error('Impossible de récupérer les informations du business');
      }

      if (!businessData) {
        throw new Error('Aucun business trouvé pour ce partenaire');
      }

      // Utiliser le service pour récupérer les réservations
      const { data: reservationsData, error: reservationsError } = await ReservationService.getBusinessReservations(businessData.id);

      if (reservationsError) {
        console.error('Erreur réservations:', reservationsError);
        throw new Error('Impossible de récupérer les réservations');
      }

      if (!reservationsData || reservationsData.length === 0) {
        setReservations([]);
        return;
      }

      // Récupérer les informations des utilisateurs pour ces réservations
      const userIds = [...new Set(reservationsData.map(r => r.user_id))];
      const { data: userProfiles, error: userError } = await supabase
        .from('user_profiles')
        .select('id, name, phone_number, email')
        .in('id', userIds);

      if (userError) {
        console.error('Erreur profils utilisateurs:', userError);
        // Continuer sans les informations des utilisateurs
      }

      // Créer un map des profils utilisateurs pour un accès rapide
      const userProfilesMap = new Map(userProfiles?.map(u => [u.id, u]) || []);

      // Transformer les données
      const transformedReservations: PartnerReservation[] = reservationsData.map((reservation: any) => {
        const userProfile = userProfilesMap.get(reservation.user_id);
        return {
          ...reservation,
          customer_name: userProfile?.name || 'Client inconnu',
          customer_phone: userProfile?.phone_number || '',
          customer_email: userProfile?.email || '',
          business_name: businessData.name
        };
      });

      setReservations(transformedReservations);
    } catch (err) {
      console.error('Erreur fetchPartnerReservations:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'une réservation
  const updateReservationStatus = async (reservationId: string, status: Reservation['status']) => {
    try {
      const { data, error } = await ReservationService.update(reservationId, { status });

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error('Impossible de mettre à jour le statut');
      }

      // Mettre à jour l'état local
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId 
            ? { ...res, status, updated_at: data.updated_at }
            : res
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Erreur updateReservationStatus:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur inconnue' 
      };
    }
  };

  // Assigner une table à une réservation
  const assignTable = async (reservationId: string, tableNumber: number) => {
    try {
      const { data, error } = await ReservationService.assignTable(reservationId, tableNumber);

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error('Impossible d\'assigner la table');
      }

      // Mettre à jour l'état local
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId 
            ? { ...res, table_number: tableNumber, updated_at: data.updated_at }
            : res
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Erreur assignTable:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur inconnue' 
      };
    }
  };

  // Filtrer les réservations par date
  const getReservationsByDate = (date: string) => {
    return reservations.filter(res => res.date === date);
  };

  // Filtrer les réservations par statut
  const getReservationsByStatus = (status: Reservation['status'] | 'all') => {
    if (status === 'all') return reservations;
    return reservations.filter(res => res.status === status);
  };

  // Obtenir les statistiques des réservations
  const getReservationStats = () => {
    const total = reservations.length;
    const confirmed = reservations.filter(res => res.status === 'confirmed').length;
    const pending = reservations.filter(res => res.status === 'pending').length;
    const completed = reservations.filter(res => res.status === 'completed').length;
    const cancelled = reservations.filter(res => res.status === 'cancelled').length;

    return {
      total,
      confirmed,
      pending,
      completed,
      cancelled
    };
  };

  // Charger les réservations au montage du composant
  useEffect(() => {
    fetchPartnerReservations();
  }, [currentUser]);

  return {
    reservations,
    loading,
    error,
    fetchPartnerReservations,
    updateReservationStatus,
    assignTable,
    getReservationsByDate,
    getReservationsByStatus,
    getReservationStats
  };
}; 