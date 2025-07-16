import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BarChart3, Check, CreditCard, Headphones, Star, Truck, Zap, Utensils, Coffee, Pill, ShoppingBasket, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Plans de tarification
const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Parfait pour les petits commerces qui débutent',
    price: 25000,
    pricePerMonth: '25,000 FG',
    features: [
      'Gestion de base du menu',
      'Commandes en ligne',
      'Notifications par SMS',
      'Support par email',
      'Statistiques de base',
      '1 compte utilisateur',
      'Livraison standard',
      'Paiement en espèces'
    ],
    limitations: [
      'Maximum 50 articles',
      'Pas de réservations',
      'Support limité'
    ],
    popular: false,
    icon: Star,
    color: 'bg-blue-500'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Solution complète pour les commerces établis',
    price: 75000,
    pricePerMonth: '75,000 FG',
    features: [
      'Tout du plan Starter',
      'Gestion avancée du menu',
      'Système de réservations',
      'Notifications push',
      'Support téléphonique',
      'Statistiques détaillées',
      '3 comptes utilisateurs',
      'Livraison express',
      'Paiement en ligne',
      'Gestion des stocks',
      'Rapports personnalisés',
      'API d\'intégration'
    ],
    limitations: [
      'Maximum 200 articles',
      'Pas de marketplace'
    ],
    popular: true,
    icon: Zap,
    color: 'bg-guinea-red'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solution premium pour les grandes entreprises',
    price: 150000,
    pricePerMonth: '150,000 FG',
    features: [
      'Tout du plan Professional',
      'Menu illimité',
      'Marketplace intégré',
      'Support prioritaire 24/7',
      'Statistiques avancées',
      'Comptes utilisateurs illimités',
      'Livraison premium',
      'Paiements multiples',
      'Gestion des employés',
      'Rapports personnalisés',
      'API complète',
      'Formation personnalisée',
      'Déploiement sur mesure',
      'SLA garanti'
    ],
    limitations: [],
    popular: false,
    icon: Award,
    color: 'bg-purple-600'
  }
];

