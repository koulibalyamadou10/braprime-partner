import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BarChart3, Check, Globe, Star, Truck, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Plans de tarification selon le document officiel
const pricingPlans = [
  {
    id: '1-month',
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
    limitations: [
      'Pas de remise',
      'Engagement court'
    ],
    popular: false,
    icon: Star,
    color: 'bg-blue-500',
    savings: null
  },
  {
    id: '3-months',
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
    limitations: [
      'Engagement de 3 mois'
    ],
    popular: true,
    icon: Zap,
    color: 'bg-guinea-red',
    savings: '25% d\'économie'
  },
  {
    id: '6-months',
    name: '6 Mois',
    description: 'Formule économique pour les commerces sérieux',
    price: 800000,
    pricePerMonth: '133,333 FG',
    features: [
      'Tout du plan 3 mois',
      'Économie de 33%',
      'Visibilité continue sur l\'application BraPrime',
      'Accès à des centaines d\'utilisateurs actifs',
      'Service de livraison écoresponsable',
      'Plateforme moderne 100% guinéenne',
      'Support client',
      'Gestion de base du menu',
      'Commandes en ligne',
      'Notifications par SMS'
    ],
    limitations: [
      'Engagement de 6 mois'
    ],
    popular: false,
    icon: Award,
    color: 'bg-purple-600',
    savings: '33% d\'économie'
  },
  {
    id: '12-months',
    name: '12 Mois',
    description: 'Formule la plus économique pour les commerces fidèles',
    price: 1400000,
    pricePerMonth: '116,667 FG',
    features: [
      'Tout du plan 6 mois',
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
    limitations: [
      'Engagement de 12 mois'
    ],
    popular: false,
    icon: Award,
    color: 'bg-green-600',
    savings: '41,7% d\'économie'
  }
];



const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState('3-months');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Calculer les prix selon la durée d'engagement
  const getDiscountedPrice = (price: number) => {
    return price; // Les prix sont déjà calculés selon la durée
  };

  const getBillingText = (price: number) => {
    return `${price.toLocaleString()} FG`;
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
              
              {/* Informations sur les tarifs */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="text-center">
                  <p className="text-white/90 text-lg">
                    Profitez d'une visibilité continue sur l'application BraPrime, touchez de nouveaux clients et augmentez vos ventes grâce à nos forfaits flexibles.
                  </p>
                  <p className="text-white/80 text-sm mt-2">
                    Plus votre engagement est long, plus vous réalisez d'économies !
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
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
                        Recommandé
                      </Badge>
                    </div>
                  )}
                  {plan.savings && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-4 py-1">
                        {plan.savings}
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
                        {plan.price.toLocaleString()} FG
                      </div>
                      <div className="text-gray-600">
                        {plan.pricePerMonth} par mois
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Engagement {plan.name.toLowerCase()}
                      </div>
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

        {/* Pourquoi s'abonner */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pourquoi s'abonner ?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Découvrez les avantages de rejoindre BraPrime et d'augmenter vos ventes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-guinea-red/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-guinea-red" />
                </div>
                <h3 className="font-semibold mb-2">Gagnez en visibilité</h3>
                <p className="text-gray-600 text-sm">
                  Visibilité auprès de centaines d'utilisateurs actifs à Conakry
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-guinea-red/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Truck className="h-8 w-8 text-guinea-red" />
                </div>
                <h3 className="font-semibold mb-2">Livraison écoresponsable</h3>
                <p className="text-gray-600 text-sm">
                  Service de livraison rapide et fiable
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-guinea-red/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-guinea-red" />
                </div>
                <h3 className="font-semibold mb-2">Réduisez vos coûts</h3>
                <p className="text-gray-600 text-sm">
                  Réduisez vos coûts de communication et de logistique
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-guinea-red/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-guinea-red" />
                </div>
                <h3 className="font-semibold mb-2">Plateforme moderne</h3>
                <p className="text-gray-600 text-sm">
                  Référencé sur une plateforme moderne, 100% guinéenne
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
                <h3 className="font-semibold mb-2">Comment fonctionne l'abonnement ?</h3>
                <p className="text-gray-600">
                  Choisissez la durée d'engagement qui vous convient (1, 3, 6 ou 12 mois). Plus l'engagement est long, plus vous réalisez d'économies.
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Y a-t-il des frais de configuration ?</h3>
                <p className="text-gray-600">
                  Non, il n'y a aucun frais de configuration. Votre compte est opérationnel dès l'inscription.
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Quels sont les moyens de paiement acceptés ?</h3>
                <p className="text-gray-600">
                  Nous acceptons les cartes bancaires, les virements bancaires et les paiements mobiles (Orange Money, MTN Money).
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Puis-je annuler mon abonnement ?</h3>
                <p className="text-gray-600">
                  Vous pouvez annuler à tout moment, mais l'engagement choisi reste en vigueur jusqu'à la fin de la période payée.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-guinea-red to-guinea-red/90 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à devenir partenaire ?</h2>
            <p className="text-xl mb-8 text-white/90">
              Rejoignez des centaines de commerces qui font confiance à BraPrime
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/devenir-partenaire">
                <Button size="lg" className="bg-white text-guinea-red hover:bg-gray-100">
                  Devenir partenaire
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