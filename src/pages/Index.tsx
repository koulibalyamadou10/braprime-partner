import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import PopularItems from '@/components/PopularItems';
import FeaturedItems from '@/components/FeaturedItems';
import HowItWorks from '@/components/HowItWorks';
import { PartnerSection } from '@/components/PartnerSection';
import { ForceLogoutButton } from '@/components/ForceLogoutButton';
import { ShieldCheck, Clock, ThumbsUp, Truck, Users, MapPin } from 'lucide-react';
import { useHomepage } from '@/hooks/use-homepage';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isLoading, error } = useHomepage();
  const { isAuthenticated, currentUser } = useAuth();

  return (
    <Layout>
      {/* Bouton de déconnexion forcée temporaire */}
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <ForceLogoutButton />
        </div>
      )}
      
      <Hero />
      <Categories />
      <PopularItems />
      <FeaturedItems />
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi choisir BraPrime?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez les avantages qui font de BraPrime la plateforme de livraison préférée en Guinée
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="bg-guinea-red/10 p-6 rounded-full mb-6">
                <ShieldCheck className="h-12 w-12 text-guinea-red" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Sécurité et confiance</h3>
              <p className="text-gray-600 leading-relaxed">
                Tous nos livreurs sont vérifiés et formés pour garantir un service sûr et fiable dans toute la Guinée.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="bg-guinea-yellow/10 p-6 rounded-full mb-6">
                <Clock className="h-12 w-12 text-guinea-yellow" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Livraison rapide</h3>
              <p className="text-gray-600 leading-relaxed">
                Notre réseau de livreurs locaux connaît parfaitement chaque quartier pour une livraison rapide même dans les zones reculées.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="bg-guinea-green/10 p-6 rounded-full mb-6">
                <ThumbsUp className="h-12 w-12 text-guinea-green" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Qualité garantie</h3>
              <p className="text-gray-600 leading-relaxed">
                Nous travaillons avec les meilleurs restaurants et commerces de Conakry et des provinces pour vous offrir une qualité exceptionnelle.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="bg-blue-500/10 p-6 rounded-full mb-6">
                <Truck className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Suivi en temps réel</h3>
              <p className="text-gray-600 leading-relaxed">
                Suivez votre commande en temps réel et recevez des notifications à chaque étape de la livraison.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="bg-purple-500/10 p-6 rounded-full mb-6">
                <Users className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Support client 24/7</h3>
              <p className="text-gray-600 leading-relaxed">
                Notre équipe de support est disponible 24h/24 pour répondre à toutes vos questions et résoudre vos problèmes.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="bg-orange-500/10 p-6 rounded-full mb-6">
                <MapPin className="h-12 w-12 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Couverture nationale</h3>
              <p className="text-gray-600 leading-relaxed">
                Service disponible dans toutes les régions de Guinée, de Conakry aux provinces les plus reculées.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <HowItWorks />
      
      {/* Partner Section */}
      <PartnerSection />
      
      {/* App Download Section (Coming Soon) */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-guinea-red rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-guinea-yellow rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Application mobile
                <span className="block mt-2 text-guinea-yellow">Bientôt disponible!</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-md leading-relaxed">
                Notre application mobile sera bientôt disponible pour faciliter vos commandes. 
                Commandez en un clic, suivez en temps réel et profitez d'offres exclusives !
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button disabled className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-4 px-8 rounded-xl flex items-center opacity-70 cursor-not-allowed transition-all duration-300">
                  <span className="mr-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.954 11.616L15.911 8.65899L6.36 3.29199C5.727 2.94599 5.134 2.82899 4.614 2.92599L12.954 11.616Z" fill="white"/>
                      <path d="M16.415 15.312L19.489 13.619C20.089 13.283 20.472 12.799 20.501 12.268C20.53 11.737 20.187 11.226 19.612 10.857L16.619 9.12695L13.378 12.367L16.415 15.312Z" fill="white"/>
                      <path d="M4.302 3.37793C4.183 3.56093 4.125 3.78693 4.125 4.04593V19.8319C4.125 20.1189 4.194 20.3629 4.334 20.5549L12.366 12.5229L4.302 3.37793Z" fill="white"/>
                      <path d="M12.821 12.941L4.621 21.142C4.818 21.201 5.032 21.216 5.254 21.178C5.563 21.126 5.894 20.978 6.209 20.805L16.096 15.707L12.821 12.941Z" fill="white"/>
                    </svg>
                  </span>
                  <div className="text-left">
                    <div className="text-xs opacity-75">Télécharger sur</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </button>
                <button disabled className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-4 px-8 rounded-xl flex items-center opacity-70 cursor-not-allowed transition-all duration-300">
                  <span className="mr-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.0781 24H4.92188C3.30795 24 2 22.692 2 21.0781V2.92188C2 1.30795 3.30795 0 4.92188 0H19.0781C20.692 0 22 1.30795 22 2.92188V21.0781C22 22.692 20.692 24 19.0781 24Z" fill="transparent"/>
                      <path d="M15.9977 12.0825C15.9843 10.2474 17.4371 9.28638 17.4996 9.24638C16.6173 7.94388 15.1977 7.73888 14.7125 7.72138C13.4546 7.58263 12.2459 8.47513 11.6034 8.47513C10.9446 8.47513 9.97334 7.73513 8.9127 7.75763C7.55208 7.78013 6.27458 8.56263 5.58646 9.80388C4.16083 12.3214 5.21896 16.0389 6.57958 18.0151C7.26771 18.9776 8.07458 20.0564 9.14021 20.0114C10.1765 19.9664 10.5727 19.3451 11.8321 19.3451C13.0765 19.3451 13.4584 20.0114 14.5384 19.9851C15.6484 19.9664 16.3371 19.0189 17.004 18.0489C17.7909 16.9289 18.109 15.8201 18.1227 15.7676C18.0934 15.7526 16.0146 14.9339 15.9977 12.0825Z" fill="white"/>
                      <path d="M14.4449 6.05137C15.0015 5.35699 15.3737 4.39387 15.269 3.42012C14.4584 3.45887 13.4452 3.99512 12.8627 4.66762C12.3462 5.26012 11.8965 6.25075 12.0149 7.19075C12.9265 7.26825 13.8602 6.73575 14.4449 6.05137Z" fill="white"/>
                    </svg>
                  </span>
                  <div className="text-left">
                    <div className="text-xs opacity-75">Télécharger sur</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-72 h-96 bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-10 bg-gray-700 flex items-center justify-center">
                  <div className="w-32 h-5 bg-gray-600 rounded-full"></div>
                </div>
                <div className="w-full h-full pt-10 pb-8 px-6 flex flex-col">
                  <div className="flex-grow guinea-gradient opacity-10"></div>
                  <div className="absolute inset-10 flex flex-col">
                    <div className="h-20 w-full bg-gray-700 rounded-xl mb-4 animate-pulse-slow"></div>
                    <div className="h-28 w-full bg-gray-700 rounded-xl mb-4 animate-pulse-slow"></div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-700 rounded-xl animate-pulse-slow"></div>
                      ))}
                    </div>
                    <div className="h-16 w-full bg-guinea-red opacity-30 rounded-xl mt-6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
