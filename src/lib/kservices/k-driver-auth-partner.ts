// k-driver-auth-partner.ts
// classe qui permet de gerer tout ce qui concerne les livreurs

import { supabase } from "../supabase";

export interface KCreateDriverAuthRequest {
  id?: string;
  email: string;
  password: string;
  business_id: number;
  name: string;
  phone_number: string;
  type: string;
  vehicle_type: string;
  vehicle_plate: string;
  is_active?: boolean;
}


export class KDriverAuthPartnerService {

    // 1- Fonction pour creer un compte livreur
    async createDriverAuthAccount(request: KCreateDriverAuthRequest) {
        // inscrire dans la table auth.users de supabase avec une rpc
        const { data, error } = await supabase.auth.admin.createUser({
            email: request.email,
            password: request.password
        });

        console.log('data', data);

        if (error) {
            throw error;
        }

        // l'inscrire dans la table user_profile
        const { data: userProfileData, error: userProfileError } = await supabase
            .from('user_profiles')
            .insert({
                id: data.user.id,
                business_id: request.business_id,
                name: request.name,
            })

        // inscrire dans la table driver_profiles et selectionner toutes les donnees de la table driver_profiles
        const { data: driverProfileData, error: driverProfileError } = await supabase
            .from('driver_profiles')
            .insert({
                id: data.user.id,
                business_id: request.business_id,
                name: request.name,
                phone_number: request.phone_number,
                email: request.email,
                type: request.type,
                vehicle_type: request.vehicle_type,
                vehicle_plate: request.vehicle_plate
            })

        console.log('driverProfileData', driverProfileData);
        console.log('driverProfileError', driverProfileError);

        if (driverProfileError) {
            throw driverProfileError;
        }

        console.log('driverProfileData', driverProfileData);

        return driverProfileData;
    }

    // 2- Fonction pour recuperer les livreurs
    async getDrivers(business_id: number) {
        const { data, error } = await supabase
            .from('driver_profiles')
            .select('*')
            .eq('business_id', business_id);

        if (error) {
            throw error;
        }

        return data;
    }

    // 3- Fonction pour supprimer un livreur (mettre is_active à false)
    async deleteDriver(driver_id: string) {
        const { data, error } = await supabase
            .from('driver_profiles')
            .update({ is_active: false })
            .eq('id', driver_id);

        if (error) {
            throw error;
        }

        return data;
    }

    // 4- Fonction pour mettre à jour un livreur
    async updateDriver(driver_id: string, updates: Partial<KCreateDriverAuthRequest>) {
        const { data, error } = await supabase
            .from('driver_profiles')
            .update(updates)
            .eq('id', driver_id);

        if (error) {
            throw error;
        }

        return data;
    }
}






