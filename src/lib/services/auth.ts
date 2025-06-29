import { supabase } from '@/lib/supabase'
import type { Inserts } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'customer' | 'partner' | 'driver' | 'admin'
  phone_number?: string
  address?: string
  profile_image?: string
  // Données spécifiques aux livreurs
  driver_id?: string
  vehicle_type?: string
  vehicle_plate?: string
  business_id?: number
  business_name?: string
}

export class AuthService {
  // Inscription d'un nouvel utilisateur
  static async signup(userData: {
    email: string
    password: string
    name: string
    role: 'customer' | 'partner' | 'driver'
    phone_number?: string
    address?: string
  }): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('Début de l\'inscription pour:', userData.email)
      
      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            phone_number: userData.phone_number,
            address: userData.address,
          }
        }
      })

      if (authError) {
        console.error('Erreur Supabase Auth:', authError)
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        console.error('Aucun utilisateur créé dans auth')
        return { user: null, error: 'Erreur lors de la création du compte' }
      }

      console.log('Utilisateur auth créé avec succès:', authData.user.id)

      // Créer manuellement le profil utilisateur dans user_profiles
      const roleId = userData.role === 'partner' ? 2 : userData.role === 'driver' ? 3 : 1
      const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`

      console.log('Création du profil utilisateur...')
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role_id: roleId,
          phone_number: userData.phone_number,
          address: userData.address,
          profile_image: profileImage,
          is_active: true
        })
        .select()
        .single()

      if (profileError) {
        console.error('Erreur création profil:', profileError)
        
        // Essayer de supprimer l'utilisateur auth si le profil n'a pas pu être créé
        try {
          await supabase.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error('Erreur lors de la suppression de l\'utilisateur auth:', deleteError)
        }
        
        return { user: null, error: `Erreur lors de la création du profil: ${profileError.message}` }
      }

      console.log('Profil utilisateur créé avec succès')

      return { 
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: userData.role,
          phone_number: profile.phone_number,
          address: profile.address,
          profile_image: profile.profile_image
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      return { user: null, error: 'Erreur lors de l\'inscription' }
    }
  }

  // Connexion d'un utilisateur
  static async login(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('Tentative de connexion pour:', email)
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('Erreur connexion:', authError)
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Utilisateur non trouvé' }
      }

      console.log('Connexion auth réussie, récupération du profil...')

      // Récupérer le profil utilisateur depuis user_profiles
      let { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          phone_number,
          address,
          profile_image,
          role_id,
          user_roles(name)
        `)
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.error('Erreur récupération profil:', profileError)
        
        // Si le profil n'existe pas, le créer automatiquement
        console.log('Profil non trouvé, création automatique...')
        const roleId = authData.user.user_metadata?.role === 'partner' ? 2 : authData.user.user_metadata?.role === 'driver' ? 3 : 1
        const name = authData.user.user_metadata?.name || 'Utilisateur'
        const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            name: name,
            email: authData.user.email || '',
            role_id: roleId,
            phone_number: authData.user.user_metadata?.phone_number,
            address: authData.user.user_metadata?.address,
            profile_image: profileImage,
            is_active: true
          })
          .select()
          .single()
          
        if (createError) {
          console.error('Erreur création profil automatique:', createError)
          // Retourner les données de base de l'utilisateur auth
          return { 
            user: {
              id: authData.user.id,
              email: authData.user.email || '',
              name: name,
              role: authData.user.user_metadata?.role || 'customer',
              phone_number: authData.user.user_metadata?.phone_number,
              address: authData.user.user_metadata?.address,
              profile_image: profileImage
            }, 
            error: null 
          }
        }
        
        profile = newProfile
      }

      // Déterminer le rôle basé sur role_id et le nom du rôle
      let role: string = 'customer'; // par défaut
      
      if (profile.user_roles?.name) {
        // Utiliser le nom du rôle depuis la table user_roles
        role = profile.user_roles.name;
      } else {
        // Fallback sur role_id si le nom n'est pas disponible
        switch (profile.role_id) {
          case 1:
            role = 'customer';
            break;
          case 2:
            role = 'partner';
            break;
          case 3:
            role = 'driver';
            break;
          case 4:
            role = 'admin';
            break;
          default:
            role = 'customer';
        }
      }

      // Debug: Afficher les informations de rôle
      console.log('🔍 [AuthService] Récupération rôle:', {
        role_id: profile.role_id,
        role_name: profile.user_roles?.name,
        role_determined: role,
        profile_id: profile.id
      });

      // Si c'est un livreur, récupérer les données spécifiques
      let driverData = null
      if (role === 'driver') {
        // Utiliser la relation directe driver_profiles → drivers
        const { data: driverProfile, error: driverError } = await supabase
          .from('driver_profiles')
          .select(`
            driver_id,
            drivers!inner(
              id,
              name,
              phone,
              email,
              vehicle_type,
              vehicle_plate,
              business_id,
              businesses!inner(name)
            )
          `)
          .eq('user_id', authData.user.id)
          .single()

        if (!driverError && driverProfile) {
          driverData = {
            driver_id: driverProfile.driver_id,
            vehicle_type: driverProfile.drivers.vehicle_type,
            vehicle_plate: driverProfile.drivers.vehicle_plate,
            business_id: driverProfile.drivers.business_id,
            business_name: driverProfile.drivers.businesses.name
          }
        }
      }

      return { 
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: role,
          phone_number: profile.phone_number,
          address: profile.address,
          profile_image: profile.profile_image,
          // Données spécifiques aux livreurs
          ...(driverData && {
            driver_id: driverData.driver_id,
            vehicle_type: driverData.vehicle_type,
            vehicle_plate: driverData.vehicle_plate,
            business_id: driverData.business_id,
            business_name: driverData.business_name
          })
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      return { user: null, error: 'Erreur lors de la connexion' }
    }
  }

  // Déconnexion
  static async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      return { error: 'Erreur lors de la déconnexion' }
    }
  }

  // Récupérer l'utilisateur actuel
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        return { user: null, error: authError?.message || 'Utilisateur non connecté' }
      }

      // Récupérer le profil utilisateur depuis user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          phone_number,
          address,
          profile_image,
          role_id,
          user_roles(name)
        `)
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Erreur récupération profil:', profileError)
        // Retourner les données de base de l'utilisateur auth
        return { 
          user: {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || 'Utilisateur',
            role: authUser.user_metadata?.role || 'customer',
            phone_number: authUser.user_metadata?.phone_number,
            address: authUser.user_metadata?.address,
            profile_image: authUser.user_metadata?.profile_image
          }, 
          error: null 
        }
      }

      // Déterminer le rôle basé sur role_id et le nom du rôle
      let role: string = 'customer'; // par défaut
      
      if (profile.user_roles?.name) {
        // Utiliser le nom du rôle depuis la table user_roles
        role = profile.user_roles.name;
      } else {
        // Fallback sur role_id si le nom n'est pas disponible
        switch (profile.role_id) {
          case 1:
            role = 'customer';
            break;
          case 2:
            role = 'partner';
            break;
          case 3:
            role = 'driver';
            break;
          case 4:
            role = 'admin';
            break;
          default:
            role = 'customer';
        }
      }

      // Debug: Afficher les informations de rôle
      console.log('🔍 [AuthService] Récupération rôle:', {
        role_id: profile.role_id,
        role_name: profile.user_roles?.name,
        role_determined: role,
        profile_id: profile.id
      });

      // Si c'est un livreur, récupérer les données spécifiques
      let driverData = null
      if (role === 'driver') {
        // Utiliser la relation directe driver_profiles → drivers
        const { data: driverProfile, error: driverError } = await supabase
          .from('driver_profiles')
          .select(`
            driver_id,
            drivers!inner(
              id,
              name,
              phone,
              email,
              vehicle_type,
              vehicle_plate,
              business_id,
              businesses!inner(name)
            )
          `)
          .eq('user_id', authUser.id)
          .single()

        if (!driverError && driverProfile) {
          driverData = {
            driver_id: driverProfile.driver_id,
            vehicle_type: driverProfile.drivers.vehicle_type,
            vehicle_plate: driverProfile.drivers.vehicle_plate,
            business_id: driverProfile.drivers.business_id,
            business_name: driverProfile.drivers.businesses.name
          }
        }
      }

      return { 
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: role,
          phone_number: profile.phone_number,
          address: profile.address,
          profile_image: profile.profile_image,
          // Données spécifiques aux livreurs
          ...(driverData && {
            driver_id: driverData.driver_id,
            vehicle_type: driverData.vehicle_type,
            vehicle_plate: driverData.vehicle_plate,
            business_id: driverData.business_id,
            business_name: driverData.business_name
          })
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      return { user: null, error: 'Erreur lors de la récupération de l\'utilisateur' }
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateProfile(userId: string, updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: profile, error: null }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      return { user: null, error: 'Erreur lors de la mise à jour du profil' }
    }
  }

  // Écouter les changements d'authentification
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select(`
            id,
            name,
            email,
            phone_number,
            address,
            profile_image,
            role_id,
            user_roles(name)
          `)
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          // Déterminer le rôle basé sur role_id et le nom du rôle
          let role: string = 'customer'; // par défaut
          
          if (profile.user_roles?.name) {
            // Utiliser le nom du rôle depuis la table user_roles
            role = profile.user_roles.name;
          } else {
            // Fallback sur role_id si le nom n'est pas disponible
            switch (profile.role_id) {
              case 1:
                role = 'customer';
                break;
              case 2:
                role = 'partner';
                break;
              case 3:
                role = 'driver';
                break;
              case 4:
                role = 'admin';
                break;
              default:
                role = 'customer';
            }
          }
          
          callback({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: role,
            phone_number: profile.phone_number,
            address: profile.address,
            profile_image: profile.profile_image
          })
        } else {
          // Fallback vers les données de session
          callback({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Utilisateur',
            role: session.user.user_metadata?.role || 'customer',
            phone_number: session.user.user_metadata?.phone_number,
            address: session.user.user_metadata?.address,
            profile_image: session.user.user_metadata?.profile_image
          })
        }
      } else if (event === 'SIGNED_OUT') {
        callback(null)
      }
    })
  }
} 