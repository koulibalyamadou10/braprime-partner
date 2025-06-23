import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import PopularItems from '@/components/PopularItems';
import FeaturedItems from '@/components/FeaturedItems';
import LiveStats from '@/components/LiveStats';
import HowItWorks from '@/components/HowItWorks';
import { ShieldCheck, Clock, ThumbsUp } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <LiveStats />
      <Categories />
      <PopularItems />
      <FeaturedItems />
      
      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Pourquoi choisir BraPrime?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl">
              <div className="bg-guinea-red/10 p-4 rounded-full mb-4">
                <ShieldCheck className="h-10 w-10 text-guinea-red" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sécurité et confiance</h3>
              <p className="text-gray-600">
                Tous nos livreurs sont vérifiés et formés pour garantir un service sûr et fiable dans toute la Guinée.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl">
              <div className="bg-guinea-yellow/10 p-4 rounded-full mb-4">
                <Clock className="h-10 w-10 text-guinea-yellow" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Livraison rapide</h3>
              <p className="text-gray-600">
                Notre réseau de livreurs locaux connaît parfaitement chaque quartier pour une livraison rapide même dans les zones reculées.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl">
              <div className="bg-guinea-green/10 p-4 rounded-full mb-4">
                <ThumbsUp className="h-10 w-10 text-guinea-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Qualité garantie</h3>
              <p className="text-gray-600">
                Nous travaillons avec les meilleurs restaurants et commerces de Conakry et des provinces pour vous offrir une qualité exceptionnelle.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <HowItWorks />
      
      {/* App Download Section (Coming Soon) */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Application mobile
                <span className="block mt-2 text-guinea-yellow">Bientôt disponible!</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-md">
                Notre application mobile sera bientôt disponible pour faciliter vos commandes. Restez à l'écoute!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button disabled className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-6 rounded-lg flex items-center opacity-70 cursor-not-allowed">
                  <span className="mr-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.954 11.616L15.911 8.65899L6.36 3.29199C5.727 2.94599 5.134 2.82899 4.614 2.92599L12.954 11.616Z" fill="white"/>
                      <path d="M16.415 15.312L19.489 13.619C20.089 13.283 20.472 12.799 20.501 12.268C20.53 11.737 20.187 11.226 19.612 10.857L16.619 9.12695L13.378 12.367L16.415 15.312Z" fill="white"/>
                      <path d="M4.302 3.37793C4.183 3.56093 4.125 3.78693 4.125 4.04593V19.8319C4.125 20.1189 4.194 20.3629 4.334 20.5549L12.366 12.5229L4.302 3.37793Z" fill="white"/>
                      <path d="M12.821 12.941L4.621 21.142C4.818 21.201 5.032 21.216 5.254 21.178C5.563 21.126 5.894 20.978 6.209 20.805L16.096 15.707L12.821 12.941Z" fill="white"/>
                    </svg>
                  </span>
                  Play Store
                </button>
                <button disabled className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-6 rounded-lg flex items-center opacity-70 cursor-not-allowed">
                  <span className="mr-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.0781 24H4.92188C3.30795 24 2 22.692 2 21.0781V2.92188C2 1.30795 3.30795 0 4.92188 0H19.0781C20.692 0 22 1.30795 22 2.92188V21.0781C22 22.692 20.692 24 19.0781 24Z" fill="transparent"/>
                      <path d="M15.9977 12.0825C15.9843 10.2474 17.4371 9.28638 17.4996 9.24638C16.6173 7.94388 15.1977 7.73888 14.7125 7.72138C13.4546 7.58263 12.2459 8.47513 11.6034 8.47513C10.9446 8.47513 9.97334 7.73513 8.9127 7.75763C7.55208 7.78013 6.27458 8.56263 5.58646 9.80388C4.16083 12.3214 5.21896 16.0389 6.57958 18.0151C7.26771 18.9776 8.07458 20.0564 9.14021 20.0114C10.1765 19.9664 10.5727 19.3451 11.8321 19.3451C13.0765 19.3451 13.4584 20.0114 14.5384 19.9851C15.6484 19.9664 16.3371 19.0189 17.004 18.0489C17.7909 16.9289 18.109 15.8201 18.1227 15.7676C18.0934 15.7526 16.0146 14.9339 15.9977 12.0825Z" fill="white"/>
                      <path d="M14.4449 6.05137C15.0015 5.35699 15.3737 4.39387 15.269 3.42012C14.4584 3.45887 13.4452 3.99512 12.8627 4.66762C12.3462 5.26012 11.8965 6.25075 12.0149 7.19075C12.9265 7.26825 13.8602 6.73575 14.4449 6.05137Z" fill="white"/>
                    </svg>
                  </span>
                  App Store
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-96 bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gray-700 flex items-center justify-center">
                  <div className="w-24 h-4 bg-gray-600 rounded-full"></div>
                </div>
                <div className="w-full h-full pt-8 pb-6 px-4 flex flex-col">
                  <div className="flex-grow guinea-gradient opacity-10"></div>
                  <div className="absolute inset-8 flex flex-col">
                    <div className="h-16 w-full bg-gray-700 rounded-lg mb-4 animate-pulse-slow"></div>
                    <div className="h-24 w-full bg-gray-700 rounded-lg mb-4 animate-pulse-slow"></div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-700 rounded-lg animate-pulse-slow"></div>
                      ))}
                    </div>
                    <div className="h-12 w-full bg-guinea-red opacity-30 rounded-lg mt-4"></div>
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
