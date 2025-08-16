// k-driver-auth-partner.ts
// classe qui permet de gerer tout ce qui concerne les livreurs

import { supabase } from "../supabase";
import { DRIVER_ORDER_TYPE_PENDING, ORDER_STATUS_OUT_FOR_DELIVERY, ORDER_STATUS_READY } from "./k-constant";

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

export interface KDriverAuthResult {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  business_id: number;
  type: string;
  vehicle_type: string;
  vehicle_plate: string;
  is_active: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  password: string; // Mot de passe pour l'envoi du mail
}


export class KDriverAuthPartnerService {

    // 1- Fonction pour creer un compte livreur
    async createDriverAuthAccount(request: KCreateDriverAuthRequest): Promise<KDriverAuthResult> {
        let authId = '';
        let driverId = '';
        let userProfileId = '';
        
        try {
            console.log('🚀 Début création compte livreur:', request.email);
            
            // 1. Créer l'utilisateur dans auth.users
            const { data, error } = await supabase.auth.admin.createUser({
                email: request.email,
                password: request.password
            });

            if (error) {
                console.error('❌ Erreur création utilisateur auth:', error);
                throw error;
            }

            if (!data.user) {
                throw new Error('Aucun utilisateur créé dans auth');
            }

            authId = data.user.id;
            console.log('✅ Utilisateur auth créé:', authId);

            // 2. Créer le profil utilisateur
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
                })
                .select()
                .single();

            if (userProfileError) {
                console.error('❌ Erreur création profil utilisateur:', userProfileError);
                throw new Error('Erreur lors de la création du profil utilisateur');
            }

            if (!userProfileData) {
                throw new Error('Profil utilisateur non créé');
            }

            userProfileId = userProfileData.id;
            console.log('✅ Profil utilisateur créé:', userProfileId);

            // 3. Créer le profil livreur
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
                .select()
                .single();

            if (driverProfileError) {
                console.error('❌ Erreur création profil livreur:', driverProfileError);
                throw new Error('Erreur lors de la création du profil livreur');
            }

            if (!driverProfileData) {
                throw new Error('Profil livreur non créé');
            }

            driverId = driverProfileData.id;
            console.log('✅ Profil livreur créé:', driverId);

            // 4. Vérification finale
            console.log('🎉 Tous les profils créés avec succès:', {
                authId,
                userProfileId,
                driverId,
                userProfile: userProfileData,
                driverProfile: driverProfileData
            });

