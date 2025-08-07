import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { 
  DollarSign, 
  Clock, 
  Loader2, 
  Pill, 
  Utensils, 
  ShoppingCart,
  Tv,
  Heart,
  Scissors,
  Hammer,
  BookOpen,
  FileText,
  Store
} from 'lucide-react';
import ImageUpload from '@/components/ui/image-upload';
import { UploadService } from '@/lib/services/upload';
import { useToast } from '@/hooks/use-toast';

// Types pour les catégories et articles
interface MenuCategory {
  id: number;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  business_id: number;
  is_available: boolean;
  is_popular: boolean;
  sort_order: number;
  image?: string;
  allergens?: string[];
  nutritional_info?: any;
  preparation_time?: number;
  dosage?: string;
  forme?: string;
  quantite?: string;
  marque?: string;
  modele?: string;
  garantie?: string;
  couleur?: string;
  taille?: string;
  matiere?: string;
}

// Schema de validation générique
const createMenuItemSchema = (businessType: string) => {
  const baseSchema = {
    name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom ne peut pas dépasser 200 caractères'),
    description: z.string().min(1, 'La description est requise').max(1000, 'La description ne peut pas dépasser 1000 caractères'),
    price: z.number().min(0, 'Le prix doit être positif'),
    category_id: z.number().min(1, 'La catégorie est requise'),
    is_available: z.boolean(),
    is_popular: z.boolean(),
    sort_order: z.number().min(0, 'L\'ordre doit être positif'),
    image: z.string().optional(),
  };

  // Champs spécifiques selon le type de business
  const specificFields: Record<string, any> = {
    restaurant: {
      preparation_time: z.number().min(1, 'Le temps de préparation doit être positif'),
      allergens: z.array(z.string()).default([]),
      nutritional_info: z.object({
        calories: z.number().optional(),
        proteines: z.number().optional(),
        glucides: z.number().optional(),
        lipides: z.number().optional(),
        fibres: z.number().optional(),
      }).default({}),
    },
    cafe: {
      preparation_time: z.number().min(1, 'Le temps de préparation doit être positif'),
      allergens: z.array(z.string()).default([]),
      nutritional_info: z.object({
        calories: z.number().optional(),
        proteines: z.number().optional(),
        glucides: z.number().optional(),
        lipides: z.number().optional(),
        fibres: z.number().optional(),
      }).default({}),
    },
    pharmacy: {
      dosage: z.string().optional(),
      forme: z.string().optional(),
      quantite: z.string().optional(),
      allergens: z.array(z.string()).default([]),
    },
    electronics: {
      marque: z.string().optional(),
      modele: z.string().optional(),
      garantie: z.string().optional(),
      couleur: z.string().optional(),
    },
    beauty: {
      marque: z.string().optional(),
      couleur: z.string().optional(),
      taille: z.string().optional(),
      matiere: z.string().optional(),
    },
    hairdressing: {
      duree: z.number().min(1, 'La durée doit être positive').optional(),
      difficulte: z.string().optional(),
    },
    hardware: {
      marque: z.string().optional(),
      modele: z.string().optional(),
      garantie: z.string().optional(),
      matiere: z.string().optional(),
    },
    bookstore: {
      auteur: z.string().optional(),
      editeur: z.string().optional(),
      isbn: z.string().optional(),
      langue: z.string().optional(),
    },
    document_service: {
      duree: z.number().min(1, 'La durée doit être positive').optional(),
      format: z.string().optional(),
    },
  };

  return z.object({
    ...baseSchema,
    ...(specificFields[businessType] || {}),
  });
};

