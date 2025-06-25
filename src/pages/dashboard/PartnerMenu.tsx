import { useState } from 'react';
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
  DollarSign,
  Clock,
  Check,
  X,
  Loader2
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
import { usePartnerMenu, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, useToggleMenuItemAvailability } from '@/hooks/use-partner-menu';
import { PartnerMenuItem, MenuItemCreate, MenuItemUpdate } from '@/lib/services/partner-menu';
import MenuCategoryManager from '@/components/dashboard/MenuCategoryManager';

// Schema de validation pour les articles de menu
const menuItemSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string().min(1, 'La description est requise').max(500, 'La description ne peut pas dépasser 500 caractères'),
  price: z.number().min(0, 'Le prix doit être positif'),
  category_id: z.number().min(1, 'La catégorie est requise'),
  preparation_time: z.number().min(1, 'Le temps de préparation doit être positif'),
  is_available: z.boolean(),
  is_popular: z.boolean(),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
  }).format(amount);
};

const PartnerMenu = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'menu' | 'categories'>('menu');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PartnerMenuItem | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

  // Récupérer le business ID du partenaire (à adapter selon votre logique d'authentification)
  const businessId = (currentUser as any)?.business_id || 2; // Fallback pour les tests

  // Hooks pour les données et mutations
  const { data: menuData, isLoading, error, refetch } = usePartnerMenu(businessId);
  const createMenuItemMutation = useCreateMenuItem();
  const updateMenuItemMutation = useUpdateMenuItem();
  const deleteMenuItemMutation = useDeleteMenuItem();
  const toggleAvailabilityMutation = useToggleMenuItemAvailability();

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: 0,
      preparation_time: 15,
      is_available: true,
      is_popular: false,
    },
  });

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

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddItem = () => {
    setFormMode('add');
    setCurrentItem(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      category_id: categories.length > 0 ? categories[0].id : 0,
      preparation_time: 15,
      is_available: true,
      is_popular: false,
    });
    setIsAddEditOpen(true);
  };

  const handleEditItem = (item: PartnerMenuItem) => {
    setFormMode('edit');
    setCurrentItem(item);
    form.reset({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category_id,
      preparation_time: item.preparation_time,
      is_available: item.is_available,
      is_popular: item.is_popular,
    });
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
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // Image par défaut
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

  if (error) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion du Menu">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">
            Une erreur est survenue lors du chargement du menu.
          </p>
          <Button onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={partnerNavItems} title="Gestion du Menu">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
            <p className="text-gray-500">Gérez le menu de votre restaurant et les catégories.</p>
          </div>
          <Button onClick={handleAddItem} className="flex items-center gap-2" disabled={isLoading}>
            <Plus className="h-4 w-4" /> Ajouter un Article
          </Button>
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
                <TabsTrigger value="all">Tous les Articles</TabsTrigger>
                {categories
                  .filter(cat => cat.is_active)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map(category => (
                    <TabsTrigger key={category.id} value={category.id.toString()}>
                      {category.name}
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
                                    <ImageIcon className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                      {item.description}
                                    </p>
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
              onCategoryUpdate={() => refetch()}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog d'ajout/modification d'article */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? 'Ajouter un Article' : 'Modifier l\'Article'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Poulet Yassa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description détaillée de l'article..." 
                        className="resize-none min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (GNF)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            className="pl-9" 
                            {...field} 
                            onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preparation_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temps de Préparation (minutes)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            className="pl-9" 
                            {...field} 
                            onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter(cat => cat.is_active)
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Disponible</FormLabel>
                        <FormDescription>
                          L'article peut être commandé par les clients
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_popular"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Marquer comme Populaire</FormLabel>
                        <FormDescription>
                          Mettre en avant comme article populaire
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4 space-x-2 flex justify-end">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddEditOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
                >
                  {formMode === 'add' ? 'Ajouter' : 'Sauvegarder'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
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