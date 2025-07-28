import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useEmailService } from '@/hooks/use-email-service'
import { PartnerRegistrationData, PartnerRegistrationService } from '@/lib/services/partner-registration'
import { ArrowLeft, ArrowRight, Building2, CheckCircle, DollarSign, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface PartnerRegistrationFormProps {
  onSuccess?: (result: any) => void
  onCancel?: () => void
  selectedPlan?: {
    id: string;
    name: string;
    price: number;
  } | null;
}

const businessTypes = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'market', label: 'Marché' },
  { value: 'supermarket', label: 'Supermarché' },
  { value: 'pharmacy', label: 'Pharmacie' },
  { value: 'electronics', label: 'Électronique' },
  { value: 'beauty', label: 'Beauté' },
  { value: 'other', label: 'Autre' }
]

const cuisineTypes = [
  'Africaine', 'Asiatique', 'Européenne', 'Américaine', 'Méditerranéenne', 
  'Indienne', 'Mexicaine', 'Italienne', 'Française', 'Japonaise', 'Chinoise',
  'Thaïlandaise', 'Vietnamienne', 'Libanaise', 'Marocaine', 'Autre'
]

export function PartnerRegistrationForm({ onSuccess, onCancel, selectedPlan }: PartnerRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const { sendPartnerRequestEmails } = useEmailService()
  
  const [formData, setFormData] = useState<PartnerRegistrationData>({
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    password: '',
    business_name: '',
    business_type: 'restaurant',
    business_address: '',
    business_phone: '',
    business_email: '',
    business_description: '',
    opening_hours: '',
    delivery_radius: 5,
    cuisine_type: '',
    specialties: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Validation en temps réel
  useEffect(() => {
    const validation = PartnerRegistrationService.validateRegistrationData(formData)
    setValidationErrors(validation.errors)
  }, [formData])

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.owner_name.trim()) newErrors.owner_name = 'Le nom est requis'
      if (!formData.owner_email.trim()) newErrors.owner_email = 'L\'email est requis'
      else if (!/\S+@\S+\.\S+/.test(formData.owner_email)) newErrors.owner_email = 'Email invalide'
      if (!formData.owner_phone.trim()) newErrors.owner_phone = 'Le téléphone est requis'
      if (!formData.password.trim()) newErrors.password = 'Le mot de passe est requis'
      else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    if (currentStep === 2) {
      if (!formData.business_name.trim()) newErrors.business_name = 'Le nom du commerce est requis'
      if (!formData.business_address.trim()) newErrors.business_address = 'L\'adresse est requise'
      if (!formData.business_phone.trim()) newErrors.business_phone = 'Le téléphone du commerce est requis'
      if (!formData.business_email.trim()) newErrors.business_email = 'L\'email du commerce est requis'
      else if (!/\S+@\S+\.\S+/.test(formData.business_email)) newErrors.business_email = 'Email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return
    if (validationErrors.length > 0) {
      toast.error('Veuillez corriger les erreurs de validation')
      return
    }

    setIsSubmitting(true)
    try {
      // Inclure le plan sélectionné dans les données
      const registrationData = {
        ...formData,
        selectedPlan: selectedPlan
      }
      
      // Étape 1: Créer la demande
      const result = await PartnerRegistrationService.createPartnerAccount(registrationData)
                
      if (result.success) {
        // Étape 2: Envoyer les emails de notification
        try {
          await sendPartnerRequestEmails({
            request_id: result.request?.id || '',
            user_name: formData.owner_name,
            user_email: formData.owner_email,
            user_phone: formData.owner_phone,
            business_name: formData.business_name,
            business_type: formData.business_type,
            business_address: formData.business_address,
            selected_plan_name: selectedPlan?.name,
            selected_plan_price: selectedPlan?.price,
            notes: formData.business_description,
            submitted_at: new Date().toISOString()
          });
        } catch (emailError) {
          console.warn('Erreur lors de l\'envoi des emails:', emailError);
          // Ne pas faire échouer la demande à cause des emails
        }

        toast.success(result.message || 'Demande de partenariat envoyée avec succès ! Vous recevrez une notification après approbation.')
        onSuccess?.(result)
      } else {
        toast.error(`Erreur: ${result.error}`)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande de partenariat')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties?.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...(prev.specialties || []), specialty]
    }))
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Informations du propriétaire
        </h3>
        <p className="text-gray-600 mb-6">
          Remplissez vos informations personnelles pour créer votre compte partenaire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="owner_name">Nom complet *</Label>
          <Input
            id="owner_name"
            value={formData.owner_name}
            onChange={(e) => handleInputChange('owner_name', e.target.value)}
            placeholder="Votre nom complet"
            className={errors.owner_name ? 'border-red-500' : ''}
          />
          {errors.owner_name && <p className="text-red-500 text-sm mt-1">{errors.owner_name}</p>}
        </div>

        <div>
          <Label htmlFor="owner_email">Email *</Label>
          <Input
            id="owner_email"
            type="email"
            value={formData.owner_email}
            onChange={(e) => handleInputChange('owner_email', e.target.value)}
            placeholder="votre@email.com"
            className={errors.owner_email ? 'border-red-500' : ''}
          />
          {errors.owner_email && <p className="text-red-500 text-sm mt-1">{errors.owner_email}</p>}
        </div>

        <div>
          <Label htmlFor="owner_phone">Téléphone *</Label>
          <Input
            id="owner_phone"
            value={formData.owner_phone}
            onChange={(e) => handleInputChange('owner_phone', e.target.value)}
            placeholder="+224 123 456 789"
            className={errors.owner_phone ? 'border-red-500' : ''}
          />
          {errors.owner_phone && <p className="text-red-500 text-sm mt-1">{errors.owner_phone}</p>}
        </div>

        <div>
          <Label htmlFor="password">Mot de passe *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Mot de passe"
              className={errors.password ? 'border-red-500' : ''}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Informations du commerce
        </h3>
        <p className="text-gray-600 mb-6">
          Décrivez votre commerce pour nous permettre de vous proposer les meilleurs services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="business_name">Nom du commerce *</Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
            placeholder="Nom de votre commerce"
            className={errors.business_name ? 'border-red-500' : ''}
          />
          {errors.business_name && <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>}
        </div>

        <div>
          <Label htmlFor="business_type">Type de commerce *</Label>
          <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
            <SelectTrigger className={errors.business_type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.business_type && <p className="text-red-500 text-sm mt-1">{errors.business_type}</p>}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="business_address">Adresse *</Label>
          <Input
            id="business_address"
            value={formData.business_address}
            onChange={(e) => handleInputChange('business_address', e.target.value)}
            placeholder="Adresse complète du commerce"
            className={errors.business_address ? 'border-red-500' : ''}
          />
          {errors.business_address && <p className="text-red-500 text-sm mt-1">{errors.business_address}</p>}
        </div>

        <div>
          <Label htmlFor="business_phone">Téléphone du commerce *</Label>
          <Input
            id="business_phone"
            value={formData.business_phone}
            onChange={(e) => handleInputChange('business_phone', e.target.value)}
            placeholder="+224 123 456 789"
            className={errors.business_phone ? 'border-red-500' : ''}
          />
          {errors.business_phone && <p className="text-red-500 text-sm mt-1">{errors.business_phone}</p>}
        </div>

        <div>
          <Label htmlFor="business_email">Email du commerce *</Label>
          <Input
            id="business_email"
            type="email"
            value={formData.business_email}
            onChange={(e) => handleInputChange('business_email', e.target.value)}
            placeholder="commerce@email.com"
            className={errors.business_email ? 'border-red-500' : ''}
          />
          {errors.business_email && <p className="text-red-500 text-sm mt-1">{errors.business_email}</p>}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="business_description">Description</Label>
          <Textarea
            id="business_description"
            value={formData.business_description}
            onChange={(e) => handleInputChange('business_description', e.target.value)}
            placeholder="Décrivez votre commerce, vos spécialités..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="opening_hours">Horaires d'ouverture</Label>
          <Input
            id="opening_hours"
            value={formData.opening_hours}
            onChange={(e) => handleInputChange('opening_hours', e.target.value)}
            placeholder="Ex: 8h-22h, 7j/7"
          />
        </div>

        <div>
          <Label htmlFor="delivery_radius">Rayon de livraison (km)</Label>
          <Input
            id="delivery_radius"
            type="number"
            value={formData.delivery_radius}
            onChange={(e) => handleInputChange('delivery_radius', parseInt(e.target.value))}
            min="1"
            max="50"
          />
        </div>

        {formData.business_type === 'restaurant' && (
          <>
            <div>
              <Label htmlFor="cuisine_type">Type de cuisine</Label>
              <Select value={formData.cuisine_type} onValueChange={(value) => handleInputChange('cuisine_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Spécialités</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {['Pizza', 'Burger', 'Sushi', 'Poulet', 'Poisson', 'Végétarien', 'Halal', 'Fast-food'].map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => handleSpecialtyToggle(specialty)}
                    className={`p-2 rounded border text-sm transition-colors ${
                      formData.specialties?.includes(specialty)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Récapitulatif et confirmation
        </h3>
        <p className="text-gray-600 mb-6">
          Vérifiez vos informations avant de créer votre compte partenaire.
        </p>
      </div>

      {/* Afficher le plan sélectionné si disponible */}
      {selectedPlan && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Plan d'abonnement sélectionné
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-800">{selectedPlan.name}</p>
                <p className="text-green-600 text-sm">Plan d'abonnement</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {selectedPlan.price.toLocaleString()} FG
              </Badge>
            </div>
            <p className="text-sm text-green-600 mt-2">
              Ce plan sera automatiquement associé à votre compte après approbation et paiement.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Nom :</span> {formData.owner_name}
            </div>
            <div>
              <span className="font-medium">Email :</span> {formData.owner_email}
            </div>
            <div>
              <span className="font-medium">Téléphone :</span> {formData.owner_phone}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations du commerce</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Nom :</span> {formData.business_name}
            </div>
            <div>
              <span className="font-medium">Type :</span> {businessTypes.find(t => t.value === formData.business_type)?.label}
            </div>
            <div>
              <span className="font-medium">Adresse :</span> {formData.business_address}
            </div>
            <div>
              <span className="font-medium">Téléphone :</span> {formData.business_phone}
            </div>
            <div>
              <span className="font-medium">Email :</span> {formData.business_email}
            </div>
          </CardContent>
        </Card>
      </div>

      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Erreurs de validation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-red-600 text-sm">• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step > stepNumber ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-500">Étape {step} sur 3</span>
      </div>

      {/* Step content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={step === 1 ? onCancel : handlePrevious}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 1 ? 'Annuler' : 'Précédent'}
        </Button>

        <div className="flex gap-2">
          {step < 3 ? (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Créer mon compte partenaire
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 