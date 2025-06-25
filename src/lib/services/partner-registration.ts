import { supabase } from '@/lib/supabase'

export interface PartnerRegistrationData {
  // Informations du propriétaire
  owner_name: string
  owner_email: string
  owner_phone: string
  password: string
  
  // Informations du commerce
  business_name: string
  business_type: 'restaurant' | 'cafe' | 'market' | 'supermarket' | 'pharmacy' | 'electronics' | 'beauty' | 'other'
  business_address: string
  business_phone: string
  business_email: string
  business_description: string
  opening_hours: string
  delivery_radius: number
  cuisine_type?: string
  specialties?: string[]
}

export interface PartnerRegistrationResult {
  success: boolean
  user?: {
    id: string
    email: string
    role: string
  }
  business?: {
    id: number
    name: string
    type: string
  }
  error?: string
}

export class PartnerRegistrationService {
  // Créer un compte partenaire complet
  static async createPartnerAccount(data: PartnerRegistrationData): Promise<PartnerRegistrationResult> {
    try {
      console.log('Début création compte partenaire:', { ...data, password: '[HIDDEN]' })

      // Étape 1: Créer l'utilisateur dans auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.owner_email,
        password: data.password,
        options: {
          data: {
            name: data.owner_name,
            phone: data.owner_phone,
            role: 'partner'
          }
        }
      })

      if (authError) {
        console.error('Erreur création utilisateur auth:', authError)
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'Erreur lors de la création de l\'utilisateur' }
      }

      const userId = authData.user.id
      console.log('Utilisateur auth créé avec succès:', userId)

      // Étape 2: Créer le profil utilisateur avec le rôle partner
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          name: data.owner_name,
          email: data.owner_email,
          role_id: 2, // ID du rôle 'partner' dans user_roles
          phone_number: data.owner_phone,
          is_active: true
        })

      if (profileError) {
        console.error('Erreur création profil utilisateur:', profileError)
        // Nettoyer l'utilisateur auth créé
        await supabase.auth.admin.deleteUser(userId)
        return { success: false, error: profileError.message }
      }

      console.log('Profil utilisateur créé avec succès')

      // Étape 3: Créer le business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: data.business_name,
          description: data.business_description,
          business_type_id: await this.getBusinessTypeId(data.business_type),
          address: data.business_address,
          phone: data.business_phone,
          email: data.business_email,
          opening_hours: data.opening_hours,
          cuisine_type: data.cuisine_type,
          owner_id: userId,
          is_active: true,
          is_open: true
        })
        .select()
        .single()

      if (businessError) {
        console.error('Erreur création business:', businessError)
        // Nettoyer les données créées
        await supabase.from('user_profiles').delete().eq('id', userId)
        await supabase.auth.admin.deleteUser(userId)
        return { success: false, error: businessError.message }
      }

      console.log('Business créé avec succès:', businessData.id)

      // Étape 4: Créer les catégories de menu par défaut si c'est un restaurant
      if (data.business_type === 'restaurant') {
        await this.createDefaultMenuCategories(businessData.id)
      }

      return {
        success: true,
        user: {
          id: userId,
          email: data.owner_email,
          role: 'partner'
        },
        business: {
          id: businessData.id,
          name: data.business_name,
          type: data.business_type
        }
      }

    } catch (error) {
      console.error('Erreur lors de la création du compte partenaire:', error)
      return { success: false, error: 'Erreur lors de la création du compte partenaire' }
    }
  }

  // Obtenir l'ID du type de business
  private static async getBusinessTypeId(businessType: string): Promise<number> {
    const typeMap: Record<string, number> = {
      'restaurant': 1,
      'cafe': 2,
      'market': 3,
      'supermarket': 4,
      'pharmacy': 5,
      'electronics': 6,
      'beauty': 7,
      'other': 8
    }

    return typeMap[businessType] || 8 // Par défaut 'other'
  }

  // Créer les catégories de menu par défaut pour un restaurant
  private static async createDefaultMenuCategories(businessId: number) {
    const defaultCategories = [
      { name: 'Entrées', description: 'Entrées et apéritifs', sort_order: 1 },
      { name: 'Plats principaux', description: 'Plats principaux', sort_order: 2 },
      { name: 'Desserts', description: 'Desserts et pâtisseries', sort_order: 3 },
      { name: 'Boissons', description: 'Boissons et rafraîchissements', sort_order: 4 }
    ]

    for (const category of defaultCategories) {
      await supabase
        .from('menu_categories')
        .insert({
          ...category,
          business_id: businessId,
          is_active: true
        })
    }
  }

  // Vérifier si un email est déjà utilisé
  static async checkEmailAvailability(email: string): Promise<{ available: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { available: false, error: error.message }
      }

      return { available: !data }
    } catch (error) {
      return { available: false, error: 'Erreur lors de la vérification de l\'email' }
    }
  }

  // Vérifier si un nom de business est déjà utilisé
  static async checkBusinessNameAvailability(businessName: string): Promise<{ available: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('name')
        .eq('name', businessName)
        .single()

      if (error && error.code !== 'PGRST116') {
        return { available: false, error: error.message }
      }

      return { available: !data }
    } catch (error) {
      return { available: false, error: 'Erreur lors de la vérification du nom du business' }
    }
  }

  // Obtenir les types de business disponibles
  static async getBusinessTypes(): Promise<{ id: number; name: string; icon: string; color: string }[]> {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select('id, name, icon, color')
        .order('name')

      if (error) {
        console.error('Erreur récupération types business:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des types de business:', error)
      return []
    }
  }

  // Valider les données de création de compte
  static validateRegistrationData(data: PartnerRegistrationData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validation des informations du propriétaire
    if (!data.owner_name?.trim()) errors.push('Le nom du propriétaire est requis')
    if (!data.owner_email?.trim()) errors.push('L\'email du propriétaire est requis')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.owner_email)) {
      errors.push('Format d\'email invalide')
    }
    if (!data.owner_phone?.trim()) errors.push('Le téléphone du propriétaire est requis')
    if (!data.password?.trim()) errors.push('Le mot de passe est requis')
    if (data.password && data.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères')
    }

    // Validation des informations du business
    if (!data.business_name?.trim()) errors.push('Le nom du commerce est requis')
    if (!data.business_type) errors.push('Le type de commerce est requis')
    if (!data.business_address?.trim()) errors.push('L\'adresse du commerce est requise')
    if (!data.business_phone?.trim()) errors.push('Le téléphone du commerce est requis')
    if (!data.business_email?.trim()) errors.push('L\'email du commerce est requis')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.business_email)) {
      errors.push('Format d\'email du commerce invalide')
    }
    if (!data.business_description?.trim()) errors.push('La description du commerce est requise')
    if (!data.opening_hours?.trim()) errors.push('Les horaires d\'ouverture sont requis')
    if (!data.delivery_radius || data.delivery_radius < 1) {
      errors.push('Le rayon de livraison doit être d\'au moins 1km')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
} 