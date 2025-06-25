import React, { useState, useEffect } from 'react'
import { PartnerRegistrationService, PartnerRegistrationData } from '@/lib/services/partner-registration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, AlertCircle, Building2, User, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface PartnerRegistrationFormProps {
  onSuccess?: (result: any) => void
  onCancel?: () => void
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

export function PartnerRegistrationForm({ onSuccess, onCancel }: PartnerRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
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
      if (!formData.owner_name.trim()) newErrors.owner_name = 'Le nom du propriétaire est requis'
      if (!formData.owner_email.trim()) newErrors.owner_email = 'L\'email du propriétaire est requis'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.owner_email)) {
        newErrors.owner_email = 'Format d\'email invalide'
      }
      if (!formData.owner_phone.trim()) newErrors.owner_phone = 'Le téléphone du propriétaire est requis'
      if (!formData.password.trim()) newErrors.password = 'Le mot de passe est requis'
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
      }
    }

    if (currentStep === 2) {
      if (!formData.business_name.trim()) newErrors.business_name = 'Le nom du commerce est requis'
      if (!formData.business_type) newErrors.business_type = 'Le type de commerce est requis'
      if (!formData.business_address.trim()) newErrors.business_address = 'L\'adresse du commerce est requise'
      if (!formData.business_phone.trim()) newErrors.business_phone = 'Le téléphone du commerce est requis'
      if (!formData.business_email.trim()) newErrors.business_email = 'L\'email du commerce est requis'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email)) {
        newErrors.business_email = 'Format d\'email invalide'
      }
    }

    if (currentStep === 3) {
      if (!formData.business_description.trim()) newErrors.business_description = 'La description du commerce est requise'
      if (!formData.opening_hours.trim()) newErrors.opening_hours = 'Les horaires d\'ouverture sont requis'
      if (formData.delivery_radius < 1) newErrors.delivery_radius = 'Le rayon de livraison doit être d\'au moins 1km'
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
      const result = await PartnerRegistrationService.createPartnerAccount(formData)
      
      if (result.success) {
        toast.success('Compte partenaire créé avec succès ! Vous pouvez maintenant vous connecter.')
        onSuccess?.(result)
      } else {
        toast.error(`Erreur: ${result.error}`)
      }
    } catch (error) {
      toast.error('Erreur lors de la création du compte partenaire')
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
    <div className="space-y-4">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Informations du propriétaire</h3>
        <p className="text-sm text-muted-foreground">Créez votre compte personnel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Nom complet *</label>
          <Input
            value={formData.owner_name}
            onChange={(e) => handleInputChange('owner_name', e.target.value)}
            placeholder="Jean Dupont"
            className={errors.owner_name ? 'border-red-500' : ''}
          />
          {errors.owner_name && <p className="text-red-500 text-xs mt-1">{errors.owner_name}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Téléphone *</label>
          <Input
            value={formData.owner_phone}
            onChange={(e) => handleInputChange('owner_phone', e.target.value)}
            placeholder="+224 6 12 34 56 78"
            className={errors.owner_phone ? 'border-red-500' : ''}
          />
          {errors.owner_phone && <p className="text-red-500 text-xs mt-1">{errors.owner_phone}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Email *</label>
        <Input
          type="email"
          value={formData.owner_email}
          onChange={(e) => handleInputChange('owner_email', e.target.value)}
          placeholder="proprietaire@email.com"
          className={errors.owner_email ? 'border-red-500' : ''}
        />
        {errors.owner_email && <p className="text-red-500 text-xs mt-1">{errors.owner_email}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Mot de passe *</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="••••••••"
            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Minimum 6 caractères. Ce mot de passe vous servira à vous connecter à votre dashboard.
        </p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Building2 className="h-12 w-12 text-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Informations du commerce</h3>
        <p className="text-sm text-muted-foreground">Détails de votre établissement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Nom du commerce *</label>
          <Input
            value={formData.business_name}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
            placeholder="Restaurant Le Gourmet"
            className={errors.business_name ? 'border-red-500' : ''}
          />
          {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Type de commerce *</label>
          <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
            <SelectTrigger className={errors.business_type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.business_type && <p className="text-red-500 text-xs mt-1">{errors.business_type}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Adresse du commerce *</label>
        <Input
          value={formData.business_address}
          onChange={(e) => handleInputChange('business_address', e.target.value)}
          placeholder="123 Rue de la Paix, Conakry"
          className={errors.business_address ? 'border-red-500' : ''}
        />
        {errors.business_address && <p className="text-red-500 text-xs mt-1">{errors.business_address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Téléphone du commerce *</label>
          <Input
            value={formData.business_phone}
            onChange={(e) => handleInputChange('business_phone', e.target.value)}
            placeholder="+224 1 23 45 67 89"
            className={errors.business_phone ? 'border-red-500' : ''}
          />
          {errors.business_phone && <p className="text-red-500 text-xs mt-1">{errors.business_phone}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Email du commerce *</label>
          <Input
            type="email"
            value={formData.business_email}
            onChange={(e) => handleInputChange('business_email', e.target.value)}
            placeholder="contact@commerce.com"
            className={errors.business_email ? 'border-red-500' : ''}
          />
          {errors.business_email && <p className="text-red-500 text-xs mt-1">{errors.business_email}</p>}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Lock className="h-12 w-12 text-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Détails supplémentaires</h3>
        <p className="text-sm text-muted-foreground">Informations complémentaires</p>
      </div>

      <div>
        <label className="text-sm font-medium">Description du commerce *</label>
        <Textarea
          value={formData.business_description}
          onChange={(e) => handleInputChange('business_description', e.target.value)}
          placeholder="Décrivez votre commerce, vos spécialités, votre concept..."
          rows={4}
          className={errors.business_description ? 'border-red-500' : ''}
        />
        {errors.business_description && <p className="text-red-500 text-xs mt-1">{errors.business_description}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Horaires d'ouverture *</label>
        <Input
          value={formData.opening_hours}
          onChange={(e) => handleInputChange('opening_hours', e.target.value)}
          placeholder="Lun-Ven: 8h-20h, Sam: 9h-18h, Dim: 10h-16h"
          className={errors.opening_hours ? 'border-red-500' : ''}
        />
        {errors.opening_hours && <p className="text-red-500 text-xs mt-1">{errors.opening_hours}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Rayon de livraison (km) *</label>
        <Input
          type="number"
          min="1"
          max="50"
          value={formData.delivery_radius}
          onChange={(e) => handleInputChange('delivery_radius', parseInt(e.target.value))}
          className={errors.delivery_radius ? 'border-red-500' : ''}
        />
        {errors.delivery_radius && <p className="text-red-500 text-xs mt-1">{errors.delivery_radius}</p>}
      </div>

      {formData.business_type === 'restaurant' && (
        <>
          <div>
            <label className="text-sm font-medium">Type de cuisine</label>
            <Select value={formData.cuisine_type} onValueChange={(value) => handleInputChange('cuisine_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type de cuisine" />
              </SelectTrigger>
              <SelectContent>
                {cuisineTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Spécialités</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Pizza', 'Sushi', 'Burger', 'Salades', 'Desserts', 'Végétarien', 'Halal', 'Bio'].map(specialty => (
                <Badge
                  key={specialty}
                  variant={formData.specialties?.includes(specialty) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleSpecialtyToggle(specialty)}
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Compte propriétaire'
      case 2:
        return 'Informations commerce'
      case 3:
        return 'Détails supplémentaires'
      default:
        return ''
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Créer un Compte Partenaire
        </CardTitle>
        <CardDescription>
          Rejoignez BraPrime en tant que partenaire et gérez votre commerce
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNumber <= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {stepNumber < step ? <CheckCircle className="h-4 w-4" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  stepNumber < step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{getStepTitle()}</h3>
          <p className="text-sm text-muted-foreground">
            Étape {step} sur 3
          </p>
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-800">Erreurs de validation</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {renderStepContent()}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={step === 1 ? onCancel : handlePrevious}
            disabled={isSubmitting}
          >
            {step === 1 ? 'Annuler' : 'Précédent'}
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Suivant
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || validationErrors.length > 0}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le compte'
              )}
            </Button>
          )}
        </div>

        {/* Info section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-3 text-blue-800">Informations importantes</h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Votre compte sera créé avec le rôle "Partenaire"</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Vous pourrez vous connecter immédiatement à votre dashboard</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Votre commerce sera automatiquement configuré</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 