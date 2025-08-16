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
        let authId = '';
        let driverId = '';
        let userProfileId = '';
        try {
            // inscrire dans la table auth.users de supabase avec une rpc
        const { data, error } = await supabase.auth.admin.createUser({
            email: request.email,
            password: request.password
        });

        
        
        
        if (error) {
            console.error('Erreur création utilisateur:', error)
            throw error;
        }

        console.log('data', data);
        authId = data.user.id;
        
        // l'inscrire dans la table user_profile
        const { data: userProfileData, error: userProfileError } = await supabase
            .from('user_profiles')
            .insert({
                id: data.user.id,
                name: request.name,
                email: request.email,
                phone_number: request.phone_number,
                role_id: 10, // ID du rôle 'driver' dans user_roles
                is_active: true,
                is_verified: false
            }).select().single();

            
            if (userProfileError) {
                console.error('Erreur création profil utilisateur:', userProfileError)
                throw new Error('Erreur lors de la création du profil utilisateur')
            }
            
            userProfileId = userProfileData.id;
        // inscrire dans la table driver_profiles avec le même ID
        const { data: driverProfileData, error: driverProfileError } = await supabase
            .from('driver_profiles')
            .insert({
                id: data.user.id, // Même ID que user_profiles et auth.users
                business_id: request.business_id,
                name: request.name,
                phone_number: request.phone_number,
                email: request.email,
                type: request.type,
                vehicle_type: request.vehicle_type,
                vehicle_plate: request.vehicle_plate,
                is_active: true,
                is_available: true
            })
            .select().single();

            if (driverProfileError) {
                console.error('Erreur création profil livreur:', driverProfileError)
                throw new Error('Erreur lors de la création du profil livreur')
            }

            driverId = driverProfileData.id;

        // Vérifier que les deux profils ont été créés avec succès
        if (!userProfileData || !driverProfileData) {
            throw new Error('Erreur lors de la création des profils')
        }

        console.log('Profils créés avec succès:', {
            userProfile: userProfileData,
            driverProfile: driverProfileData
        })

        return driverProfileData;
        } catch (error) {
            // supprimer les donnees en cas d'incoherence dans l'execution
            if (authId) {
                await supabase.auth.admin.deleteUser(authId);
            }
            if (userProfileId) {
                await supabase.from('user_profiles').delete().eq('id', userProfileId);
            }
            if (driverId) {
                await supabase.from('driver_profiles').delete().eq('id', driverId);
            }

            console.error('Erreur lors de la création des profils:', error)
            throw error;
        }
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






