import { useState } from 'react';
import { useForm } from 'react-hook-form';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { useUserProfile } from '@/hooks/use-user-profile';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Home,
  Building,
  Navigation,
  Check
} from 'lucide-react';
import { UserAddressesSkeleton } from '@/components/dashboard/DashboardSkeletons';

// Schéma de validation pour les adresses
const addressFormSchema = z.object({
  label: z.string().min(2, {
    message: "Le libellé doit contenir au moins 2 caractères.",
  }),
  street: z.string().min(5, {
    message: "La rue doit contenir au moins 5 caractères.",
  }),
  city: z.string().min(2, {
    message: "La ville doit contenir au moins 2 caractères.",
  }),
  state: z.string().min(2, {
    message: "La région doit contenir au moins 2 caractères.",
  }),
  postal_code: z.string().optional(),
  country: z.string().default('Guinée'),
  is_default: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

// Ajout fonction utilitaire pour l'icône dynamique
const getAddressIcon = (label: string) => {
  if (label.toLowerCase().includes('domicile')) return <Home className="h-5 w-5 text-primary" />;
  if (label.toLowerCase().includes('bureau') || label.toLowerCase().includes('travail')) return <Building className="h-5 w-5 text-blue-500" />;
  return <MapPin className="h-5 w-5 text-muted-foreground" />;
};

const UserAddresses = () => {
  const { toast } = useToast();
  const {
    addresses,
    isLoading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  } = useUserProfile();

  // États pour les modals
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Guinée',
      is_default: false,
    },
  });

  // Soumettre le formulaire d'adresse
  const onSubmitAddress = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    
    // S'assurer que les champs requis sont présents
    const addressData = {
      label: data.label,
      street: data.street,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      is_default: data.is_default,
    };
    
    const result = editingAddress 
      ? await updateAddress(editingAddress, addressData)
      : await createAddress(addressData);
    
    if (result.success) {
      toast({
        title: editingAddress ? "Adresse mise à jour" : "Adresse créée",
        description: editingAddress 
          ? "Votre adresse a été mise à jour avec succès."
          : "Votre nouvelle adresse a été créée avec succès.",
      });
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      addressForm.reset();
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Erreur lors de la gestion de l'adresse",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  // Supprimer une adresse
  const handleDeleteAddress = async (addressId: string) => {
    const result = await deleteAddress(addressId);
    
    if (result.success) {
      toast({
        title: "Adresse supprimée",
        description: "Votre adresse a été supprimée avec succès.",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Erreur lors de la suppression de l'adresse",
        variant: "destructive",
      });
    }
  };

  // Définir une adresse comme défaut
  const handleSetDefaultAddress = async (addressId: string) => {
    const result = await setDefaultAddress(addressId);
    
    if (result.success) {
      toast({
        title: "Adresse par défaut",
        description: "Votre adresse par défaut a été mise à jour.",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Erreur lors de la définition de l'adresse par défaut",
        variant: "destructive",
      });
    }
  };

  // Éditer une adresse
  const handleEditAddress = (address: any) => {
    setEditingAddress(address.id);
    addressForm.reset({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code || '',
      country: address.country,
      is_default: address.is_default,
    });
    setIsAddressModalOpen(true);
  };

  // Ouvrir le modal pour créer une nouvelle adresse
  const handleCreateAddress = () => {
    setEditingAddress(null);
    addressForm.reset({
      label: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Guinée',
      is_default: false,
    });
    setIsAddressModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={userNavItems} title="Mes Adresses">
        <UserAddressesSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={userNavItems} title="Mes Adresses">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">Erreur de chargement</h3>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={userNavItems} title="Mes Adresses">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mes Adresses</h2>
          <p className="text-gray-500">Gérez vos adresses de livraison pour faciliter vos commandes.</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
          <div>
                <CardTitle>Adresses de livraison</CardTitle>
                <CardDescription>
                  Vos adresses enregistrées pour la livraison.
                </CardDescription>
          </div>
              <Button onClick={handleCreateAddress}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une adresse
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {addresses.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune adresse enregistrée</h3>
                <p className="text-gray-500 mb-6">Ajoutez votre première adresse pour faciliter vos commandes.</p>
                <Button onClick={handleCreateAddress}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter ma première adresse
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                            {getAddressIcon(address.label)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{address.label}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              {address.is_default && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs flex items-center">
                                  <Check className="h-3 w-3 mr-1" />
                                  Par défaut
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {address.country}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1 text-gray-600">
                          <p className="flex items-center">
                            <Navigation className="h-4 w-4 mr-2 text-gray-400" />
                            {address.street}
                          </p>
                          <p className="ml-6">
                            {address.city}, {address.state}
                            {address.postal_code && `, ${address.postal_code}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 mt-2">
                        {!address.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefaultAddress(address.id)}
                          >
                            Définir par défaut
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal pour créer/modifier une adresse */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Modifier l'adresse" : "Ajouter une nouvelle adresse"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress 
                ? "Modifiez les informations de votre adresse."
                : "Ajoutez une nouvelle adresse de livraison."
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(onSubmitAddress)} className="space-y-4">
                  <FormField
                control={addressForm.control}
                name="label"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Libellé de l'adresse</FormLabel>
                        <FormControl>
                      <Input placeholder="Ex: Domicile, Bureau, Chez mes parents..." {...field} />
                        </FormControl>
                    <FormDescription>
                      Un nom pour identifier facilement cette adresse.
                    </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                control={addressForm.control}
                name="street"
                    render={({ field }) => (
                      <FormItem>
                    <FormLabel>Rue et numéro</FormLabel>
                        <FormControl>
                      <Input placeholder="123 Rue de la Paix" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                  control={addressForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                      <FormLabel>Ville</FormLabel>
                          <FormControl>
                        <Input placeholder="Conakry" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                  control={addressForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                      <FormLabel>Région</FormLabel>
                          <FormControl>
                        <Input placeholder="Kaloum" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                  control={addressForm.control}
                  name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                      <FormLabel>Code postal</FormLabel>
                          <FormControl>
                        <Input placeholder="001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                  control={addressForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                      <FormLabel>Pays</FormLabel>
                            <FormControl>
                        <Input {...field} />
                            </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                control={addressForm.control}
                name="is_default"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                        className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                      <FormLabel>Définir comme adresse par défaut</FormLabel>
                      <FormDescription>
                        Cette adresse sera utilisée par défaut pour vos commandes.
                      </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingAddress ? 'Mise à jour...' : 'Création...'}
                    </>
                  ) : (
                    editingAddress ? 'Mettre à jour' : 'Créer l\'adresse'
                  )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
    </DashboardLayout>
  );
};

export default UserAddresses; 