// Configuration des champs par type de business
const businessTypeConfig = {
  restaurant: {
    icon: Utensils,
    name: 'Restaurant',
    fields: {
      preparation_time: { label: 'Temps de Préparation (min)', required: true },
      allergens: { label: 'Allergènes', required: false },
      nutritional_info: { label: 'Informations nutritionnelles', required: false },
    },
    allergens: ['Gluten', 'Lactose', 'Œufs', 'Poisson', 'Crustacés', 'Arachides', 'Noix', 'Soja', 'Sulfites', 'Céleri', 'Moutarde', 'Sésame'],
  },
  cafe: {
    icon: Store,
    name: 'Café',
    fields: {
      preparation_time: { label: 'Temps de Préparation (min)', required: true },
      allergens: { label: 'Allergènes', required: false },
      nutritional_info: { label: 'Informations nutritionnelles', required: false },
    },
    allergens: ['Gluten', 'Lactose', 'Œufs', 'Arachides', 'Noix', 'Soja'],
  },
  pharmacy: {
    icon: Pill,
    name: 'Pharmacie',
    fields: {
      dosage: { label: 'Dosage', required: false },
      forme: { label: 'Forme', required: false },
      quantite: { label: 'Quantité', required: false },
      allergens: { label: 'Allergènes', required: false },
    },
    allergens: ['Lactose', 'Gluten', 'Gélatine', 'Arachides', 'Soja'],
  },
  electronics: {
    icon: Tv,
    name: 'Électronique',
    fields: {
      marque: { label: 'Marque', required: false },
      modele: { label: 'Modèle', required: false },
      garantie: { label: 'Garantie', required: false },
      couleur: { label: 'Couleur', required: false },
    },
    allergens: [],
  },
  beauty: {
    icon: Heart,
    name: 'Beauté',
    fields: {
      marque: { label: 'Marque', required: false },
      couleur: { label: 'Couleur', required: false },
      taille: { label: 'Taille', required: false },
      matiere: { label: 'Matériau', required: false },
    },
    allergens: [],
  },
  hairdressing: {
    icon: Scissors,
    name: 'Coiffure',
    fields: {
      duree: { label: 'Durée (min)', required: false },
      difficulte: { label: 'Difficulté', required: false },
    },
    allergens: [],
  },
  hardware: {
    icon: Hammer,
    name: 'Bricolage',
    fields: {
      marque: { label: 'Marque', required: false },
      modele: { label: 'Modèle', required: false },
      garantie: { label: 'Garantie', required: false },
      matiere: { label: 'Matériau', required: false },
    },
    allergens: [],
  },
  bookstore: {
    icon: BookOpen,
    name: 'Librairie',
    fields: {
      auteur: { label: 'Auteur', required: false },
      editeur: { label: 'Éditeur', required: false },
      isbn: { label: 'ISBN', required: false },
      langue: { label: 'Langue', required: false },
    },
    allergens: [],
  },
  document_service: {
    icon: FileText,
    name: 'Services de Documents',
    fields: {
      duree: { label: 'Durée (min)', required: false },
      format: { label: 'Format', required: false },
    },
    allergens: [],
  },
};

