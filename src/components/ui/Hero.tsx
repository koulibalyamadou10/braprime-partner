import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute inset-y-0 left-0 w-1/3 guinea-gradient opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-guinea-yellow opacity-20" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-guinea-green opacity-20" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              <span className="block">Livraison rapide à</span>
              <span className="text-guinea-red">Guinea Conakry</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
              Commandez de la nourriture, des courses et des articles essentiels auprès de vos restaurants et commerces locaux préférés. Livraison rapide dans toutes les régions de Guinée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative w-full max-w-md mx-auto aspect-square">
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-white">
                <div className="guinea-gradient h-1/3 w-full"></div>
                <div className="p-8">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
                  <div className="w-3/4 h-6 bg-gray-300 rounded-md mb-4 animate-pulse"></div>
                  <div className="w-1/2 h-6 bg-gray-300 rounded-md mb-8 animate-pulse"></div>
                  <div className="flex justify-between items-center">
                    <div className="w-1/3 h-10 bg-guinea-green rounded-md animate-pulse"></div>
                    <div className="w-1/3 h-10 bg-guinea-red rounded-md animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