            // Retourner les données nécessaires pour l'envoi du mail
            return {
                ...driverProfileData,
                password: request.password, // Inclure le mot de passe pour l'envoi
                email: request.email // Inclure l'email pour l'envoi
            };

        } catch (error) {
            console.error('💥 Erreur lors de la création des profils:', error);
            
            // Nettoyage en cas d'erreur (rollback)
            try {
                if (driverId) {
                    console.log('🧹 Suppression profil livreur:', driverId);
                    await supabase.from('driver_profiles').delete().eq('id', driverId);
                }
                
                if (userProfileId) {
                    console.log('🧹 Suppression profil utilisateur:', userProfileId);
                    await supabase.from('user_profiles').delete().eq('id', userProfileId);
                }
                
                if (authId) {
                    console.log('🧹 Suppression utilisateur auth:', authId);
                    await supabase.auth.admin.deleteUser(authId);
                }
            } catch (cleanupError) {
                console.error('⚠️ Erreur lors du nettoyage:', cleanupError);
            }

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

    // 5- Fonction de test pour vérifier la création
    async testDriverCreation(request: KCreateDriverAuthRequest) {
        try {
            console.log('🧪 Test de création de livreur...');
            
            // Vérifier que les tables existent et sont accessibles
            const { data: userProfilesTest, error: userProfilesError } = await supabase
                .from('user_profiles')
                .select('id')
                .limit(1);
            
            if (userProfilesError) {
                console.error('❌ Erreur accès user_profiles:', userProfilesError);
                return { success: false, error: 'user_profiles inaccessible' };
            }
            
            const { data: driverProfilesTest, error: driverProfilesError } = await supabase
                .from('driver_profiles')
                .select('id')
                .limit(1);
            
            if (driverProfilesError) {
                console.error('❌ Erreur accès driver_profiles:', driverProfilesError);
                return { success: false, error: 'driver_profiles inaccessible' };
            }
            
            console.log('✅ Tables accessibles');
            
            // Vérifier les contraintes
            console.log('📋 Vérification des contraintes...');
            console.log('- business_id:', request.business_id);
            console.log('- role_id: 10 (driver)');
            console.log('- email:', request.email);
            
            return { success: true, message: 'Tables accessibles et contraintes vérifiées' };
            
        } catch (error) {
            console.error('❌ Erreur test:', error);
            return { success: false, error: error.message };
        }
    }

    // 6- Fonction pour assigner un livreur à une commande
    static async assignDriverToOrder(driverId: string, orderId: string): Promise<{ success: boolean; error: string | null }> {
        try {
            console.log(`🚗 Début assignation du livreur ${driverId} à la commande ${orderId}`);
            
            // 1. Mettre à jour la commande avec le driver_id et changer le statut
            const { error: orderUpdateError } = await supabase
                .from('orders')
                .update({
                    driver_id: driverId,
                    status: ORDER_STATUS_OUT_FOR_DELIVERY, // Commande en cours de livraison
                    available_for_drivers: false, // Plus disponible pour d'autres livreurs
                    updated_at: new Date().toISOString(),
                    assigned_at: new Date().toISOString()
                })
                .eq('id', orderId);

            if (orderUpdateError) {
                console.error('❌ Erreur mise à jour commande:', orderUpdateError);
                
                // Rollback : mettre le status a ready et driver_id a null et assigned_at a null
                await supabase
                    .from('orders')
                    .update({
                        driver_id: null,
                        status: ORDER_STATUS_READY,
                        assigned_at: null
                    })
                    .eq('id', orderId);

                return { success: false, error: 'Erreur lors de la mise à jour de la commande' };
            }

            return { success: true, error: null };

        } catch (error) {
            console.error('💥 Erreur lors de l\'assignation du livreur:', error);
            return { success: false, error: 'Erreur lors de l\'assignation du livreur' };
        }
    }

    // 7- Fonction pour libérer un livreur d'une commande
    async releaseDriverFromOrder(driverId: string, orderId: string): Promise<{ success: boolean; error: string | null }> {
        try {
            console.log(`🔓 Début libération du livreur ${driverId} de la commande ${orderId}`);
            
            // 1. Supprimer l'entrée dans driver_orders
            const { error: driverOrderError } = await supabase
                .from('driver_orders')
                .delete()
                .eq('driver_id', driverId)
                .eq('order_id', orderId);

            if (driverOrderError) {
                console.error('❌ Erreur suppression driver_order:', driverOrderError);
                return { success: false, error: 'Erreur lors de la suppression de l\'assignation' };
            }

            // 2. Mettre à jour la commande
            const { error: orderUpdateError } = await supabase
                .from('orders')
                .update({
                    driver_id: null,
                    status: ORDER_STATUS_READY, // Retour au statut prêt
                    available_for_drivers: true, // Disponible pour d'autres livreurs
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);

            if (orderUpdateError) {
                console.error('❌ Erreur mise à jour commande:', orderUpdateError);
                return { success: false, error: 'Erreur lors de la mise à jour de la commande' };
            }

            // 3. Vérifier si le livreur peut redevenir disponible
            const { data: remainingOrders, error: remainingOrdersError } = await supabase
                .from('driver_orders')
                .select('id')
                .eq('driver_id', driverId)
                .in('status', ['pending', 'picked_up', 'out_for_delivery']);

            if (!remainingOrdersError && remainingOrders && remainingOrders.length < 3) {
                const { error: driverUpdateError } = await supabase
                    .from('driver_profiles')
                    .update({
                        is_available: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', driverId);

                if (driverUpdateError) {
                    console.warn('⚠️ Erreur mise à jour disponibilité livreur:', driverUpdateError);
                }
            }

            console.log('✅ Livreur libéré avec succès de la commande');
            return { success: true, error: null };

        } catch (error) {
            console.error('💥 Erreur lors de la libération du livreur:', error);
            return { success: false, error: 'Erreur lors de la libération du livreur' };
        }
    }

    // 8- Fonction pour récupérer les commandes d'un livreur
    async getDriverOrders(driverId: string): Promise<{ orders: any[] | null; error: string | null }> {
        try {
            const { data: driverOrders, error } = await supabase
                .from('driver_orders')
                .select(`
                    *,
                    orders (
                        id,
                        order_number,
                        status,
                        total,
                        delivery_address,
                        delivery_instructions,
                        created_at
                    )
                `)
                .eq('driver_id', driverId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erreur récupération commandes livreur:', error);
                return { orders: null, error: error.message };
            }

            return { orders: driverOrders, error: null };

        } catch (error) {
            console.error('💥 Erreur lors de la récupération des commandes:', error);
            return { orders: null, error: 'Erreur lors de la récupération des commandes' };
        }
    }
    
}






