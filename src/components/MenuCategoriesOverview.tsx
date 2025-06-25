import React from 'react';
import { MenuCategory, MenuItem } from '@/lib/services/business';
import { Badge } from '@/components/ui/badge';
import { Utensils, ChefHat } from 'lucide-react';

interface MenuCategoriesOverviewProps {
  categories: MenuCategory[];
  items: MenuItem[];
}

const MenuCategoriesOverview: React.FC<MenuCategoriesOverviewProps> = ({
  categories,
  items
}) => {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center mb-4">
        <Utensils className="h-6 w-6 text-guinea-red mr-2" />
        <h2 className="text-xl font-bold text-gray-900">
          Menu - {categories.length} catégorie{categories.length > 1 ? 's' : ''} disponible{categories.length > 1 ? 's' : ''}
        </h2>
      </div>
      
      <p className="text-gray-600 mb-4">
        Découvrez nos spécialités organisées par catégories
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.slice(0, 4).map(category => {
          const itemCount = items.filter(item => item.category_id === category.id).length;
          return (
            <div key={category.id} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 mx-auto mb-2 bg-guinea-red/10 rounded-full flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-guinea-red" />
              </div>
              <div className="text-xl font-bold text-guinea-red mb-1">{itemCount}</div>
              <div className="text-sm font-medium text-gray-700">{category.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {itemCount} article{itemCount > 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
        
        {categories.length > 4 && (
          <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
            <div className="w-12 h-12 mx-auto mb-2 bg-guinea-red/10 rounded-full flex items-center justify-center">
              <Utensils className="h-6 w-6 text-guinea-red" />
            </div>
            <div className="text-xl font-bold text-guinea-red mb-1">+{categories.length - 4}</div>
            <div className="text-sm font-medium text-gray-700">Autres catégories</div>
            <div className="text-xs text-gray-500 mt-1">à découvrir</div>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total d'articles : {items.length}</span>
          <Badge variant="outline" className="text-guinea-red border-guinea-red">
            Menu complet
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default MenuCategoriesOverview; 