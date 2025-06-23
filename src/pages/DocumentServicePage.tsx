import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useOrder } from '@/contexts/OrderContext';
import { 
  Clock, Star, Phone, MapPin, ChevronLeft, 
  ChevronRight, Info, Heart, Share, ShoppingBag,
  FileText, FileCheck, FileClock
} from 'lucide-react';

// Dummy data for document service providers - this would come from an API in a real app
const documentServices = [
  {
    id: "1",
    name: "DocExpress",
    coverImage: "https://images.unsplash.com/photo-1568219656418-15c329312bf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    description: "Service rapide et fiable de livraison de documents administratifs, professionnels et personnels. DocExpress assure la sécurité de vos documents pendant tout le processus de transport.",
    serviceType: "Service Express",
    rating: 4.9,
    reviewCount: 156,
    deliveryTime: "30-60 min",
    deliveryFee: "10,000 GNF",
    address: "Avenue de la République, Kaloum, Conakry",
    phone: "+224 628 33 44 55",
    openingHours: "07:00 - 22:00",
    categories: [
      { id: 1, name: "Populaires" },
      { id: 2, name: "Administratif" },
      { id: 3, name: "Professionnel" },
      { id: 4, name: "Académique" },
      { id: 5, name: "International" }
    ],
    services: [
      {
        id: 1,
        name: "Livraison Standard",
        description: "Livraison de documents en 1-2 heures dans la ville de Conakry",
        price: 25000,
        image: "https://images.unsplash.com/photo-1542393545-10f5cde2c810?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 2
      },
      {
        id: 2,
        name: "Livraison Urgente",
        description: "Livraison express en moins de 30 minutes pour les documents prioritaires",
        price: 45000,
        image: "https://images.unsplash.com/photo-1568219656418-15c329312bf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 2
      },
      {
        id: 3,
        name: "Documents Administratifs",
        description: "Transport sécurisé de documents administratifs avec traçabilité",
        price: 30000,
        image: "https://images.unsplash.com/photo-1586282391129-76a6df230234?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 2
      },
      {
        id: 4,
        name: "Contrats Professionnels",
        description: "Livraison de contrats et documents professionnels avec signature requise",
        price: 35000,
        image: "https://images.unsplash.com/photo-1555421689-3f034debb7a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: false,
        categoryId: 3
      },
      {
        id: 5,
        name: "Documents Confidentiels",
        description: "Service spécial pour documents sensibles avec garantie de confidentialité",
        price: 50000,
        image: "https://images.unsplash.com/photo-1629392554711-1b9d935e711b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 3
      },
      {
        id: 6,
        name: "Documents Académiques",
        description: "Transport de documents académiques, diplômes et relevés de notes",
        price: 28000,
        image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: false,
        categoryId: 4
      },
      {
        id: 7,
        name: "Livraison Internationale",
        description: "Service de livraison de documents vers des destinations internationales",
        price: 180000,
        image: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 5
      }
    ]
  },
  {
    id: "2",
    name: "PaperTrail",
    coverImage: "https://images.unsplash.com/photo-1586282391129-76a6df230234?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    description: "Spécialiste des documents administratifs et internationaux. PaperTrail offre un service fiable de transport de documents avec une expertise particulière pour les formalités administratives et consulaires.",
    serviceType: "Documents administratifs",
    rating: 4.7,
    reviewCount: 103,
    deliveryTime: "40-70 min",
    deliveryFee: "12,000 GNF",
    address: "Rue KA-020, Dixinn, Conakry",
    phone: "+224 622 87 65 43",
    openingHours: "08:00 - 18:00",
    categories: [
      { id: 1, name: "Populaires" },
      { id: 2, name: "Administratif" },
      { id: 3, name: "International" },
      { id: 4, name: "Légalisation" }
    ],
    services: [
      {
        id: 1,
        name: "Documents d'Identité",
        description: "Transport sécurisé de passeports, cartes d'identité et autres pièces officielles",
        price: 30000,
        image: "https://images.unsplash.com/photo-1551739440-5dd934d3a94a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 2
      },
      {
        id: 2,
        name: "Documents Consulaires",
        description: "Prise en charge et livraison de documents pour les ambassades et consulats",
        price: 45000,
        image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 3
      },
      {
        id: 3,
        name: "Légalisation de Documents",
        description: "Service de légalisation et d'apostille pour documents officiels",
        price: 60000,
        image: "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: false,
        categoryId: 4
      },
      {
        id: 4,
        name: "Visas et Immigration",
        description: "Transport de dossiers de demande de visa et documents d'immigration",
        price: 50000,
        image: "https://images.unsplash.com/photo-1611516330675-b7e0d1df8d2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 3
      }
    ]
  }
];

const DocumentServicePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // Find the document service by ID
  const service = documentServices.find(svc => svc.id === id) || documentServices[0];
  
  const handleAddToCart = (item: {
    id: number;
    name: string;
    price: number;
    image?: string;
  }) => {
    addToCart(
      { 
        id: item.id, 
        name: item.name, 
        price: item.price,
        quantity: 1,
        image: item.image
      },
      parseInt(service.id), // Convert string ID to number
      service.name
    );
    
    toast({
      title: "Ajouté au panier",
      description: "Ce service a été ajouté à votre panier",
    });
  };
  
  const getItemQuantity = (itemId: number) => {
    const item = cart.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };
  
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  
  return (
    <Layout>
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden">
        <img 
          src={service.coverImage} 
          alt={service.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={service.logo} 
              alt={`${service.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{service.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{service.serviceType}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{service.rating}</span>
                <span className="text-xs ml-1">({service.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{service.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Service Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{service.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{service.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{service.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {service.openingHours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {service.deliveryFee}</span>
            </div>
          </div>
          <div className="flex mt-6 space-x-4">
            <Button variant="outline" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Favoris
            </Button>
            <Button variant="outline" className="flex items-center">
              <Share className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>
        
        {/* Services */}
        <Tabs defaultValue={service.categories[0].id.toString()} className="w-full">
          <div className="border-b">
            <div className="flex overflow-x-auto hide-scrollbar pb-2">
              <TabsList className="bg-transparent h-auto p-0 rounded-none">
                {service.categories.map(category => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id.toString()}
                    className="py-2 px-4 rounded-md data-[state=active]:bg-guinea-red data-[state=active]:text-white data-[state=active]:shadow"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
          
          {service.categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {service.services
                  .filter(service => 
                    category.id === 1 
                      ? service.popular 
                      : service.categoryId === category.id
                  )
                  .map(serviceItem => (
                    <div key={serviceItem.id} className="flex bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="flex-1 p-4">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{serviceItem.name}</h3>
                          {serviceItem.popular && (
                            <Badge className="bg-guinea-red/90">Populaire</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1 mb-2 line-clamp-2">
                          {serviceItem.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-medium">{(serviceItem.price).toLocaleString()} GNF</span>
                          <div className="flex items-center">
                            {getItemQuantity(serviceItem.id) > 0 ? (
                              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                <button 
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700" 
                                  onClick={() => {
                                    // Code for decreasing quantity would go here
                                  }}
                                >
                                  -
                                </button>
                                <span className="px-3 py-1">{getItemQuantity(serviceItem.id)}</span>
                                <button 
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  onClick={() => handleAddToCart(serviceItem)}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <Button 
                                onClick={() => handleAddToCart(serviceItem)}
                                className="bg-guinea-red hover:bg-guinea-red/90"
                                size="sm"
                              >
                                Ajouter
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {serviceItem.image && (
                        <div className="hidden md:block w-32 h-32 p-2">
                          <img 
                            src={serviceItem.image} 
                            alt={serviceItem.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Shopping Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 right-4 z-10">
          <Button 
            className="bg-guinea-red hover:bg-guinea-red/90 rounded-full w-14 h-14 flex items-center justify-center relative shadow-lg"
            onClick={() => {
              // Navigate to cart or open cart modal
            }}
          >
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-white text-guinea-red text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default DocumentServicePage; 