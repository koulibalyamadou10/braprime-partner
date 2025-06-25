import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/use-user-profile';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
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
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Bell, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileSkeleton } from '@/components/dashboard/DashboardSkeletons';

// Schémas de validation
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  phone_number: z.string().min(8, {
    message: "Le numéro de téléphone doit contenir au moins 8 chiffres.",
  }).optional(),
  address: z.string().max(200, {
    message: "L'adresse ne doit pas dépasser 200 caractères.",
  }).optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Le mot de passe actuel doit contenir au moins 6 caractères.",
  }),
  newPassword: z.string().min(6, {
    message: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
    changePassword,
    deleteAccount
  } = useUserProfile();

  // États pour les modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Formulaires
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || '',
      phone_number: profile?.phone_number || '',
      address: profile?.address || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Mettre à jour les valeurs par défaut quand le profil se charge
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name,
        phone_number: profile.phone_number || '',
        address: profile.address || '',
      });
    }
  }, [profile?.id]); // Seulement quand l'ID du profil change

  // Soumettre le formulaire de profil
  const onSubmitProfile = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    
    const result = await updateProfile(data);
    
    if (result.success) {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Erreur lors de la mise à jour du profil",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  // Soumettre le formulaire de mot de passe
  const onSubmitPassword = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    
    const result = await changePassword(data.currentPassword, data.newPassword);
    
    if (result.success) {
      toast({
        title: "Mot de passe changé",
        description: "Votre mot de passe a été changé avec succès.",
      });
      setIsPasswordModalOpen(false);
      passwordForm.reset();
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Erreur lors du changement de mot de passe",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  // Supprimer le compte
  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    
    if (result.success) {
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });
      logout();
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Erreur lors de la suppression du compte",
        variant: "destructive",
      });
    }
    
    setIsDeleteModalOpen(false);
  };

  // Gérer l'upload d'image de profil
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      const result = await uploadProfileImage(file);
      
      if (result.success) {
        toast({
          title: "Image de profil mise à jour",
          description: "Votre image de profil a été mise à jour avec succès.",
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de l'upload de l'image",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upload de l'image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      // Réinitialiser l'input
      event.target.value = '';
    }
  };

  // Supprimer l'image de profil
  const handleDeleteImage = async () => {
    setIsUploadingImage(true);

    try {
      const result = await deleteProfileImage();
      
      if (result.success) {
        toast({
          title: "Image de profil supprimée",
          description: "Votre image de profil a été supprimée avec succès.",
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la suppression de l'image",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={userNavItems} title="Mon Profil">
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={userNavItems} title="Profil">
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <span className="ml-2 text-red-500">Erreur: {error}</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={userNavItems} title="Profil">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Paramètres du profil</h2>
          <p className="text-gray-500">Gérez vos informations personnelles et préférences.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Informations personnelles</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                    Mettez à jour vos informations personnelles.
              </CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="flex justify-center mb-6">
                    <div className="space-y-2">
                      <Avatar className="w-24 h-24 mx-auto">
                        <AvatarImage src={profile?.profile_image || ''} alt={profile?.name} />
                        <AvatarFallback className="text-2xl">
                          {profile?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-2">
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          ref={(input) => {
                            if (input) {
                              // Stocker la référence pour pouvoir la déclencher
                              (window as any).profileImageInput = input;
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          disabled={isUploadingImage}
                          onClick={() => {
                            const input = document.getElementById('profile-image') as HTMLInputElement;
                            if (input) {
                              input.click();
                            }
                          }}
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Upload...
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              Changer l'avatar
                            </>
                          )}
                        </Button>
                        {profile?.profile_image && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-red-600 hover:text-red-700"
                            onClick={handleDeleteImage}
                            disabled={isUploadingImage}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                      </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                    <FormField
                        control={profileForm.control}
                        name="name"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                              <Input placeholder="Votre nom complet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                        control={profileForm.control}
                        name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                            <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                              <Input placeholder="+224 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                        control={profileForm.control}
                        name="address"
                    render={({ field }) => (
                      <FormItem>
                            <FormLabel>Adresse principale</FormLabel>
                        <FormControl>
                          <Textarea
                                placeholder="Votre adresse principale"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sauvegarde...
                            </>
                          ) : (
                            'Sauvegarder'
                          )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                    <CardTitle>Informations du compte</CardTitle>
                    <CardDescription>
                      Détails de votre compte.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Rôle</p>
                        <p className="text-sm text-gray-500">{profile?.role_name || 'Client'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium">Statut</p>
                        <Badge variant="outline" className="text-green-600">
                          Actif
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Membre depuis</p>
                        <p className="text-sm text-gray-500">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>
                    Mettez à jour votre mot de passe et vos paramètres de sécurité.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h4 className="font-medium">Mot de passe</h4>
                  <p className="text-sm text-gray-500">
                      Changez votre mot de passe pour sécuriser votre compte.
                  </p>
                </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Changer le mot de passe
                  </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Supprimer le compte</CardTitle>
                <CardDescription>
                    Supprimez définitivement votre compte et toutes vos données.
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    Cette action est irréversible. Toutes vos données seront supprimées définitivement.
                </p>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer le compte
                  </Button>
              </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de changement de mot de passe */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Entrez votre mot de passe actuel et votre nouveau mot de passe.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe actuel</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mot de passe actuel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nouveau mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirmer le nouveau mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changement...
                    </>
                  ) : (
                    'Changer le mot de passe'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de suppression de compte */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le compte</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center py-2">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-sm text-gray-600">
              Toutes vos données, commandes et réservations seront supprimées définitivement.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserProfile; 