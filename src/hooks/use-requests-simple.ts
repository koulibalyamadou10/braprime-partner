import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CreateRequestData {
  type: 'partner' | 'driver';
  user_name: string;
  user_email: string;
  user_phone: string;
  business_name?: string;
  business_type?: string;
  business_address?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  notes?: string;
}

export const useRequestsSimple = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRequest = async (data: CreateRequestData) => {

    // Validation des champs requis
    if (!data.user_name?.trim()) {
      throw new Error('Le nom est requis');
    }
    if (!data.user_email?.trim()) {
      throw new Error('L\'email est requis');
    }
    if (!data.user_phone?.trim()) {
      throw new Error('Le téléphone est requis');
    }

    // Validation des champs spécifiques selon le type de demande
    if (data.type === 'partner') {
      if (!data.business_name?.trim()) {
        throw new Error('Le nom du commerce est requis');
      }
      if (!data.business_type?.trim()) {
        throw new Error('Le type de commerce est requis');
      }
      if (!data.business_address?.trim()) {
        throw new Error('L\'adresse du commerce est requise');
      }
    }

    if (data.type === 'driver') {
      if (!data.vehicle_type?.trim()) {
        throw new Error('Le type de véhicule est requis');
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('requests')
        .insert({
          type: data.type,
          user_id: null, // Pas d'utilisateur connecté
          user_name: data.user_name,
          user_email: data.user_email,
          user_phone: data.user_phone,
          business_name: data.business_name,
          business_type: data.business_type,
          business_address: data.business_address,
          vehicle_type: data.vehicle_type,
          vehicle_plate: data.vehicle_plate,
          notes: data.notes,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createRequest,
    isSubmitting
  };
}; 