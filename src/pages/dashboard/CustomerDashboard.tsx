import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Search as SearchIcon, 
  MapPin as MapPinIcon, 
  Clock as ClockIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  ChevronRight as ChevronRightIcon,
  ShoppingBag as ShoppingBagIcon,
  Filter as FilterIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for Guinea Conakry restaurants
const mockRestaurants = [
  {
    id: 1,
    name: "Le Petit Conakry",
    image: "/images/restaurants/restaurant-1.jpg",
    cuisine: "Traditionnelle Guinéenne",
    rating: 4.7,
    deliveryTime: "25-35 min",
    deliveryFee: 15000, // in GNF
    distance: "1.8 km",
    address: "15 Rue du Port, Commune de Kaloum, Conakry",
    featured: true,
    tags: ["Traditionnel", "Populaire"]
  },
  {
    id: 2,
    name: "Miam Saveurs",
    image: "/images/restaurants/restaurant-2.jpg",
    cuisine: "Fusion Africaine",
    rating: 4.5,
    deliveryTime: "30-45 min",
    deliveryFee: 20000, // in GNF
    distance: "2.5 km",
    address: "Route Le Prince, Commune de Ratoma, Conakry",
    featured: true,
    tags: ["Fusion", "Chic"]
  },
  {
    id: 3,
    name: "Saveurs d'Afrique",
    image: "/images/restaurants/restaurant-3.jpg",
    cuisine: "Panafricaine",
    rating: 4.8,
    deliveryTime: "20-30 min",
    deliveryFee: 15000, // in GNF
    distance: "1.2 km",
    address: "Avenue de la République, Commune de Dixinn, Conakry",
    featured: false,
    tags: ["Africain", "Rapide"]
  },
  {
    id: 4,
    name: "Le Gourmet",
    image: "/images/restaurants/restaurant-4.jpg",
    cuisine: "Internationale",
    rating: 4.6,
    deliveryTime: "35-50 min",
    deliveryFee: 25000, // in GNF
    distance: "3.0 km",
    address: "Rue KA-003, Commune de Kaloum, Conakry",
    featured: false,
    tags: ["International", "Premium"]
  }
];

// Mock data for recent orders
const mockRecentOrders = [
  {
    id: "ORD-001",
    restaurant: "Le Petit Conakry",
    items: [
      { name: "Poulet Yassa", price: 60000 },
      { name: "Jus de Gingembre", price: 20000 }
    ],
    total: 95000, // including delivery fee
    date: "Aujourd'hui, 13:45",
    status: "delivered",
    deliveryTime: "25 min"
  },
  {
    id: "ORD-002",
    restaurant: "Miam Saveurs",
    items: [
      { name: "Poisson Braisé", price: 75000 },
      { name: "Alloco", price: 25000 },
      { name: "Jus de Bissap", price: 15000 }
    ],
    total: 135000, // including delivery fee
    date: "Hier, 19:30",
    status: "delivered",
    deliveryTime: "40 min"
  }
];

// Mock data for popular dishes
const mockPopularDishes = [
  {
    id: 1,
    name: "Poulet Yassa",
    restaurant: "Le Petit Conakry",
    image: "/images/dishes/dish-1.jpg",
    price: 60000, // in GNF
    rating: 4.8
  },
  {
    id: 2,
    name: "Thiéboudienne",
    restaurant: "Saveurs d'Afrique",
    image: "/images/dishes/dish-2.jpg",
    price: 50000, // in GNF
    rating: 4.7
  },
  {
    id: 3,
    name: "Poisson Braisé",
    restaurant: "Miam Saveurs",
    image: "/images/dishes/dish-3.jpg",
    price: 75000, // in GNF
    rating: 4.9
  },
  {
    id: 4,
    name: "Riz au Gras",
    restaurant: "Le Gourmet",
    image: "/images/dishes/dish-4.jpg",
    price: 45000, // in GNF
    rating: 4.6
  }
];

// Helper to format price in GNF
const formatGNF = (amount: number) => {
  return `${amount.toLocaleString('fr-GN')} GNF`;
};

