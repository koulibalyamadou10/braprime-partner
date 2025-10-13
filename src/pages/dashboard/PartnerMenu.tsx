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
  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'variants'>('menu');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PartnerMenuItem | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  
  // Récupérer le profil partenaire pour obtenir le business_id et le type de business
  const { profile: partnerProfile, isLoading: isLoadingProfile } = usePartnerProfile();
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
     partnerProfile.business_type_id === 11 ? 'document_service' : 
     // Nouveaux types selon BUSINESS_TYPES_MENU_STRUCTURE.md
     partnerProfile.business_type_id === 55 ? 'supermarket' :
     partnerProfile.business_type_id === 56 ? 'electronics' :
     partnerProfile.business_type_id === 57 ? 'beauty' :
     partnerProfile.business_type_id === 58 ? 'clothing' :
     partnerProfile.business_type_id === 60 ? 'gifts' :
     partnerProfile.business_type_id === 61 ? 'hardware' :
     partnerProfile.business_type_id === 64 ? 'packages' :
     // IDs utilisés dans les exemples de données
     partnerProfile.business_type_id === 81 ? 'supermarket' :
     partnerProfile.business_type_id === 82 ? 'electronics' :
     partnerProfile.business_type_id === 83 ? 'beauty' :
     partnerProfile.business_type_id === 84 ? 'clothing' :
     partnerProfile.business_type_id === 86 ? 'gifts' :
     partnerProfile.business_type_id === 87 ? 'hardware' :
     partnerProfile.business_type_id === 95 ? 'restaurant' :
     'restaurant') : 'restaurant';

  // Hooks pour les données et mutations
  const { data: menuData, isLoading: isLoadingMenu, error, refetch } = usePartnerMenu(businessId || 0);
  const createMenuItemMutation = useCreateMenuItem();
  const updateMenuItemMutation = useUpdateMenuItem();
  const deleteMenuItemMutation = useDeleteMenuItem();
  const toggleAvailabilityMutation = useToggleMenuItemAvailability();
  const { toast } = useToast();
  
  // État de chargement global (pour compatibilité)
  const isLoading = isLoadingProfile || isLoadingMenu;

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
      toast({
        title: "Erreur",
        description: "Business ID non trouvé",
        variant: "destructive"
      });
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

    console.log('🎯 PartnerMenu - onSubmit reçoit:', data);

    // Extraire les variantes et les champs qui n'existent pas dans menu_items
    const { variants, couleur, taille, marque, matiere, poids, format, materiau, dosage, forme, quantite, sku, ...baseData } = data as any;

    if (formMode === 'add') {
      // Ne garder que les colonnes qui existent dans menu_items + variants
      const newItem: MenuItemCreate = {
        name: baseData.name,
        description: baseData.description,
        price: baseData.price,
        category_id: baseData.category_id,
        is_available: baseData.is_available,
        is_popular: baseData.is_popular,
        business_id: businessId,
        image: baseData.image || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        sort_order: baseData.sort_order,
        allergens: baseData.allergens,
        nutritional_info: baseData.nutritional_info,
        preparation_time: baseData.preparation_time,
        // Nouveaux champs stock
        track_stock: baseData.track_stock,
        stock_quantity: baseData.stock_quantity,
        low_stock_alert: baseData.low_stock_alert,
        // Variantes (sku est dans les variantes, pas dans menu_items)
        variants: variants || [],
      } as any;
      
      console.log('✅ Envoi à createMenuItem:', newItem);
      await createMenuItemMutation.mutateAsync(newItem);
    } else if (formMode === 'edit' && currentItem) {
      // Ne garder que les colonnes qui existent dans menu_items + variants
      const updateData: MenuItemUpdate = {
        name: baseData.name,
        description: baseData.description,
        price: baseData.price,
        category_id: baseData.category_id,
        is_available: baseData.is_available,
        is_popular: baseData.is_popular,
        image: baseData.image || currentItem.image,
        sort_order: baseData.sort_order,
        allergens: baseData.allergens,
        nutritional_info: baseData.nutritional_info,
        preparation_time: baseData.preparation_time,
        // Nouveaux champs stock
        track_stock: baseData.track_stock,
        stock_quantity: baseData.stock_quantity,
        low_stock_alert: baseData.low_stock_alert,
        // Variantes (sku est dans les variantes, pas dans menu_items)
        variants: variants !== undefined ? variants : currentItem.variants,
      } as any;
      
      console.log('✅ Envoi à updateMenuItem:', updateData);
      await updateMenuItemMutation.mutateAsync({
        id: currentItem.id,
        updates: updateData,  // ← Changé 'item' en 'updates'
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

  // Pas de skeleton global - afficher directement la page
  // Les cards ont leurs propres spinners
  
  // Si pas de business ID ET chargement terminé, afficher un message d'erreur
  if (!businessId && !isLoadingProfile) {
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

  // Afficher le contenu principal avec chargement progressif des données
  return (
    <DashboardLayout navItems={partnerNavItems} title="Gestion du Menu">
      <div className="space-y-6">
        {/* Affichage des erreurs seulement s'il y en a et que le chargement est terminé */}
        {error && !isLoading && <ErrorCard />}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
            <p className="text-gray-500">
              {isLoadingProfile ? (
                <>
                  Chargement du profil
                  <Loader2 className="h-3 w-3 animate-spin text-gray-400 inline ml-1" />
                </>
              ) : partnerProfile ? (
                <>
                  Gérez le menu de {partnerProfile.name} - {isLoadingMenu ? (
                    <>
                      Chargement
                      <Loader2 className="h-3 w-3 animate-spin text-gray-400 inline ml-1" />
                    </>
                  ) : (
                    `${totalItems} articles au total`
                  )}
                </>
              ) : (
                "Gérez le menu de votre restaurant"
              )}
            </p>
          </div>
          <Button onClick={handleAddItem} className="flex items-center gap-2" disabled={isLoadingProfile || !businessId}>
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
                  {isLoadingMenu ? (
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
                  {isLoadingMenu ? (
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
                  {isLoadingMenu ? (
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'menu' | 'categories' | 'variants')}>
          <TabsList>
            <TabsTrigger value="menu">Articles du Menu</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="variants">Variantes</TabsTrigger>
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

          <TabsContent value="variants" className="space-y-6">
            {/* En-tête */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des Variantes</CardTitle>
                    <CardDescription>
                      Gérez les variantes (tailles, couleurs, capacités) pour vos articles
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Liste des articles avec variantes */}
            <Card>
              <CardHeader>
                <CardTitle>Articles avec Variantes</CardTitle>
                <CardDescription>
                  {isLoading ? 'Chargement...' : `${items.filter(item => item.variants && item.variants.length > 0).length} articles avec variantes configurées`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : items.filter(item => item.variants && item.variants.length > 0).length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune variante configurée</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Ajoutez des variantes à vos articles depuis l'onglet "Articles du Menu"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items
                      .filter(item => item.variants && item.variants.length > 0)
                      .map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <div className="flex items-start p-4 space-x-4">
                            {/* Image de l'article */}
                            <div className="flex-shrink-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-20 w-20 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Informations de l'article */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {item.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Prix de base: {formatCurrency(item.price)}
                                  </p>
                                  <Badge variant="secondary" className="mt-2">
                                    {item.variants?.length || 0} variante(s)
                                  </Badge>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentItem(item);
                                    setFormMode('edit');
                                    setIsAddEditOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </Button>
                              </div>

                              {/* Liste des variantes */}
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Variantes configurées :</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {item.variants?.map((variant, idx) => (
                                    <div
                                      key={idx}
                                      className="border rounded-lg p-3 bg-gray-50"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-gray-900">
                                            {variant.variant_type}: {variant.variant_value}
                                          </p>
                                          <p className="text-sm text-gray-600 mt-1">
                                            Prix: {formatCurrency(item.price + variant.price_adjustment)}
                                            {variant.price_adjustment !== 0 && (
                                              <span className="text-xs text-gray-500 ml-1">
                                                ({variant.price_adjustment > 0 ? '+' : ''}{formatCurrency(variant.price_adjustment)})
                                              </span>
                                            )}
                                          </p>
                                          {item.track_stock && variant.stock_quantity !== undefined && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Stock: {variant.stock_quantity} unités
                                            </p>
                                          )}
                                        </div>
                                        <Badge 
                                          variant={variant.is_available ? "default" : "secondary"}
                                          className="ml-2"
                                        >
                                          {variant.is_available ? (
                                            <Check className="h-3 w-3" />
                                          ) : (
                                            <X className="h-3 w-3" />
                                          )}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistiques des variantes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Articles avec variantes</CardDescription>
                  <CardTitle className="text-3xl">
                    {isLoading ? '...' : items.filter(item => item.variants && item.variants.length > 0).length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Sur {isLoading ? '...' : totalItems} articles au total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total de variantes</CardDescription>
                  <CardTitle className="text-3xl">
                    {isLoading ? '...' : items.reduce((acc, item) => acc + (item.variants?.length || 0), 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Toutes variantes confondues
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Variantes actives</CardDescription>
                  <CardTitle className="text-3xl">
                    {isLoading ? '...' : items.reduce((acc, item) => 
                      acc + (item.variants?.filter(v => v.is_available).length || 0), 0
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Variantes disponibles à la vente
                  </p>
                </CardContent>
              </Card>
            </div>
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