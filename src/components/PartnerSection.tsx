import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Clock, 
  Shield, 
  Zap, 
  Star, 
  ArrowRight,
  CheckCircle,
  DollarSign,
  BarChart3,
  Smartphone
} from 'lucide-react'

const advantages = [
  {
    icon: TrendingUp,
    title: 'Augmentez vos ventes',
    description: 'Accédez à des milliers de clients et multipliez votre chiffre d\'affaires'
  },
  {
    icon: Users,
    title: 'Clientèle fidèle',
    description: 'Construisez une base de clients fidèles grâce à notre plateforme'
  },
  {
    icon: Clock,
    title: 'Gestion simplifiée',
    description: 'Dashboard intuitif pour gérer vos commandes et votre menu facilement'
  },
  {
    icon: Shield,
    title: 'Paiements sécurisés',
    description: 'Transactions sécurisées et paiements garantis pour chaque commande'
  },
  {
    icon: Zap,
    title: 'Livraison rapide',
    description: 'Service de livraison professionnel pour satisfaire vos clients'
  },
  {
    icon: BarChart3,
    title: 'Analytics détaillés',
    description: 'Suivez vos performances et optimisez votre activité'
  }
]

const businessTypes = [
  { name: 'Restaurants', icon: '🍽️', count: '150+' },
  { name: 'Cafés', icon: '☕', count: '80+' },
  { name: 'Supermarchés', icon: '🛒', count: '45+' },
  { name: 'Pharmacies', icon: '💊', count: '30+' },
  { name: 'Électronique', icon: '📱', count: '25+' },
  { name: 'Beauté', icon: '💄', count: '20+' }
]

const testimonials = [
  {
    name: 'Fatou Diallo',
    business: 'Restaurant Le Baoulé',
    content: 'BraPrime a transformé mon restaurant. Mes ventes ont augmenté de 300% en 6 mois !',
    rating: 5
  },
  {
    name: 'Mamadou Barry',
    business: 'Café Central',
    content: 'Le dashboard est très intuitif. Je gère mes commandes en quelques clics.',
    rating: 5
  },
  {
    name: 'Aissatou Camara',
    business: 'Market Fresh',
    content: 'Excellente plateforme pour développer mon activité. Je recommande !',
    rating: 5
  }
]

export function PartnerSection() {
  const navigate = useNavigate()

  const handleBecomePartner = () => {
    navigate('/devenir-partenaire')
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Building2 className="h-4 w-4 mr-2" />
            Programme Partenaire
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Devenez Partenaire BraPrime
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez notre réseau de partenaires et développez votre activité 
            avec la première plateforme de livraison de Guinée
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-gray-600">Partenaires actifs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-sm text-gray-600">Commandes livrées</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">98%</div>
            <div className="text-sm text-gray-600">Satisfaction client</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24h</div>
            <div className="text-sm text-gray-600">Support disponible</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Advantages */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Pourquoi rejoindre BraPrime ?
            </h3>
            <div className="space-y-4">
              {advantages.map((advantage, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <advantage.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {advantage.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {advantage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <Button 
                size="lg" 
                className="w-full md:w-auto"
                onClick={handleBecomePartner}
              >
                <Building2 className="h-5 w-5 mr-2" />
                Devenir Partenaire
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right side - Business types and testimonials */}
          <div className="space-y-8">
            {/* Business types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Types de commerces
                </CardTitle>
                <CardDescription>
                  Rejoignez notre réseau diversifié de partenaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {businessTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <Badge variant="outline">{type.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Témoignages
                </CardTitle>
                <CardDescription>
                  Ce que disent nos partenaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        "{testimonial.content}"
                      </p>
                      <div className="text-xs text-gray-600">
                        <strong>{testimonial.name}</strong> - {testimonial.business}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features highlight */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour réussir
            </h3>
            <p className="text-gray-600">
              Une suite complète d'outils pour gérer votre activité
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Dashboard Mobile</h4>
                <p className="text-sm text-gray-600">
                  Gérez vos commandes depuis votre smartphone
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Paiements Instantanés</h4>
                <p className="text-sm text-gray-600">
                  Recevez vos paiements en temps réel
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Analytics Avancés</h4>
                <p className="text-sm text-gray-600">
                  Suivez vos performances en détail
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4">
                Prêt à rejoindre BraPrime ?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Créez votre compte partenaire en moins de 5 minutes
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleBecomePartner}
              >
                <Building2 className="h-5 w-5 mr-2" />
                Commencer maintenant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
} 