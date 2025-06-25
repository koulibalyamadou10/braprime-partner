import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Reservation } from '@/lib/services/reservations';

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
        throw new Error('Impossible de récupérer les informations du business');
      }

      // Récupérer les réservations pour ce business
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          user_profiles!reservations_user_id_fkey (
            name,
            phone_number,
            email
          )
        `)
        .eq('business_id', businessData.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (reservationsError) {
        throw new Error('Impossible de récupérer les réservations');
      }

      // Transformer les données
      const transformedReservations: PartnerReservation[] = reservationsData.map((reservation: any) => ({
        ...reservation,
        customer_name: reservation.user_profiles?.name || 'Client inconnu',
        customer_phone: reservation.user_profiles?.phone_number || '',
        customer_email: reservation.user_profiles?.email || '',
        business_name: businessData.name
      }));

      setReservations(transformedReservations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'une réservation
  const updateReservationStatus = async (reservationId: string, status: Reservation['status']) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reservationId);

      if (error) {
        throw new Error('Impossible de mettre à jour le statut');
      }

      // Mettre à jour l'état local
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId 
            ? { ...res, status, updated_at: new Date().toISOString() }
            : res
        )
      );

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur inconnue' 
      };
    }
  };

  // Assigner une table à une réservation
  const assignTable = async (reservationId: string, tableNumber: number) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          table_number: tableNumber, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', reservationId);

      if (error) {
        throw new Error('Impossible d\'assigner la table');
      }

      // Mettre à jour l'état local
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId 
            ? { ...res, table_number: tableNumber, updated_at: new Date().toISOString() }
            : res
        )
      );

      return { success: true };
    } catch (err) {
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