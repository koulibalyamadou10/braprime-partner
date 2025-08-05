import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PartnerRegistrationData, PartnerRegistrationService } from '@/lib/services/partner-registration'
import { ArrowLeft, ArrowRight, Building2, CheckCircle, DollarSign, Star, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface PartnerRegistrationFormProps {
  onSuccess?: (result: any) => void
  onCancel?: () => void
}

// Plans de tarification
const pricingPlans = [
  {
    id: '1_month',
    name: '1 Mois',
    description: 'Formule flexible pour tester nos services',
    price: 200000,
    pricePerMonth: '200,000 FG',
    features: [
      'Visibilité continue sur l\'application BraPrime',
      'Accès à des centaines d\'utilisateurs actifs',
      'Service de livraison écoresponsable',
      'Plateforme moderne 100% guinéenne',
      'Support client',
      'Gestion de base du menu',
      'Commandes en ligne',
      'Notifications par SMS'
    ],
    popular: false,
    icon: Star,
    color: 'bg-blue-500',
    savings: null
  },
  {
    id: '3_months',
    name: '3 Mois',
    description: 'Formule recommandée pour les commerces établis',
    price: 450000,
    pricePerMonth: '150,000 FG',
    features: [
      'Tout du plan 1 mois',
      'Économie de 25%',
      'Visibilité continue sur l\'application BraPrime',
      'Accès à des centaines d\'utilisateurs actifs',
      'Service de livraison écoresponsable',
      'Plateforme moderne 100% guinéenne',
      'Support client',
      'Gestion de base du menu',
      'Commandes en ligne',
      'Notifications par SMS'
    ],
    popular: true,
    icon: Zap,
    color: 'bg-guinea-red',
    savings: '25% d\'économie'
  },
  {
    id: '6_months',
    name: '6 Mois',
    description: 'Formule économique pour les commerces confirmés',
    price: 700000,
    pricePerMonth: '116,667 FG',
    features: [
      'Tout du plan 3 mois',
      'Économie de 41,7%',
      'Visibilité continue sur l\'application BraPrime',
      'Accès à des centaines d\'utilisateurs actifs',
      'Service de livraison écoresponsable',
      'Plateforme moderne 100% guinéenne',
      'Support client',
      'Gestion de base du menu',
      'Commandes en ligne',
      'Notifications par SMS'
    ],
    popular: false,
    icon: Building2,
    color: 'bg-green-600',
    savings: '41,7% d\'économie'
  }
];

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
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Informations du propriétaire
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    
    // Informations du commerce
    business_name: '',
    business_type: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    business_description: '',
    opening_hours: '',
    delivery_radius: 5,
    cuisine_type: '',
    specialties: [] as string[],
    
    // Plan sélectionné
    selectedPlan: null as any
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  // Validation en temps réel
  useEffect(() => {
    const newErrors: Record<string, string> = {}
    
    if (currentStep === 1) {
      if (!formData.owner_name.trim()) newErrors.owner_name = 'Le nom est requis'
      if (!formData.owner_email.trim()) newErrors.owner_email = 'L\'email est requis'
      else if (!/\S+@\S+\.\S+/.test(formData.owner_email)) newErrors.owner_email = 'Email invalide'
      if (!formData.owner_phone.trim()) newErrors.owner_phone = 'Le téléphone est requis'
    }
    
    if (currentStep === 2) {
      if (!formData.business_name.trim()) newErrors.business_name = 'Le nom du commerce est requis'
      if (!formData.business_type) newErrors.business_type = 'Le type de commerce est requis'
      if (!formData.business_address.trim()) newErrors.business_address = 'L\'adresse est requise'
      if (!formData.business_phone.trim()) newErrors.business_phone = 'Le téléphone du commerce est requis'
      if (!formData.business_email.trim()) newErrors.business_email = 'L\'email du commerce est requis'
      else if (!/\S+@\S+\.\S+/.test(formData.business_email)) newErrors.business_email = 'Email invalide'
    }
    
    if (currentStep === 3) {
      if (!formData.business_description.trim()) newErrors.business_description = 'La description est requise'
      if (!formData.opening_hours.trim()) newErrors.opening_hours = 'Les horaires d\'ouverture sont requis'
    }
    
    setErrors(newErrors)
  }, [formData, currentStep])

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}
    
    if (currentStep === 1) {
      if (!formData.owner_name.trim()) newErrors.owner_name = 'Le nom est requis'
      if (!formData.owner_email.trim()) newErrors.owner_email = 'L\'email est requis'
      else if (!/\S+@\S+\.\S+/.test(formData.owner_email)) newErrors.owner_email = 'Email invalide'
      if (!formData.owner_phone.trim()) newErrors.owner_phone = 'Le téléphone est requis'
    }
    
    if (currentStep === 2) {
      if (!formData.business_name.trim()) newErrors.business_name = 'Le nom du commerce est requis'
      if (!formData.business_type) newErrors.business_type = 'Le type de commerce est requis'
      if (!formData.business_address.trim()) newErrors.business_address = 'L\'adresse est requise'
      if (!formData.business_phone.trim()) newErrors.business_phone = 'Le téléphone du commerce est requis'
      if (!formData.business_email.trim()) newErrors.business_email = 'L\'email du commerce est requis'
      else if (!/\S+@\S+\.\S+/.test(formData.business_email)) newErrors.business_email = 'Email invalide'
    }
    
    if (currentStep === 3) {
      if (!formData.business_description.trim()) newErrors.business_description = 'La description est requise'
      if (!formData.opening_hours.trim()) newErrors.opening_hours = 'Les horaires d\'ouverture sont requis'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Veuillez corriger les erreurs avant de continuer')
      return
    }

    if (!selectedPlan) {
      toast.error('Veuillez sélectionner un plan')
      return
    }

    setIsSubmitting(true)

    try {
      const registrationData = {
        ...formData,
        selectedPlan
      }

      const result = await PartnerRegistrationService.createPartnerAccount(registrationData)

      if (result.success) {
        toast.success('Demande de partenariat envoyée avec succès !')
        onSuccess?.(result)
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi de la demande')
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      toast.error('Erreur lors de l\'envoi de la demande')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const handlePlanSelection = (plan: any) => {
    setSelectedPlan(plan)
  }

  // Fonction pour pré-remplir avec des données aléatoires
  const fillWithRandomData = () => {
    const randomNames = ['Alpha Restaurant', 'Beta Café', 'Gamma Market', 'Delta Pharmacy', 'Epsilon Electronics']
    const randomEmails = ['alpha@test.com', 'beta@test.com', 'gamma@test.com', 'delta@test.com', 'epsilon@test.com']
    const randomPhones = ['+224 123 456 789', '+224 234 567 890', '+224 345 678 901', '+224 456 789 012', '+224 567 890 123']
    
    setFormData({
      ...formData,
      owner_name: randomNames[Math.floor(Math.random() * randomNames.length)],
      owner_email: randomEmails[Math.floor(Math.random() * randomEmails.length)],
      owner_phone: randomPhones[Math.floor(Math.random() * randomPhones.length)],
      business_name: randomNames[Math.floor(Math.random() * randomNames.length)],
      business_type: 'restaurant',
      business_address: 'Conakry, Guinée',
      business_phone: randomPhones[Math.floor(Math.random() * randomPhones.length)],
      business_email: randomEmails[Math.floor(Math.random() * randomEmails.length)],
      business_description: 'Commerce de test avec des produits de qualité',
      opening_hours: '8h-18h, Lundi-Samedi',
      delivery_radius: 5,
      cuisine_type: 'Africaine',
      specialties: ['Plats locaux', 'Boissons fraîches']
    })
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
        
        {/* Bouton pour pré-remplir avec des données de test */}
        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={fillWithRandomData}
            className="text-sm"
          >
            🧪 Pré-remplir avec des données de test
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Utilisez ce bouton pour tester rapidement le formulaire avec des données aléatoires
          </p>
        </div>
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
          Vérifiez vos informations avant de passer à la sélection du plan d'abonnement.
        </p>
      </div>

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

      {/* validationErrors is no longer used, but keeping the structure */}
      {/* {validationErrors.length > 0 && (
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
      )} */}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Sélectionnez votre plan d'abonnement
        </h3>
        <p className="text-gray-600 mb-6">
          Choisissez le plan d'abonnement qui correspond le mieux à vos besoins.
        </p>
        
        {/* Bouton pour sélectionner un plan aléatoire */}
        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const randomPlan = pricingPlans[Math.floor(Math.random() * pricingPlans.length)];
              setSelectedPlan(randomPlan);
              toast.success(`Plan sélectionné: ${randomPlan.name}`);
            }}
            className="text-sm"
          >
            🎲 Sélectionner un plan aléatoire
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Sélectionne automatiquement un plan pour tester
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col items-start p-6 border-2 rounded-lg transition-all duration-300 ${
              selectedPlan?.id === plan.id
                ? 'border-primary shadow-lg'
                : 'border-gray-200 hover:border-primary'
            }`}
            onClick={() => handlePlanSelection(plan)}
          >
            <div className={`p-3 rounded-full ${plan.color} text-white mb-4`}>
              <plan.icon className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h4>
            <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
            <div className="flex items-center text-gray-700 text-sm mb-4">
              <DollarSign className="h-4 w-4 mr-1" />
              {plan.pricePerMonth}
            </div>
            <ul className="space-y-2 text-gray-700 text-sm">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.savings && (
              <div className="mt-4 text-sm text-green-600">
                <span className="font-semibold">Économie :</span> {plan.savings}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= stepNumber ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > stepNumber ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-500">Étape {currentStep} sur 4</span>
      </div>

      {/* Step content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Annuler' : 'Précédent'}
        </Button>

        <div className="flex gap-2">
          {currentStep < 4 ? (
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