// Helper to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'delivered':
      return <Badge className="bg-green-500 text-white">Livré</Badge>;
    case 'in-progress':
      return <Badge className="bg-blue-500 text-white">En livraison</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500 text-white">En préparation</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500 text-white">Annulé</Badge>;
    default:
      return <Badge className="bg-gray-500 text-white">{status}</Badge>;
  }
};

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  
  return (
    <div className="p-6 w-full">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Bonjour, {user?.name || "cher client"}!
            </h1>
            <p className="text-muted-foreground">
              Que voulez-vous manger aujourd'hui?
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative w-full md:w-64">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher des restaurants..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                  <SheetDescription>
                    Affinez votre recherche de restaurants et plats
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <Label htmlFor="cuisine">Type de cuisine</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Guinéenne</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Africaine</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Internationale</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Fusion</Badge>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="price">Prix</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Économique</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Moyen</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Premium</Badge>
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <Button>Appliquer les filtres</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <Tabs defaultValue="discover" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="discover">Découvrir</TabsTrigger>
            <TabsTrigger value="orders">Mes commandes</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
          </TabsList>
          
          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Restaurants en vedette</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockRestaurants
                  .filter(restaurant => restaurant.featured)
                  .map(restaurant => (
                    <Card key={restaurant.id} className="overflow-hidden">
                      <div className="relative h-40 bg-muted">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400x200/e2e8f0/64748b?text=Restaurant+Image";
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <Button variant="ghost" size="icon" className="rounded-full bg-background/80 hover:bg-background/90">
                            <HeartIcon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{restaurant.rating}</span>
                          </div>
                        </div>
                        <CardDescription>{restaurant.cuisine}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{restaurant.distance}</span>
                          <span className="text-muted-foreground">•</span>
                          <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{restaurant.deliveryTime}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {restaurant.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs font-normal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Frais de livraison</p>
                          <p className="font-medium">{formatGNF(restaurant.deliveryFee)}</p>
                        </div>
                        <Button size="sm" asChild>
                          <Link to={`/restaurants/${restaurant.id}`}>
                            Commander
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" asChild>
                  <Link to="/restaurants">Voir tous les restaurants</Link>
                </Button>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Plats populaires</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockPopularDishes.map(dish => (
                  <Card key={dish.id} className="overflow-hidden">
                    <div className="relative h-32 bg-muted">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/300x200/e2e8f0/64748b?text=Dish+Image";
                        }}
                      />
                    </div>
                    <CardHeader className="p-3">
                      <CardTitle className="text-base">{dish.name}</CardTitle>
                      <CardDescription className="text-xs">{dish.restaurant}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-3 pt-0 flex justify-between items-center">
                      <p className="font-medium">{formatGNF(dish.price)}</p>
                      <Button size="sm" variant="outline">
                        <ShoppingBagIcon className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Tous les restaurants</h2>
              <div className="space-y-4">
                {mockRestaurants.map(restaurant => (
                  <Card key={restaurant.id}>
                    <div className="flex flex-col md:flex-row overflow-hidden">
                      <div className="relative w-full md:w-40 h-32 bg-muted flex-shrink-0">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400x200/e2e8f0/64748b?text=Restaurant+Image";
                          }}
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{restaurant.name}</h3>
                            <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                          </div>
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{restaurant.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                          <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{restaurant.distance}</span>
                          <span className="text-muted-foreground">•</span>
                          <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{restaurant.deliveryTime}</span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Frais de livraison</p>
                            <p className="font-medium">{formatGNF(restaurant.deliveryFee)}</p>
                          </div>
                          <Button size="sm" asChild>
                            <Link to={`/restaurants/${restaurant.id}`}>
                              Commander
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Commandes récentes</h2>
              {mockRecentOrders.length > 0 ? (
                <div className="space-y-4">
                  {mockRecentOrders.map(order => (
                    <Card key={order.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base font-medium">{order.restaurant}</CardTitle>
                            <CardDescription>{order.date}</CardDescription>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name}</span>
                              <span>{formatGNF(item.price)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-medium">{formatGNF(order.total)}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/orders/${order.id}`}>
                            Détails <ChevronRightIcon className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      Vous n'avez pas encore de commandes
                    </p>
                    <Button className="mt-4" asChild>
                      <Link to="/restaurants">
                        Explorer les restaurants
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <div className="mt-4 flex justify-center">
                <Button variant="outline" asChild>
                  <Link to="/orders">
                    Voir toutes mes commandes
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Mes Favoris</CardTitle>
                <CardDescription>
                  Restaurants et plats que vous avez ajoutés à vos favoris
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore de favoris
                </p>
                <Button asChild>
                  <Link to="/restaurants">
                    Explorer les restaurants
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard; 