import React from 'react';
import { MenuCategory, MenuItem } from '@/lib/services/business';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, Database, AlertTriangle } from 'lucide-react';

interface MenuDebugProps {
  categories: MenuCategory[];
  items: MenuItem[];
  businessId: number;
}

const MenuDebug: React.FC<MenuDebugProps> = ({
  categories,
  items,
  businessId
}) => {
  return (
    <div className="space-y-6">
      {/* En-tête de débogage */}
      <Alert className="border-orange-200 bg-orange-50">
        <Bug className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Mode débogage - Affichage des données brutes du menu
        </AlertDescription>
      </Alert>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Statistiques des Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-blue-800">Catégories</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{items.length}</div>
              <div className="text-sm text-green-800">Articles</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{businessId}</div>
              <div className="text-sm text-purple-800">Business ID</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catégories */}
      <Card>
        <CardHeader>
          <CardTitle>Catégories de Menu</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Aucune catégorie trouvée pour le business ID {businessId}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-600">
                      ID: {category.id} | Business: {category.business_id} | Ordre: {category.sort_order}
                    </div>
                  </div>
                  <Badge variant="outline">Catégorie</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Articles de Menu</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Aucun article trouvé pour le business ID {businessId}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{item.name}</div>
                    <div className="flex items-center space-x-2">
                      {item.is_popular && (
                        <Badge className="bg-yellow-100 text-yellow-800">Populaire</Badge>
                      )}
                      {item.is_available && (
                        <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{item.description}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                    <div>Prix: {item.price} GNF</div>
                    <div>Catégorie: {item.category_id}</div>
                    <div>Business: {item.business_id}</div>
                    <div>ID: {item.id}</div>
                  </div>
                  {item.preparation_time && (
                    <div className="text-xs text-gray-500 mt-1">
                      Temps de préparation: {item.preparation_time} min
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Articles par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Articles par Catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Impossible de grouper les articles sans catégories
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {categories.map(category => {
                const categoryItems = items.filter(item => item.category_id === category.id);
                return (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{category.name}</h4>
                      <Badge variant="secondary">{categoryItems.length} articles</Badge>
                    </div>
                    {categoryItems.length === 0 ? (
                      <div className="text-sm text-gray-500 italic">
                        Aucun article dans cette catégorie
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {categoryItems.map(item => (
                          <div key={item.id} className="text-sm bg-gray-50 p-2 rounded">
                            {item.name} - {item.price} GNF
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Données JSON brutes */}
      <Card>
        <CardHeader>
          <CardTitle>Données JSON Brutes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Catégories (JSON)</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(categories, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Articles (JSON)</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(items, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuDebug; 