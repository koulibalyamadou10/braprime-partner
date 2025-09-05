import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Types pour les colis basés sur la table package_orders
export type ColisStatus = 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface Colis {
  id: string;
  order_id: string;
  user_id: string;
  business_id: number;
  service_name: string;
  service_price: number;
  package_weight: string;
  package_dimensions?: string;
  package_description?: string;
  is_fragile: boolean;
  is_urgent: boolean;
  pickup_address: string;
  pickup_instructions?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  delivery_address: string;
  delivery_instructions?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  preferred_time?: string;
  contact_method: 'phone' | 'email' | 'both';
  status: ColisStatus;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  created_at: string;
  updated_at: string;
  pickup_time?: string;
  drop_time?: string;
  pickup_date?: string;
  drop_date?: string;
  // Champs calculés pour l'affichage
  tracking_number?: string;
  driver_id?: string;
  driver_name?: string;
}

export interface CreateColisData {
  service_name: string;
  service_price: number;
  package_weight: string;
  package_dimensions?: string;
  package_description?: string;
  is_fragile?: boolean;
  is_urgent?: boolean;
  pickup_address: string;
  pickup_instructions?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  delivery_address: string;
  delivery_instructions?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  preferred_time?: string;
  contact_method?: 'phone' | 'email' | 'both';
  pickup_time?: string;
  drop_time?: string;
  pickup_date?: string;
  drop_date?: string;
}

export interface UpdateColisData {
  service_name?: string;
  service_price?: number;
  package_weight?: string;
  package_dimensions?: string;
  package_description?: string;
  is_fragile?: boolean;
  is_urgent?: boolean;
  pickup_address?: string;
  pickup_instructions?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  delivery_address?: string;
  delivery_instructions?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  preferred_time?: string;
  contact_method?: 'phone' | 'email' | 'both';
  status?: ColisStatus;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  pickup_time?: string;
  drop_time?: string;
  pickup_date?: string;
  drop_date?: string;
}

export const usePartnerColis = (businessId: number | null) => {
  const [colis, setColis] = useState<Colis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les colis du business
  const loadColis = async () => {
    if (!businessId) {
      setColis([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('package_orders')
        .select(`
          *,
          order:orders(id, order_number, driver_id, driver:driver_profiles(name, phone_number))
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Transformer les données pour correspondre à l'interface Colis
        const transformedColis: Colis[] = data.map((item: any) => ({
          ...item,
          tracking_number: item.order?.order_number || `BRP${item.id.slice(0, 8).toUpperCase()}`,
          driver_id: item.order?.driver_id,
          driver_name: item.order?.driver?.name,
        }));

        setColis(transformedColis);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des colis:', err);
      setError(err.message || 'Erreur lors du chargement des colis');
      toast.error('Erreur lors du chargement des colis');
    } finally {
      setIsLoading(false);
    }
  };

  // Créer un nouveau colis
  const createColis = async (colisData: CreateColisData): Promise<boolean> => {
    if (!businessId) {
      toast.error('Aucun business associé');
      return false;
    }

    try {
      setIsCreating(true);

      // Créer d'abord une commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: colisData.customer_email, // Utiliser l'email comme référence temporaire
          business_id: businessId,
          status: 'pending',
          total: colisData.service_price,
          delivery_fee: 0,
          grand_total: colisData.service_price,
          delivery_method: 'delivery',
          delivery_address: colisData.delivery_address,
          delivery_instructions: colisData.delivery_instructions,
          payment_method: 'cash',
          payment_status: 'pending',
          delivery_type: 'asap',
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Créer le colis associé
      const { error: colisError } = await supabase
        .from('package_orders')
        .insert({
          order_id: order.id,
          user_id: order.user_id,
          business_id: businessId,
          ...colisData,
        });

      if (colisError) {
        // Supprimer la commande créée en cas d'erreur
        await supabase.from('orders').delete().eq('id', order.id);
        throw colisError;
      }

      toast.success('Colis créé avec succès');
      await loadColis(); // Recharger la liste
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la création du colis:', err);
      toast.error(err.message || 'Erreur lors de la création du colis');
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // Mettre à jour un colis
  const updateColis = async (colisId: string, updateData: UpdateColisData): Promise<boolean> => {
    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('package_orders')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', colisId);

      if (error) {
        throw error;
      }

      toast.success('Colis mis à jour avec succès');
      await loadColis(); // Recharger la liste
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du colis:', err);
      toast.error(err.message || 'Erreur lors de la mise à jour du colis');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Supprimer un colis
  const deleteColis = async (colisId: string): Promise<boolean> => {
    try {
      setIsDeleting(true);

      // Récupérer le colis pour obtenir l'order_id
      const { data: colisData, error: fetchError } = await supabase
        .from('package_orders')
        .select('order_id')
        .eq('id', colisId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Supprimer le colis
      const { error: colisError } = await supabase
        .from('package_orders')
        .delete()
        .eq('id', colisId);

      if (colisError) {
        throw colisError;
      }

      // Supprimer la commande associée si elle existe
      if (colisData.order_id) {
        await supabase
          .from('orders')
          .delete()
          .eq('id', colisData.order_id);
      }

      toast.success('Colis supprimé avec succès');
      await loadColis(); // Recharger la liste
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression du colis:', err);
      toast.error(err.message || 'Erreur lors de la suppression du colis');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Mettre à jour le statut d'un colis
  const updateColisStatus = async (colisId: string, status: ColisStatus): Promise<boolean> => {
    return updateColis(colisId, { status });
  };

  // Charger les données au montage
  useEffect(() => {
    loadColis();
  }, [businessId]);

  return {
    colis,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    loadColis,
    createColis,
    updateColis,
    deleteColis,
    updateColisStatus,
  };
};