interface AddMenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessType: string;
  businessId: number;
  categories: MenuCategory[];
  mode: 'add' | 'edit';
  currentItem?: MenuItem | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const AddMenuItemDialog: React.FC<AddMenuItemDialogProps> = ({
  open,
  onOpenChange,
  businessType,
  businessId,
  categories,
  mode,
  currentItem,
  onSubmit,
  isLoading = false,
}) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();

  const config = businessTypeConfig[businessType as keyof typeof businessTypeConfig] || businessTypeConfig.restaurant;
  const IconComponent = config.icon;

  // Créer le schema dynamiquement
  const schema = createMenuItemSchema(businessType);
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: categories.length > 0 ? categories[0].id : 0,
      is_available: true,
      is_popular: false,
      sort_order: 0,
      image: '',
      ...(businessType === 'restaurant' || businessType === 'cafe' ? {
        preparation_time: 15,
        allergens: [],
        nutritional_info: {
          calories: undefined,
          proteines: undefined,
          glucides: undefined,
          lipides: undefined,
          fibres: undefined,
        },
      } : {}),
      ...(businessType === 'pharmacy' ? {
        dosage: '',
        forme: '',
        quantite: '',
        allergens: [],
      } : {}),
    },
  });

  // Initialiser le formulaire avec les données existantes en mode édition
  useEffect(() => {
    if (currentItem && mode === 'edit') {
      form.reset({
        name: currentItem.name,
        description: currentItem.description,
        price: currentItem.price,
        category_id: currentItem.category_id,
        is_available: currentItem.is_available,
        is_popular: currentItem.is_popular,
        sort_order: currentItem.sort_order,
        image: currentItem.image || '',
        ...(businessType === 'restaurant' || businessType === 'cafe' ? {
          preparation_time: currentItem.preparation_time || 15,
          allergens: currentItem.allergens || [],
          nutritional_info: currentItem.nutritional_info || {},
        } : {}),
        ...(businessType === 'pharmacy' ? {
          dosage: currentItem.dosage || '',
          forme: currentItem.forme || '',
          quantite: currentItem.quantite || '',
          allergens: currentItem.allergens || [],
        } : {}),
      });
    } else if (mode === 'add') {
      form.reset({
        name: '',
        description: '',
        price: 0,
        category_id: categories.length > 0 ? categories[0].id : 0,
        is_available: true,
        is_popular: false,
        sort_order: 0,
        image: '',
        ...(businessType === 'restaurant' || businessType === 'cafe' ? {
          preparation_time: 15,
          allergens: [],
          nutritional_info: {},
        } : {}),
        ...(businessType === 'pharmacy' ? {
          dosage: '',
          forme: '',
          quantite: '',
          allergens: [],
        } : {}),
      });
    }
  }, [currentItem, mode, categories, businessType, form]);

  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    try {
      const result = await UploadService.uploadImage(file, 'menu-items');
      if (result.error) {
        console.error('Erreur lors de l\'upload de l\'image:', result.error);
        throw new Error(result.error);
      }
      return result.url;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      await onSubmit({
        ...data,
        business_id: businessId,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            {mode === 'add' ? 'Ajouter un Article' : 'Modifier l\'Article'}
            <Badge variant="secondary">{config.name}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informations de base</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'article *</FormLabel>
                    <FormControl>
                      <Input placeholder={`Ex: ${businessType === 'pharmacy' ? 'Paracétamol 500mg' : businessType === 'electronics' ? 'iPhone 15' : 'Poulet Yassa'}`} {...field} />
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
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description détaillée de l'article..." 
                        className="resize-none min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload d'image */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        onUpload={handleImageUpload}
                        placeholder="Cliquez ou glissez une image ici"
                        disabled={isUploadingImage}
                      />
                    </FormControl>
                    <FormDescription>
                      Format recommandé: JPG, PNG ou WebP. Taille max: 5MB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (GNF) *</FormLabel>
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
                
                {/* Champs spécifiques selon le type de business */}
                {(businessType === 'restaurant' || businessType === 'cafe') && (
                  <FormField
                    control={form.control}
                    name="preparation_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temps de Préparation (min) *</FormLabel>
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
                )}

                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordre d'affichage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field} 
                          onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Détermine l'ordre d'affichage (plus petit = premier)
                      </FormDescription>
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
                    <FormLabel>Catégorie *</FormLabel>
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
            </div>

            {/* Champs spécifiques au type de business */}
            {businessType === 'pharmacy' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations pharmaceutiques</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 500mg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="forme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forme</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Comprimé" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 20 comprimés" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Informations nutritionnelles pour restaurants et cafés */}
            {(businessType === 'restaurant' || businessType === 'cafe') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations nutritionnelles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nutritional_info.calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories (kcal)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="250"
                            {...field} 
                            onChange={e => field.onChange(e.target.valueAsNumber || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutritional_info.proteines"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protéines (g)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="15"
                            {...field} 
                            onChange={e => field.onChange(e.target.valueAsNumber || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutritional_info.glucides"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Glucides (g)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30"
                            {...field} 
                            onChange={e => field.onChange(e.target.valueAsNumber || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutritional_info.lipides"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lipides (g)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="8"
                            {...field} 
                            onChange={e => field.onChange(e.target.valueAsNumber || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutritional_info.fibres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fibres (g)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5"
                            {...field} 
                            onChange={e => field.onChange(e.target.valueAsNumber || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Allergènes pour restaurants, cafés et pharmacies */}
            {(businessType === 'restaurant' || businessType === 'cafe' || businessType === 'pharmacy') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Allergènes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(config.allergens || []).map((allergen) => (
                    <div key={allergen} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={allergen}
                        className="rounded border-gray-300"
                        checked={form.watch('allergens')?.includes(allergen) || false}
                        onChange={(e) => {
                          const currentAllergens = form.watch('allergens') || [];
                          if (e.target.checked) {
                            form.setValue('allergens', [...currentAllergens, allergen]);
                          } else {
                            form.setValue('allergens', currentAllergens.filter(a => a !== allergen));
                          }
                        }}
                      />
                      <Label htmlFor={allergen} className="text-sm">{allergen}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
            </div>
            
            <div className="pt-4 space-x-2 flex justify-end">
              <Button 
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUploadingImage}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isLoading || isUploadingImage}
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  mode === 'add' ? 'Ajouter' : 'Sauvegarder'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 