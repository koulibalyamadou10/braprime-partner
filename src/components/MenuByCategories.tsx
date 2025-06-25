import React from 'react';
import { MenuDataByCategories, MenuItem } from '@/lib/services/business';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Utensils, ChefHat, Star, Clock, 
  ShoppingBag, Package, TrendingUp
} from 'lucide-react';

interface MenuByCategoriesProps {
  menuData: MenuDataByCategories;
  businessId: number;
  businessName: string;
}

const MenuByCategories: React.FC<MenuByCategoriesProps> = ({
  menuData,
  businessId,
  businessName
}) => {
  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  if (menuData.totalCategories === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Aucun menu disponible</h2>
        <p className="text-gray-600">Ce commerce n'a pas encore de menu en ligne.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête avec statistiques */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Utensils className="h-6 w-6 text-guinea-red mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Menu Organisé</h2>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-1" />
              <span>{menuData.totalItems} articles</span>
            </div>
            <div className="flex items-center">
              <ChefHat className="h-4 w-4 mr-1" />
              <span>{menuData.totalCategories} catégories</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600">
          Découvrez nos spécialités organisées par catégories pour une navigation facile
        </p>
      </div>

      {/* Affichage des catégories avec leurs articles */}
      <div className="space-y-6">
        {menuData.categories.map((category, categoryIndex) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-guinea-red/5 to-guinea-red/10 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-guinea-red/10 rounded-full flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-guinea-red" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      {category.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {category.itemCount} article{category.itemCount > 1 ? 's' : ''} disponible{category.itemCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-guinea-red border-guinea-red">
                  Catégorie {categoryIndex + 1}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {category.items.map((item) => (
                  <div key={item.id} className="flex bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg text-gray-900">{item.name}</h4>
                        <div className="flex items-center space-x-2">
                          {item.is_popular && (
                            <Badge className="bg-guinea-red/90 text-white text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Populaire
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      
                      {/* Informations nutritionnelles si disponibles */}
                      {item.nutritional_info && Object.keys(item.nutritional_info).length > 0 && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          {item.nutritional_info.calories && (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                              {item.nutritional_info.calories} cal
                            </span>
                          )}
                          {item.nutritional_info.proteines && (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                              {item.nutritional_info.proteines}g protéines
                            </span>
                          )}
                        </div>
                      )}

                      {/* Allergènes si disponibles */}
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Allergènes :</p>
                          <div className="flex flex-wrap gap-1">
                            {item.allergens.map((allergen, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {allergen}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prix et bouton d'ajout */}
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-guinea-red">
                          {formatCurrency(item.price)}
                        </div>
                        <AddToCartButton
                          item={{
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image
                          }}
                          businessId={businessId}
                          businessName={businessName}
                          variant="card"
                        />
                      </div>
                    </div>
                    
                    {/* Image de l'article */}
                    <div className="hidden md:block w-24 h-auto">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Résumé final */}
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-1" />
            <span>Total : {menuData.totalItems} articles</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center">
            <ChefHat className="h-4 w-4 mr-1" />
            <span>{menuData.totalCategories} catégories</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1" />
            <span>Menu complet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuByCategories; 