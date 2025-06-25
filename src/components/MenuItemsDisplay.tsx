import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/AddToCartButton';
import { MenuCategory, MenuItem } from '@/lib/services/business';
import { Clock, Star, ShoppingBag } from 'lucide-react';

interface MenuItemsDisplayProps {
  categories: MenuCategory[];
  items: MenuItem[];
  businessId: number;
  businessName: string;
}

const MenuItemsDisplay: React.FC<MenuItemsDisplayProps> = ({
  categories,
  items,
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

  // Filtrer les catégories qui ont des articles
  const categoriesWithItems = categories.filter(category => 
    items.some(item => item.category_id === category.id)
  );

  if (categoriesWithItems.length === 0) {
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
    <div className="w-full">
      {/* En-tête - Catégories de menu */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Catégories de Menu</h2>
        <p className="text-gray-600 mb-6">
          Choisissez une catégorie pour voir les articles disponibles
        </p>
      </div>

      <Tabs defaultValue={categoriesWithItems[0].id.toString()} className="w-full">
        {/* Onglets des catégories - Mise en avant */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex overflow-x-auto hide-scrollbar">
            <TabsList className="bg-transparent h-auto p-2 rounded-none w-full justify-start">
              {categoriesWithItems.map(category => {
                const itemCount = items.filter(item => item.category_id === category.id).length;
                return (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id.toString()}
                    className="flex flex-col items-center py-3 px-4 rounded-md data-[state=active]:bg-guinea-red data-[state=active]:text-white data-[state=active]:shadow whitespace-nowrap min-w-[100px]"
                  >
                    <span className="font-medium text-sm">{category.name}</span>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {itemCount}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>
        
        {/* Contenu des catégories */}
        {categoriesWithItems.map(category => {
          const categoryItems = items.filter(item => item.category_id === category.id);
          
          return (
            <TabsContent key={category.id} value={category.id.toString()} className="py-4">
              <div className="space-y-6">
                {/* En-tête de la catégorie */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600">
                    {categoryItems.length} article{categoryItems.length > 1 ? 's' : ''} disponible{categoryItems.length > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Grille des articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryItems.map(item => (
                    <div key={item.id} className="flex bg-white rounded-lg overflow-hidden shadow-sm border">
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-lg">{item.name}</h4>
                          {item.is_popular && (
                            <Badge className="bg-guinea-red/90 text-white text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Populaire
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        
                        {/* Informations nutritionnelles si disponibles */}
                        {item.nutritional_info && Object.keys(item.nutritional_info).length > 0 && (
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            {item.nutritional_info.calories && (
                              <span>{item.nutritional_info.calories} cal</span>
                            )}
                            {item.nutritional_info.proteines && (
                              <span>{item.nutritional_info.proteines}g protéines</span>
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

                {/* Message si pas d'articles dans cette catégorie */}
                {categoryItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun article disponible dans cette catégorie.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default MenuItemsDisplay; 