import { supabase } from '@/lib/supabase';

export interface DriverRegistrationData {
  // Informations du chauffeur
  name: string;
  email: string;
  phone: string;
  
  // Informations du véhicule
  vehicle_type: 'Moto' | 'Voiture' | 'Camion' | 'Vélo';
  vehicle_plate?: string;
  
  // Type de chauffeur
  driver_type: 'independent' | 'service';
  
  // Informations supplémentaires
  experience_years?: number;
  availability_hours?: string;
  preferred_zones?: string[];
  notes?: string;
}

export interface DriverRegistrationResult {
  success: boolean;
  driver?: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
  message?: string;
  error?: string;
}

export class DriverRegistrationService {
  // Créer une demande de chauffeur
  static async createDriverRequest(data: DriverRegistrationData): Promise<DriverRegistrationResult> {
    try {
      console.log('Début création demande chauffeur:', { 
        ...data, 
        password: '[HIDDEN]'
      });

      // Étape 1: Créer directement dans la table drivers avec statut de demande
      const { data: driverData, error: driverError } = await supabase
        .rpc('create_driver_request', {
          p_name: data.name,
          p_email: data.email,
          p_phone: data.phone,
          p_vehicle_type: data.vehicle_type,
          p_vehicle_plate: data.vehicle_plate || '',
          p_driver_type: data.driver_type,
          p_experience_years: data.experience_years || 0,
          p_availability_hours: data.availability_hours || '',
          p_preferred_zones: data.preferred_zones || [],
          p_notes: data.notes || ''
        });

      if (driverError) {
        console.error('Erreur création demande chauffeur:', driverError);
        return { success: false, error: driverError.message };
      }

      console.log('Demande chauffeur créée avec succès, Driver ID:', driverData);

      // Étape 2: Envoyer les emails de notification (optionnel)
      try {
        // Préparer les données pour l'email de confirmation
        const emailData = {
          request_id: driverData,
          request_type: 'driver',
          user_name: data.name,
          user_email: data.email,
          user_phone: data.phone,
          vehicle_type: data.vehicle_type,
          vehicle_plate: data.vehicle_plate,
          notes: data.notes,
          submitted_at: new Date().toISOString()
        };

        console.log('Données email préparées:', emailData);
      } catch (emailError) {
        console.warn('Erreur lors de la préparation des emails:', emailError);
        // Ne pas faire échouer la création de la demande à cause des emails
      }

      // Étape 3: Ne PAS créer de compte utilisateur immédiatement
      // Le compte sera créé uniquement après approbation par l'admin
      console.log('Demande créée avec succès, en attente d\'approbation admin');

      return {
        success: true,
        driver: {
          id: driverData,
          name: data.name,
          email: data.email,
          status: 'pending'
        },
        message: 'Demande envoyée avec succès. Vous recevrez une notification après approbation.'
      };

    } catch (error) {
      console.error('Erreur lors de la création de la demande chauffeur:', error);
      return { success: false, error: 'Erreur lors de la création de la demande chauffeur' };
    }
  }

  // Vérifier si un email existe déjà
  static async checkEmailAvailability(email: string): Promise<{ available: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return { available: !data };
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      return { available: false, error: 'Erreur lors de la vérification' };
    }
  }

  // Vérifier si un numéro de téléphone existe déjà
  static async checkPhoneAvailability(phone: string): Promise<{ available: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('phone', phone)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return { available: !data };
    } catch (error) {
      console.error('Erreur lors de la vérification du téléphone:', error);
      return { available: false, error: 'Erreur lors de la vérification' };
    }
  }

  // Valider les données d'inscription
  static validateRegistrationData(data: DriverRegistrationData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation du nom
    if (!data.name?.trim()) {
      errors.push('Le nom est requis');
    } else if (data.name.length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    // Validation de l'email
    if (!data.email?.trim()) {
      errors.push('L\'email est requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    // Validation du téléphone
    if (!data.phone?.trim()) {
      errors.push('Le numéro de téléphone est requis');
    } else if (!/^\+?[0-9\s\-\(\)]{8,}$/.test(data.phone)) {
      errors.push('Le numéro de téléphone n\'est pas valide');
    }

    // Validation du type de véhicule
    if (!data.vehicle_type) {
      errors.push('Le type de véhicule est requis');
    }

    // Validation du type de chauffeur
    if (!data.driver_type) {
      errors.push('Le type de chauffeur est requis');
    }

    // Validation des années d'expérience
    if (data.experience_years && (data.experience_years < 0 || data.experience_years > 50)) {
      errors.push('Les années d\'expérience doivent être entre 0 et 50');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Obtenir les types de véhicules disponibles
  static getVehicleTypes(): Array<{ value: string; label: string; icon: string }> {
    return [
      { value: 'Moto', label: 'Moto', icon: '🏍️' },
      { value: 'Voiture', label: 'Voiture', icon: '🚗' },
      { value: 'Camion', label: 'Camion', icon: '🚛' },
      { value: 'Vélo', label: 'Vélo', icon: '🚲' }
    ];
  }

  // Obtenir les types de chauffeurs
  static getDriverTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      { 
        value: 'independent', 
        label: 'Chauffeur Indépendant', 
        description: 'Travaillez librement pour tous les commerces' 
      },
      { 
        value: 'service', 
        label: 'Chauffeur de Service', 
        description: 'Travaillez pour un commerce spécifique' 
      }
    ];
  }
} 