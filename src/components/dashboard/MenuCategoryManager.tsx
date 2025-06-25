import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  MoreHorizontal,
  Store,
  Check,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { PartnerMenuCategory, MenuCategoryCreate, MenuCategoryUpdate, PartnerMenuItem } from '@/lib/services/partner-menu';
import { useCreateMenuCategory, useUpdateMenuCategory, useDeleteMenuCategory } from '@/hooks/use-partner-menu';

const categorySchema = z.object({
  name: z.string().min(1, 'Le nom de la catégorie est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  sort_order: z.number().min(0, 'L\'ordre doit être positif'),
  is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface MenuCategoryManagerProps {
  businessId: number;
  categories: PartnerMenuCategory[];
  items?: PartnerMenuItem[]; // Ajout des articles pour compter
  onCategoryUpdate: () => void;
}

const MenuCategoryManager = ({ businessId, categories, items = [], onCategoryUpdate }: MenuCategoryManagerProps) => {
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<PartnerMenuCategory | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

  const createCategoryMutation = useCreateMenuCategory();
  const updateCategoryMutation = useUpdateMenuCategory();
  const deleteCategoryMutation = useDeleteMenuCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      sort_order: 0,
      is_active: true,
    },
  });

  // Statistiques
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.is_active).length;
  const categoriesWithItems = categories.filter(cat => 
    items.some(item => item.category_id === cat.id)
  ).length;

  const handleAddCategory = () => {
    setFormMode('add');
    setCurrentCategory(null);
    form.reset({
      name: '',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setIsAddEditOpen(true);
  };

  const handleEditCategory = (category: PartnerMenuCategory) => {
    setFormMode('edit');
    setCurrentCategory(category);
    form.reset({
      name: category.name,
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setIsAddEditOpen(true);
  };

  const handleDeleteDialog = (category: PartnerMenuCategory) => {
    setCurrentCategory(category);
    setIsDeleteOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    // Vérifier s'il y a des articles dans cette catégorie
    const itemsInCategory = items.filter(item => item.category_id === currentCategory.id);
    if (itemsInCategory.length > 0) {
      alert(`Impossible de supprimer cette catégorie car elle contient ${itemsInCategory.length} article(s). Veuillez d'abord déplacer ou supprimer ces articles.`);
      setIsDeleteOpen(false);
      return;
    }

    await deleteCategoryMutation.mutateAsync(currentCategory.id);
    setIsDeleteOpen(false);
    setCurrentCategory(null);
    onCategoryUpdate();
  };

  const onSubmit = async (data: CategoryFormValues) => {
    if (formMode === 'add') {
      const newCategory: MenuCategoryCreate = {
        name: data.name,
        sort_order: data.sort_order,
        is_active: data.is_active,
        business_id: businessId,
      };
      await createCategoryMutation.mutateAsync(newCategory);
    } else if (formMode === 'edit' && currentCategory) {
      const updateData: MenuCategoryUpdate = {
        name: data.name,
        sort_order: data.sort_order,
        is_active: data.is_active,
      };
      await updateCategoryMutation.mutateAsync({
        id: currentCategory.id,
        category: updateData,
      });
    }
    
    setIsAddEditOpen(false);
    setCurrentCategory(null);
    onCategoryUpdate();
  };

  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  const getCategoryItemCount = (categoryId: number) => {
    return items.filter(item => item.category_id === categoryId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Catégories de Menu</h3>
          <p className="text-sm text-gray-500">
            Gérez les catégories de votre menu
          </p>
        </div>
        <Button onClick={handleAddCategory} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une Catégorie
        </Button>
      </div>

      {/* Statistiques des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Catégories</p>
                <p className="text-2xl font-bold">{totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Catégories Actives</p>
                <p className="text-2xl font-bold">{activeCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avec Articles</p>
                <p className="text-2xl font-bold">{categoriesWithItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Catégories</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedCategories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category) => {
                  const itemCount = getCategoryItemCount(category.id);
                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm">{category.sort_order}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-gray-500">
                            ID: {category.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={category.is_active ? "default" : "secondary"}
                        >
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{itemCount}</span>
                          <span className="text-sm text-gray-500">
                            article{itemCount !== 1 ? 's' : ''}
                          </span>
                          {itemCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Utilisée
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDialog(category)}
                              className="text-red-600"
                              disabled={itemCount > 0}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                              {itemCount > 0 && (
                                <span className="ml-1 text-xs">(Non vide)</span>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Aucune catégorie</h3>
              <p className="text-gray-500 mb-4">
                Commencez par créer votre première catégorie de menu.
              </p>
              <Button onClick={handleAddCategory}>
                Créer une Catégorie
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? 'Ajouter une Catégorie' : 'Modifier la Catégorie'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la Catégorie</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Plats Principaux" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordre d'Affichage</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field} 
                        onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Détermine l'ordre d'affichage des catégories (plus petit = premier)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Catégorie Active</FormLabel>
                      <FormDescription>
                        Les catégories inactives ne sont pas visibles aux clients
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
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {formMode === 'add' ? 'Créer' : 'Sauvegarder'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Supprimer la Catégorie</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Êtes-vous sûr de vouloir supprimer <strong>{currentCategory?.name}</strong> ?</p>
            <p className="text-gray-500 text-sm mt-2">
              Cette action ne peut pas être annulée. La catégorie sera définitivement supprimée.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuCategoryManager; 