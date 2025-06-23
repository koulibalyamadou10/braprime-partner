import { supabase } from '@/lib/supabase'
import type { Inserts } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'customer' | 'partner'
  phone_number?: string
  address?: string
  profile_image?: string
}

export class AuthService {
  // Inscription d'un nouvel utilisateur
  static async signup(userData: {
    email: string
    password: string
    name: string
    role: 'customer' | 'partner'
    phone_number?: string
    address?: string
  }): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
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
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Erreur lors de la création du compte' }
      }

      // Le profil utilisateur sera créé automatiquement par le trigger
      // Vérifions qu'il a été créé
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.warn('Profil utilisateur non trouvé après création:', profileError.message)
        // Retourner quand même l'utilisateur auth, le profil sera créé par le trigger
        return { 
          user: {
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            phone_number: userData.phone_number,
            address: userData.address,
            profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`
          }, 
          error: null 
        }
      }

      return { user: profile, error: null }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      return { user: null, error: 'Erreur lors de l\'inscription' }
    }
  }

  // Connexion d'un utilisateur
  static async login(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Utilisateur non trouvé' }
      }

      // Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.warn('Profil utilisateur non trouvé lors de la connexion:', profileError.message)
        // Retourner les données de base de l'utilisateur auth
        return { 
          user: {
            id: authData.user.id,
            email: authData.user.email || '',
            name: authData.user.user_metadata?.name || 'Utilisateur',
            role: authData.user.user_metadata?.role || 'customer',
            phone_number: authData.user.user_metadata?.phone_number,
            address: authData.user.user_metadata?.address,
            profile_image: authData.user.user_metadata?.profile_image
          }, 
          error: null 
        }
      }

      return { user: profile, error: null }
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

      // Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.warn('Profil utilisateur non trouvé:', profileError.message)
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

      return { user: profile, error: null }
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
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          callback(profile)
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