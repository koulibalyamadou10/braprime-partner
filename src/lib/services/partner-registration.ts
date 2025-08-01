import { supabase } from '@/lib/supabase';
import { BusinessTypeDB } from '@/lib/types';

// Types pour les emails
interface RequestConfirmationData {
  request_id: string;
  request_type: 'partner' | 'driver';
  user_name: string;
  user_email: string;
  user_phone: string;
  business_name?: string;
  business_type?: string;
  business_address?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  selected_plan_name?: string;
  selected_plan_price?: number;
  notes?: string;
  submitted_at: string;
}

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
  
  // Plan sélectionné
  selectedPlan?: {
    id: string
    name: string
    price: number
  } | null
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
  request?: {
    id: string
    status: string
    email: string
  }
  message?: string
  error?: string
}

export class PartnerRegistrationService {
  // Créer une demande de partenariat avec plan sélectionné
  static async createPartnerAccount(data: PartnerRegistrationData): Promise<PartnerRegistrationResult> {
    try {
      console.log('Début création demande partenaire:', { 
        ...data, 
        password: '[HIDDEN]',
        selectedPlan: data.selectedPlan 
      })

      // Convertir l'ID du plan en plan_type (format avec underscore)
      let planType = data.selectedPlan?.id || '1_month'
      if (planType.includes('-')) {
        planType = planType.replace(/-/g, '_')
        console.log('Conversion du type de plan:', data.selectedPlan?.id, '→', planType)
      }

      // Étape 1: Créer directement dans la table businesses avec statut de demande
      const { data: businessData, error: businessError } = await supabase
        .rpc('create_partner_request', {
          p_owner_name: data.owner_name,
          p_owner_email: data.owner_email,
          p_owner_phone: data.owner_phone,
          p_business_name: data.business_name,
          p_business_type: data.business_type,
          p_business_address: data.business_address,
          p_business_phone: data.business_phone,
          p_business_email: data.business_email,
          p_business_description: data.business_description,
          p_opening_hours: data.opening_hours,
          p_delivery_radius: data.delivery_radius,
          p_cuisine_type: data.cuisine_type || '',
          p_specialties: data.specialties || [],
          p_plan_type: planType,
          p_notes: data.selectedPlan 
            ? `Plan sélectionné: ${data.selectedPlan.name} - ${data.selectedPlan.price.toLocaleString()} FG`
            : 'Aucun plan sélectionné'
        })

      if (businessError) {
        console.error('Erreur création demande partenaire:', businessError)
        return { success: false, error: businessError.message }
      }

      console.log('Demande partenaire créée avec succès, Business ID:', businessData)

      // Étape 2: Envoyer les emails de notification (optionnel - peut être géré côté frontend)
      try {
        // Préparer les données pour l'email de confirmation
        const emailData: RequestConfirmationData = {
          request_id: businessData.toString(), // Utiliser l'ID du business comme request_id
          request_type: 'partner',
          user_name: data.owner_name,
          user_email: data.owner_email,
          user_phone: data.owner_phone,
          business_name: data.business_name,
          business_type: data.business_type,
          business_address: data.business_address,
          selected_plan_name: data.selectedPlan?.name,
          selected_plan_price: data.selectedPlan?.price,
          notes: data.business_description,
          submitted_at: new Date().toISOString()
        };

        // L'envoi d'email sera géré par le composant frontend
        console.log('Données email préparées:', emailData);
      } catch (emailError) {
        console.warn('Erreur lors de la préparation des emails:', emailError);
        // Ne pas faire échouer la création de la demande à cause des emails
      }

      // Étape 3: Ne PAS créer de compte utilisateur immédiatement
      // Le compte sera créé uniquement après approbation par l'admin
      console.log('Demande créée avec succès, en attente d\'approbation admin')

      return {
        success: true,
        business: {
          id: businessData,
          name: data.business_name,
          type: data.business_type
        },
        message: 'Demande envoyée avec succès. Vous recevrez une notification après approbation.'
      }

    } catch (error) {
      console.error('Erreur lors de la création de la demande partenaire:', error)
      return { success: false, error: 'Erreur lors de la création de la demande partenaire' }
    }
  }

  // Obtenir l'ID du type de business
  private static async getBusinessTypeId(businessType: string): Promise<number> {
    const typeMap: Record<string, string> = {
      'restaurant': 'Restaurant',
      'cafe': 'Café',
      'market': 'Marché',
      'supermarket': 'Supermarché',
      'pharmacy': 'Pharmacie',
      'electronics': 'Électronique',
      'beauty': 'Beauté',
      'other': 'Autre'
    }

    const businessTypeName = typeMap[businessType] || 'Autre'

    // Récupérer l'ID depuis la base de données
    const { data: businessTypeData, error: businessTypeError } = await supabase
      .from('business_types')
      .select('id')
      .eq('name', businessTypeName)
      .single()

    if (businessTypeError || !businessTypeData) {
      console.error('Erreur récupération type de business:', businessTypeError)
      throw new Error(`Type de business '${businessTypeName}' non trouvé dans la base de données`)
    }

    return businessTypeData.id
  }

  // Créer les catégories de menu basées sur le type de business
  private static async createDefaultMenuCategories(businessId: number, businessTypeId: number) {
    try {
      // Récupérer les templates de catégories pour ce type de business
      const { data: templates, error: templateError } = await supabase
        .from('business_type_menu_templates')
        .select('category_name, category_description, sort_order')
        .eq('business_type_id', businessTypeId)
        .order('sort_order')

      if (templateError) {
        console.error('Erreur récupération templates catégories:', templateError)
        // Fallback vers les catégories par défaut
        await this.createFallbackCategories(businessId)
        return
      }

      if (!templates || templates.length === 0) {
        console.log('Aucun template trouvé pour le type de business:', businessTypeId)
        // Fallback vers les catégories par défaut
        await this.createFallbackCategories(businessId)
        return
      }

      // Créer les catégories basées sur les templates
      for (const template of templates) {
        await supabase
          .from('menu_categories')
          .insert({
            name: template.category_name,
            description: template.category_description,
            business_id: businessId,
            is_active: true,
            sort_order: template.sort_order
          })
      }

      console.log(`Catégories créées pour le business ${businessId} avec ${templates.length} templates`)
    } catch (error) {
      console.error('Erreur création catégories par template:', error)
      // Fallback vers les catégories par défaut
      await this.createFallbackCategories(businessId)
    }
  }

  // Catégories de fallback en cas d'erreur
  private static async createFallbackCategories(businessId: number) {
    const fallbackCategories = [
      { name: 'Entrées', description: 'Entrées et apéritifs', sort_order: 1 },
      { name: 'Plats principaux', description: 'Plats principaux', sort_order: 2 },
      { name: 'Desserts', description: 'Desserts et pâtisseries', sort_order: 3 },
      { name: 'Boissons', description: 'Boissons et rafraîchissements', sort_order: 4 }
    ]

    for (const category of fallbackCategories) {
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
  static async getBusinessTypes(): Promise<BusinessTypeDB[]> {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select('*')
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