// Fonctionnalités par type de business
const businessFeatures = {
  restaurant: [
    'Gestion des menus',
    'Réservations en ligne',
    'Livraison à domicile',
    'Gestion des tables',
    'Commandes en temps réel'
  ],
  cafe: [
    'Menu café et pâtisseries',
    'Commandes rapides',
    'Livraison express',
    'Gestion des stocks'
  ],
  pharmacy: [
    'Gestion des médicaments',
    'Ordonnances en ligne',
    'Livraison urgente',
    'Gestion des stocks'
  ],
  market: [
    'Catalogue produits',
    'Gestion des stocks',
    'Livraison à domicile',
    'Paiements sécurisés'
  ],
  supermarket: [
    'Catalogue complet',
    'Gestion des stocks',
    'Livraison express',
    'Programme de fidélité'
  ]
};

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Calculer les prix avec remise annuelle
  const getDiscountedPrice = (price: number) => {
    if (billingCycle === 'yearly') {
      return Math.round(price * 10 * 0.8); // 20% de remise pour l'année
    }
    return price;
  };

  const getBillingText = (price: number) => {
    if (billingCycle === 'yearly') {
      return `${(getDiscountedPrice(price) / 10).toLocaleString()} FG/mois`;
    }
    return `${price.toLocaleString()} FG/mois`;
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-guinea-red to-guinea-red/90 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Tarifs adaptés à votre business
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Choisissez le plan qui correspond à vos besoins. Évoluez à votre rythme.
              </p>
              
              {/* Toggle Billing */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-white/70'}`}>
                  Mensuel
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition-colors"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-white/70'}`}>
                  Annuel
                  <Badge className="ml-2 bg-green-500 text-white">-20%</Badge>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => {
              const IconComponent = plan.icon;
              const isSelected = selectedPlan === plan.id;
              const discountedPrice = getDiscountedPrice(plan.price);
              
              return (
                <Card 
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-xl ${
                    isSelected ? 'ring-2 ring-guinea-red scale-105' : 'hover:scale-105'
                  } ${plan.popular ? 'border-guinea-red' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-guinea-red text-white px-4 py-1">
                        Plus populaire
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex p-3 rounded-full ${plan.color} text-white mb-4`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Prix */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">
                        {billingCycle === 'yearly' 
                          ? `${(discountedPrice / 10).toLocaleString()} FG`
                          : `${plan.price.toLocaleString()} FG`
                        }
                      </div>
                      <div className="text-gray-600">
                        {billingCycle === 'yearly' ? 'par mois' : 'par mois'}
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="text-sm text-gray-500 mt-1">
                          {discountedPrice.toLocaleString()} FG facturés annuellement
                        </div>
                      )}
                    </div>

                    {/* Fonctionnalités */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Inclus :</h4>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Limitations :</h4>
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="h-5 w-5 rounded-full bg-gray-300 flex-shrink-0" />
                            <span className="text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-6">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-guinea-red hover:bg-guinea-red/90' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {isSelected ? 'Plan sélectionné' : 'Choisir ce plan'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Fonctionnalités par type de business */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Fonctionnalités adaptées à votre secteur</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Chaque type de commerce bénéficie de fonctionnalités spécialisées pour optimiser ses opérations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(businessFeatures).map(([type, features]) => (
                <Card key={type} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center">
                      {type === 'restaurant' && <Utensils className="h-5 w-5 mr-2" />}
                      {type === 'cafe' && <Coffee className="h-5 w-5 mr-2" />}
                      {type === 'pharmacy' && <Pill className="h-5 w-5 mr-2" />}
                      {type === 'market' && <ShoppingBasket className="h-5 w-5 mr-2" />}
                      {type === 'supermarket' && <ShoppingCart className="h-5 w-5 mr-2" />}
                      {type === 'restaurant' ? 'Restaurants' : 
                       type === 'cafe' ? 'Cafés' :
                       type === 'pharmacy' ? 'Pharmacies' :
                       type === 'market' ? 'Marchés' :
                       type === 'supermarket' ? 'Supermarchés' : type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Avantages */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pourquoi choisir BraPrime ?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Une plateforme complète pour digitaliser votre commerce et augmenter vos ventes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-guinea-red/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Truck className="h-8 w-8 text-guinea-red" />
                </div>
                <h3 className="font-semibold mb-2">Livraison rapide</h3>
                <p className="text-gray-600 text-sm">
                  Livraison en moins de 30 minutes dans votre zone
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-guinea-red/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-guinea-red" />
                </div>
                <h3 className="font-semibold mb-2">Paiements sécurisés</h3>
                <p className="text-gray-600 text-sm">
                  Paiements en ligne et en espèces sécurisés
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-guinea-red/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-guinea-red" />
                </div>
                <h3 className="font-semibold mb-2">Analytics avancés</h3>
                <p className="text-gray-600 text-sm">
                  Statistiques détaillées pour optimiser vos ventes
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-guinea-red/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Headphones className="h-8 w-8 text-guinea-red" />
                </div>
                <h3 className="font-semibold mb-2">Support 24/7</h3>
                <p className="text-gray-600 text-sm">
                  Support technique disponible à tout moment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Questions fréquentes</h2>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
                <p className="text-gray-600">
                  Oui, vous pouvez passer à un plan supérieur à tout moment. Le changement sera effectif immédiatement.
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Y a-t-il des frais de configuration ?</h3>
                <p className="text-gray-600">
                  Non, il n'y a aucun frais de configuration. Votre compte est opérationnel dès l'inscription.
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Comment fonctionne la période d'essai ?</h3>
                <p className="text-gray-600">
                  Tous nos plans incluent une période d'essai gratuite de 14 jours. Aucune carte de crédit requise.
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Quels sont les moyens de paiement acceptés ?</h3>
                <p className="text-gray-600">
                  Nous acceptons les cartes bancaires, les virements bancaires et les paiements mobiles (Orange Money, MTN Money).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-guinea-red to-guinea-red/90 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-xl mb-8 text-white/90">
              Rejoignez des centaines de commerces qui font confiance à BraPrime
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-guinea-red hover:bg-gray-100">
                  Commencer gratuitement
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-guinea-red">
                  Contacter l'équipe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing; 