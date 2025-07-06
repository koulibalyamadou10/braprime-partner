import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  ArrowLeft, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  Smartphone,
  DollarSign,
  BarChart3,
  CheckCircle,
  MapPin,
  Clock,
  Zap,
  Car,
  Navigation,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const advantages = [
  {
    icon: DollarSign,
    title: "Revenus flexibles",
    description: "Gagnez selon vos disponibilités et vos performances"
  },
  {
    icon: Clock,
    title: "Horaires libres",
    description: "Travaillez quand vous voulez, selon votre emploi du temps"
  },
  {
    icon: Shield,
    title: "Sécurité garantie",
    description: "Assurance et protection pour tous vos déplacements"
  },
  {
    icon: Zap,
    title: "Paiements rapides",
    description: "Recevez vos gains en temps réel après chaque livraison"
  }
];

const driverStats = [
  { name: "Chauffeurs actifs", icon: "🚗", count: "200+" },
  { name: "Livraisons/jour", icon: "📦", count: "1000+" },
  { name: "Gains moyens", icon: "💰", count: "50k GNF" },
  { name: "Satisfaction", icon: "⭐", count: "4.8/5" }
];

const testimonials = [
  {
    name: "Mamadou Diallo",
    experience: "Chauffeur depuis 6 mois",
    rating: 5,
    content: "BraPrime m'a permis de gagner un revenu stable. Les horaires flexibles sont parfaits pour moi !"
  },
  {
    name: "Fatoumata Barry",
    experience: "Chauffeur depuis 1 an",
    rating: 5,
    content: "Excellente plateforme ! Les paiements sont rapides et le support client est très réactif."
  },
  {
    name: "Ousmane Camara",
    experience: "Chauffeur depuis 3 mois",
    rating: 5,
    content: "Je recommande BraPrime à tous mes amis. C'est une excellente opportunité de revenus."
  }
];

const features = [
  {
    icon: Smartphone,
    title: "App Mobile",
    description: "Application intuitive pour gérer vos livraisons",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: Navigation,
    title: "GPS Intégré",
    description: "Navigation optimisée pour des trajets efficaces",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Timer,
    title: "Temps Réel",
    description: "Suivi en temps réel de vos livraisons",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: DollarSign,
    title: "Paiements Instantanés",
    description: "Recevez vos gains immédiatement",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: Shield,
    title: "Assurance Complète",
    description: "Protection pour vous et vos livraisons",
    color: "bg-red-100 text-red-600"
  },
  {
    icon: CheckCircle,
    title: "Formation Gratuite",
    description: "Formation complète pour débuter en confiance",
    color: "bg-teal-100 text-teal-600"
  }
];

const requirements = [
  "Permis de conduire valide",
  "Véhicule en bon état",
  "Smartphone avec GPS",
  "Âge minimum 21 ans",
  "Casier judiciaire vierge",
  "Assurance véhicule"
];

const DriverRegistrationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = () => {
    // Redirection vers la page d'inscription chauffeur existante
    navigate('/driver/register');
  };

  const handleLogin = () => {
    // Redirection vers la page de connexion chauffeur existante
    navigate('/driver/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">BraPrime</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Devenez Chauffeur BraPrime
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez notre équipe de chauffeurs et gagnez un revenu flexible 
            en livrant des commandes dans toute la Guinée
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left side - Registration Options */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  Rejoindre l'équipe BraPrime
                </CardTitle>
                <CardDescription>
                  Choisissez votre option pour commencer votre aventure avec BraPrime
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nouveau chauffeur */}
                <div className="border rounded-lg p-6 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Car className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Nouveau chauffeur</h3>
                      <p className="text-sm text-gray-600">Créez votre compte chauffeur</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Inscrivez-vous comme nouveau chauffeur et commencez à gagner dès aujourd'hui.
                  </p>
                  <Button 
                    onClick={handleRegister}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Car className="h-4 w-4 mr-2" />
                    S'inscrire comme chauffeur
                  </Button>
                </div>

                {/* Chauffeur existant */}
                <div className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Chauffeur existant</h3>
                      <p className="text-sm text-gray-600">Connectez-vous à votre compte</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Vous avez déjà un compte ? Connectez-vous pour accéder à votre dashboard.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={handleLogin}
                    className="w-full"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Se connecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Benefits and Info */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Advantages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Pourquoi devenir chauffeur BraPrime ?
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Driver stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistiques chauffeurs
                </CardTitle>
                <CardDescription>
                  Rejoignez notre communauté de chauffeurs actifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {driverStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <span className="font-medium text-sm">{stat.name}</span>
                      </div>
                      <Badge variant="outline">{stat.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Exigences
                </CardTitle>
                <CardDescription>
                  Conditions pour devenir chauffeur BraPrime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{requirement}</span>
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
                  Ce que disent nos chauffeurs
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
                        <strong>{testimonial.name}</strong> - {testimonial.experience}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Outils pour votre succès
            </h2>
            <p className="text-gray-600 text-lg">
              Tout ce dont vous avez besoin pour exceller comme chauffeur
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardContent className="pt-8 pb-8">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">200+</div>
                  <div className="text-sm opacity-90">Chauffeurs actifs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">1000+</div>
                  <div className="text-sm opacity-90">Livraisons/jour</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">50k GNF</div>
                  <div className="text-sm opacity-90">Gain moyen/jour</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">4.8/5</div>
                  <div className="text-sm opacity-90">Note moyenne</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistrationPage; 