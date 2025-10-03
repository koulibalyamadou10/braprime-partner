import { useState, useEffect } from 'react';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Image as ImageIcon,
  Star,
  Clock,
  Check,
  X,
  Loader2,
  AlertCircle,
  Store
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePartnerMenu, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, useToggleMenuItemAvailability } from '@/hooks/use-partner-menu';
import { PartnerMenuItem, MenuItemCreate, MenuItemUpdate } from '@/lib/services/partner-menu';
import MenuCategoryManager from '@/components/dashboard/MenuCategoryManager';
import { usePartnerProfile } from '@/hooks/use-partner-profile';
import { AddMenuItemDialog } from '@/components/dashboard/AddMenuItemDialog';
import { useToast } from '@/hooks/use-toast';
import { PartnerMenuSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { useCurrencyRole } from '@/contexts/UseRoleContext';
import Unauthorized from '@/components/Unauthorized';

// Le schema de validation est maintenant géré par le composant AddMenuItemDialog

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
  }).format(amount);
};

const PartnerMenu = () => {
  const { currencyRole, roles } = useCurrencyRole();

  if (!roles.includes("menu") && !roles.includes("admin")) {
    return <Unauthorized />;
  }

  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'menu' | 'categories'>('menu');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PartnerMenuItem | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  // Récupérer le profil partenaire pour obtenir le business_id et le type de business
  const { profile: partnerProfile, isLoading: profileLoading } = usePartnerProfile();
  const businessId = partnerProfile?.id;
  const businessType = partnerProfile?.business_type_id ? 
    (partnerProfile.business_type_id === 1 ? 'restaurant' : 
     partnerProfile.business_type_id === 2 ? 'cafe' : 
     partnerProfile.business_type_id === 3 ? 'market' : 
     partnerProfile.business_type_id === 4 ? 'supermarket' : 
     partnerProfile.business_type_id === 5 ? 'pharmacy' : 
     partnerProfile.business_type_id === 6 ? 'electronics' : 
     partnerProfile.business_type_id === 7 ? 'beauty' : 
     partnerProfile.business_type_id === 8 ? 'hairdressing' : 
     partnerProfile.business_type_id === 9 ? 'hardware' : 
     partnerProfile.business_type_id === 10 ? 'bookstore' : 
     partnerProfile.business_type_id === 11 ? 'document_service' : 'restaurant') : 'restaurant';

  // Hooks pour les données et mutations
  const { data: menuData, isLoading, error, refetch } = usePartnerMenu(businessId || 0);
  const createMenuItemMutation = useCreateMenuItem();
  const updateMenuItemMutation = useUpdateMenuItem();
  const deleteMenuItemMutation = useDeleteMenuItem();
  const toggleAvailabilityMutation = useToggleMenuItemAvailability();
  const { toast } = useToast();

  // Le formulaire est maintenant géré par le composant AddMenuItemDialog

  // Données extraites
  const categories = menuData?.categories || [];
  const items = menuData?.items || [];

  // Filtrer les articles selon la catégorie active et la recherche
  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category_id.toString() === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Statistiques
  const totalItems = items.length;
  const availableItems = items.filter(item => item.is_available).length;
  const popularItems = items.filter(item => item.is_popular).length;

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddItem = () => {
    if (!businessId) {
      alert('Erreur: Business ID non trouvé');
      return;
    }

    setFormMode('add');
    setCurrentItem(null);
    setIsAddEditOpen(true);
  };

  const handleEditItem = (item: PartnerMenuItem) => {
    setFormMode('edit');
    setCurrentItem(item);
    setIsAddEditOpen(true);
  };

  const handleDeleteDialog = (item: PartnerMenuItem) => {
    setCurrentItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!currentItem) return;

    await deleteMenuItemMutation.mutateAsync(currentItem.id);
    setIsDeleteOpen(false);
    setCurrentItem(null);
  };

  const toggleAvailability = async (itemId: number, currentStatus: boolean) => {
    await toggleAvailabilityMutation.mutateAsync({
      id: itemId,
      isAvailable: !currentStatus,
    });
  };

  const onSubmit = async (data: MenuItemFormValues) => {
    if (!businessId) {
      alert('Erreur: Business ID non trouvé');
      return;
    }

    if (formMode === 'add') {
      const newItem: MenuItemCreate = {
        name: data.name,
        description: data.description,
        price: data.price,
        category_id: data.category_id,
        preparation_time: data.preparation_time,
        is_available: data.is_available,
        is_popular: data.is_popular,
        business_id: businessId,
        image: data.image || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        sort_order: data.sort_order,
        allergens: data.allergens,
        nutritional_info: data.nutritional_info,
      };
      await createMenuItemMutation.mutateAsync(newItem);
    } else if (formMode === 'edit' && currentItem) {
      const updateData: MenuItemUpdate = {
        name: data.name,
        description: data.description,
        price: data.price,
        category_id: data.category_id,
        preparation_time: data.preparation_time,
        is_available: data.is_available,
        is_popular: data.is_popular,
        sort_order: data.sort_order,
        image: data.image || currentItem.image,
        allergens: data.allergens,
        nutritional_info: data.nutritional_info,
      };
      await updateMenuItemMutation.mutateAsync({
        id: currentItem.id,
        item: updateData,
      });
    }
    
    setIsAddEditOpen(false);
    setCurrentItem(null);
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.name || "Catégorie inconnue";
  };

  const getCategoryItemCount = (categoryId: number) => {
    return items.filter(item => item.category_id === categoryId).length;
  };

  // Fonction d'upload d'image
  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    
    try {
      // Valider l'image
      const validation = UploadService.validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Redimensionner l'image si nécessaire
      const resizedFile = await UploadService.resizeImage(file, 800, 600);
      
      // Upload vers Supabase Storage
      const result = await UploadService.uploadImage(resizedFile, 'menu-items');
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Succès",
        description: "Image uploadée avec succès",
      });

      return result.url;
    } catch (error) {
      console.error('Erreur upload image:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'upload de l'image",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Gestion d'erreurs granulaire - affichée en haut de page
  const ErrorCard = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <p className="text-sm text-red-700">
          Erreur lors du chargement des données: {error}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="ml-auto"
        >
          <Loader2 className="h-4 w-4 mr-1" />
          Réessayer
        </Button>
      </div>
    </div>
  );

  // Si en cours de chargement du profil et pas de business ID, afficher un skeleton
  if (!businessId && profileLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion du Menu">
        <div className="space-y-6">
          {/* Header STATIQUE - toujours visible */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
              <p className="text-gray-500">Chargement des données...</p>
            </div>
          </div>
          
          {/* Skeleton pour les statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Si pas de business ID ET chargement terminé, afficher un message d'erreur mais garder la structure
  if (!businessId && !profileLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion du Menu">
        <div className="space-y-6">
          {/* Affichage des erreurs seulement s'il y en a */}
          {error && <ErrorCard />}
          
          {/* Header STATIQUE - toujours visible */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
              <p className="text-gray-500">Impossible de récupérer les informations de votre business.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout navItems={partnerNavItems} title="Gestion du Menu">
      <div className="space-y-6">
        {/* Affichage des erreurs seulement s'il y en a et que le chargement est terminé */}
        {error && !isLoading && <ErrorCard />}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
            <p className="text-gray-500">Gérez le menu de votre restaurant et les catégories.</p>
          </div>
          <Button onClick={handleAddItem} className="flex items-center gap-2" disabled={isLoading}>
            <Plus className="h-4 w-4" /> Ajouter un Article
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Store className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Articles</p>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold">{totalItems}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponibles</p>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold">{availableItems}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Populaires</p>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold">{popularItems}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'menu' | 'categories')}>
          <TabsList>
            <TabsTrigger value="menu">Articles du Menu</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-6">
            {/* Recherche et filtres */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Rechercher des articles..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Onglets des catégories */}
            <Tabs 
              defaultValue="all" 
              className="space-y-4" 
              value={activeCategory}
              onValueChange={handleCategoryChange}
            >
              <TabsList className="flex flex-wrap h-auto">
                <TabsTrigger value="all">
                  Tous les Articles ({isLoading ? '...' : totalItems})
                </TabsTrigger>
                {categories
                  .filter(cat => cat.is_active)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map(category => (
                    <TabsTrigger key={category.id} value={category.id.toString()}>
                      {category.name} ({isLoading ? '...' : getCategoryItemCount(category.id)})
                    </TabsTrigger>
                  ))}
              </TabsList>
              
              <TabsContent value={activeCategory} className="space-y-4">
                {/* Table des articles */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {activeCategory === 'all' 
                        ? 'Tous les Articles' 
                        : getCategoryName(parseInt(activeCategory))}
                    </CardTitle>
                    <CardDescription>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Chargement...
                        </div>
                      ) : (
                        `${filteredItems.length} article(s)`
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-[250px]" />
                              <Skeleton className="h-4 w-[200px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredItems.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Temps de Préparation</TableHead>
                            <TableHead>Ordre</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                    <img src={item.image} alt={item.name} className="h-10 w-10 object-cover" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                      {item.description}
                                    </p>
                                    {item.allergens && item.allergens.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item.allergens.slice(0, 2).map((allergen, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {allergen}
                                          </Badge>
                                        ))}
                                        {item.allergens.length > 2 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{item.allergens.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getCategoryName(item.category_id)}</TableCell>
                              <TableCell>{formatCurrency(item.price)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                                  <span>{item.preparation_time} min</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-sm text-gray-500">
                                  {item.sort_order}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={item.is_available ? "outline" : "secondary"}
                                    className="flex items-center gap-1"
                                  >
                                    {item.is_available ? 
                                      <Check className="h-3 w-3" /> : 
                                      <X className="h-3 w-3" />
                                    }
                                    {item.is_available ? 'Disponible' : 'Indisponible'}
                                  </Badge>
                                  {item.is_popular && (
                                    <Badge variant="default" className="bg-orange-500">
                                      Populaire
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => toggleAvailability(item.id, item.is_available)}
                                    disabled={toggleAvailabilityMutation.isPending}
                                    title={item.is_available ? "Marquer comme indisponible" : "Marquer comme disponible"}
                                  >
                                    {toggleAvailabilityMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : item.is_available ? 
                                      <X className="h-4 w-4" /> : 
                                      <Check className="h-4 w-4" />
                                    }
                                  </Button>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modifier l'Article
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteDialog(item)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Aucun article trouvé</h3>
                        <p className="text-gray-500 mb-4">
                          {searchQuery ? 'Aucun article ne correspond à votre recherche.' : 'Aucun article dans cette catégorie.'}
                        </p>
                        <Button onClick={handleAddItem}>
                          Ajouter un Article
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <MenuCategoryManager 
              businessId={businessId}
              categories={categories}
              items={items}
              onCategoryUpdate={() => refetch()}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog d'ajout/modification d'article */}
      <AddMenuItemDialog
        open={isAddEditOpen}
        onOpenChange={setIsAddEditOpen}
        businessType={businessType}
        businessId={businessId}
        categories={categories}
        mode={formMode}
        currentItem={currentItem}
        onSubmit={onSubmit}
        isLoading={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
      />
      
      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'Article</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Êtes-vous sûr de vouloir supprimer <strong>{currentItem?.name}</strong> ?</p>
            <p className="text-gray-500 text-sm mt-2">
              Cette action ne peut pas être annulée. L'article sera définitivement supprimé de votre menu.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteItem}
              disabled={deleteMenuItemMutation.isPending}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PartnerMenu; 