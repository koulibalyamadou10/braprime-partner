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
  Banknote, 
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

interface MenuItemVariant {
  id?: number;
  variant_type: string;  // "taille", "couleur", "capacité"
  variant_value: string; // "S", "M", "L", "Rouge", "128GB"
  price_adjustment: number;
  stock_quantity?: number;
  is_available: boolean;
  sku?: string;
  sort_order: number;
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
  // Nouveaux champs pour gestion stock
  stock_quantity?: number | null;
  low_stock_alert?: number;
  track_stock?: boolean;
  sku?: string;
  // Champs existants
  dosage?: string;
  forme?: string;
  quantite?: string;
  marque?: string;
  modele?: string;
  garantie?: string;
  couleur?: string;
  taille?: string;
  matiere?: string;
  // Champs supermarché
  poids?: string;
  format?: string;
  // Champs cadeaux
  materiau?: string;
  // Variantes
  variants?: MenuItemVariant[];
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
    // Nouveaux champs pour gestion stock et variantes
    track_stock: z.boolean().default(false),
    stock_quantity: z.number().min(0).optional().nullable(),
    low_stock_alert: z.number().min(0).default(5),
    sku: z.string().optional(),
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
    clothing: {
      marque: z.string().optional(),
      couleur: z.string().optional(),
      taille: z.string().optional(),
      matiere: z.string().optional(),
    },
    supermarket: {
      marque: z.string().optional(),
      poids: z.string().optional(),
      format: z.string().optional(),
      allergens: z.array(z.string()).default([]),
    },
    gifts: {
      marque: z.string().optional(),
      couleur: z.string().optional(),
      materiau: z.string().optional(),
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
  clothing: {
    icon: ShoppingCart,
    name: 'Vêtements',
    fields: {
      marque: { label: 'Marque', required: false },
      couleur: { label: 'Couleur', required: false },
      taille: { label: 'Taille', required: false },
      matiere: { label: 'Matériau', required: false },
    },
    allergens: [],
  },
  supermarket: {
    icon: Store,
    name: 'Supermarché',
    fields: {
      marque: { label: 'Marque', required: false },
      poids: { label: 'Poids', required: false },
      format: { label: 'Format', required: false },
    },
    allergens: ['Gluten', 'Lactose', 'Œufs', 'Arachides', 'Noix', 'Soja', 'Poisson', 'Crustacés'],
  },
  gifts: {
    icon: Heart,
    name: 'Cadeaux',
    fields: {
      marque: { label: 'Marque', required: false },
      couleur: { label: 'Couleur', required: false },
      materiau: { label: 'Matériau', required: false },
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
  const [variants, setVariants] = useState<MenuItemVariant[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const { toast } = useToast();

  const config = businessTypeConfig[businessType as keyof typeof businessTypeConfig] || businessTypeConfig.restaurant;
  const IconComponent = config.icon;
  
  // Déterminer si ce type de business peut avoir des variantes
  const canHaveVariants = ['cafe', 'clothing', 'electronics', 'beauty', 'supermarket'].includes(businessType);

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
      // Nouveaux champs stock
      track_stock: false,
      stock_quantity: null,
      low_stock_alert: 5,
      sku: '',
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
      ...(businessType === 'clothing' ? {
        marque: '',
        couleur: '',
        taille: '',
        matiere: '',
      } : {}),
      ...(businessType === 'supermarket' ? {
        marque: '',
        poids: '',
        format: '',
        allergens: [],
      } : {}),
      ...(businessType === 'gifts' ? {
        marque: '',
        couleur: '',
        materiau: '',
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
        // Champs stock
        track_stock: currentItem.track_stock || false,
        stock_quantity: currentItem.stock_quantity,
        low_stock_alert: currentItem.low_stock_alert || 5,
        sku: currentItem.sku || '',
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
        ...(businessType === 'clothing' ? {
          marque: currentItem.marque || '',
          couleur: currentItem.couleur || '',
          taille: currentItem.taille || '',
          matiere: currentItem.matiere || '',
        } : {}),
        ...(businessType === 'supermarket' ? {
          marque: currentItem.marque || '',
          poids: currentItem.poids || '',
          format: currentItem.format || '',
          allergens: currentItem.allergens || [],
        } : {}),
        ...(businessType === 'gifts' ? {
          marque: currentItem.marque || '',
          couleur: currentItem.couleur || '',
          materiau: currentItem.materiau || '',
        } : {}),
      });
      // Charger les variantes existantes
      if (currentItem.variants && currentItem.variants.length > 0) {
        setVariants(currentItem.variants);
        setShowVariants(true);
      } else {
        setVariants([]);
        setShowVariants(false);
      }
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
        // Champs stock
        track_stock: false,
        stock_quantity: null,
        low_stock_alert: 5,
        sku: '',
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
        ...(businessType === 'clothing' ? {
          marque: '',
          couleur: '',
          taille: '',
          matiere: '',
        } : {}),
        ...(businessType === 'supermarket' ? {
          marque: '',
          poids: '',
          format: '',
          allergens: [],
        } : {}),
        ...(businessType === 'gifts' ? {
          marque: '',
          couleur: '',
          materiau: '',
        } : {}),
      });
      // Réinitialiser les variantes
      setVariants([]);
      setShowVariants(false);
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
      console.log('🎨 AddMenuItemDialog - État avant soumission:', {
        showVariants,
        variantsCount: variants.length,
        variants: variants,
        willSendVariants: showVariants && variants.length > 0
      });

      // Valider les variantes si elles sont activées
      if (showVariants && variants.length > 0) {
        const invalidVariants = variants.filter(v => !v.variant_value.trim());
        if (invalidVariants.length > 0) {
          toast({
            title: "Erreur",
            description: "Toutes les variantes doivent avoir une valeur",
            variant: "destructive",
          });
          return;
        }
      }

      const dataToSend = {
        ...data,
        business_id: businessId,
        // Ajouter les variantes seulement si elles sont activées et configurées
        variants: showVariants && variants.length > 0 ? variants : [],
      };

      console.log('📤 Envoi des données:', dataToSend);

      await onSubmit(dataToSend);
      
      // Réinitialiser les variantes
      setVariants([]);
      setShowVariants(false);
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
                          <Banknote className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
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
                
                {/* Champs spécifiques selon le type de business - Temps de préparation supprimé */}

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

                {/* Champs de gestion de stock (pour produits physiques) */}
                {(businessType === 'pharmacy' || businessType === 'electronics' || 
                  businessType === 'supermarket' || businessType === 'clothing' || 
                  businessType === 'hardware') && (
                  <>
                    <FormField
                      control={form.control}
                      name="track_stock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Gérer le stock</FormLabel>
                            <FormDescription>
                              Activer la gestion automatique des quantités en stock
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

                    {form.watch('track_stock') && (
                      <>
                        <FormField
                          control={form.control}
                          name="stock_quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantité en stock</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Store className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                  <Input 
                                    type="number" 
                                    className="pl-9" 
                                    min="0"
                                    {...field} 
                                    onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Nombre d'unités disponibles
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="low_stock_alert"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Seuil d'alerte stock faible</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  {...field} 
                                  onChange={e => field.onChange(e.target.valueAsNumber || 5)}
                                />
                              </FormControl>
                              <FormDescription>
                                Alerter quand le stock passe sous ce seuil
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Code SKU/Référence</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: PROD-12345"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Code unique pour identifier le produit
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </>
                )}
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

            {/* Champs pour vêtements */}
            {businessType === 'clothing' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations produit</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marque</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Nike, Adidas..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="matiere"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matière</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Coton 100%" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="couleur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couleur principale</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Noir, Blanc, Bleu..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Utilisez les variantes pour gérer plusieurs couleurs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taille"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taille principale</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: M, L..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Utilisez les variantes pour gérer plusieurs tailles
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Champs pour supermarché */}
            {businessType === 'supermarket' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations produit</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="marque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marque</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Coca-Cola, Nestlé..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="poids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poids/Volume</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 1kg, 500ml..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Pack de 6, Sachet..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Champs pour cadeaux */}
            {businessType === 'gifts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations produit</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="marque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marque</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Artisan local..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="couleur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couleur</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Rouge, Doré..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="materiau"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matériau</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Bois, Métal, Verre..." {...field} />
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

            {/* Section Variantes (pour certains types de business) */}
            {canHaveVariants && (
              <div className="space-y-4 border-t pt-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Variantes du produit</h3>
                    <p className="text-sm text-gray-500">
                      Gérez les différentes options (taille, couleur, capacité, etc.)
                    </p>
                  </div>
                  <Switch
                    checked={showVariants}
                    onCheckedChange={setShowVariants}
                  />
                </div>

                {showVariants && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {variants.length} variante(s) configurée(s)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVariants([...variants, {
                            variant_type: businessType === 'cafe' ? 'taille' : 
                                         businessType === 'clothing' ? 'taille' :
                                         businessType === 'electronics' ? 'capacité' : 'option',
                            variant_value: '',
                            price_adjustment: 0,
                            stock_quantity: 0,
                            is_available: true,
                            sort_order: variants.length
                          }]);
                        }}
                      >
                        + Ajouter une variante
                      </Button>
                    </div>

                    {variants.map((variant, index) => (
                      <div key={index} className="bg-white p-4 rounded border space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Variante #{index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                          >
                            Supprimer
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={variant.variant_type}
                              onValueChange={(value) => {
                                const newVariants = [...variants];
                                newVariants[index].variant_type = value;
                                setVariants(newVariants);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {businessType === 'cafe' && (
                                  <>
                                    <SelectItem value="taille">Taille</SelectItem>
                                    <SelectItem value="température">Température</SelectItem>
                                    <SelectItem value="lait">Type de lait</SelectItem>
                                  </>
                                )}
                                {businessType === 'clothing' && (
                                  <>
                                    <SelectItem value="taille">Taille</SelectItem>
                                    <SelectItem value="couleur">Couleur</SelectItem>
                                  </>
                                )}
                                {businessType === 'electronics' && (
                                  <>
                                    <SelectItem value="capacité">Capacité</SelectItem>
                                    <SelectItem value="couleur">Couleur</SelectItem>
                                    <SelectItem value="version">Version</SelectItem>
                                  </>
                                )}
                                {businessType === 'beauty' && (
                                  <>
                                    <SelectItem value="volume">Volume</SelectItem>
                                    <SelectItem value="teinte">Teinte</SelectItem>
                                  </>
                                )}
                                {businessType === 'supermarket' && (
                                  <>
                                    <SelectItem value="poids">Poids</SelectItem>
                                    <SelectItem value="format">Format</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Valeur</Label>
                            <Input
                              placeholder="Ex: S, M, L"
                              value={variant.variant_value}
                              onChange={(e) => {
                                const newVariants = [...variants];
                                newVariants[index].variant_value = e.target.value;
                                setVariants(newVariants);
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Ajustement prix (GNF)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={variant.price_adjustment}
                              onChange={(e) => {
                                const newVariants = [...variants];
                                newVariants[index].price_adjustment = parseInt(e.target.value) || 0;
                                setVariants(newVariants);
                              }}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Prix final: {(form.watch('price') + variant.price_adjustment).toLocaleString()} GNF
                            </p>
                          </div>

                          {form.watch('track_stock') && (
                            <div>
                              <Label>Stock</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={variant.stock_quantity || 0}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[index].stock_quantity = parseInt(e.target.value) || 0;
                                  setVariants(newVariants);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {variants.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Aucune variante configurée</p>
                        <p className="text-xs mt-1">Cliquez sur "Ajouter une variante" pour commencer</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
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