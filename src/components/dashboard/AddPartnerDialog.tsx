import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Building2,
  CheckCircle,
  XCircle,
  Upload,
  Camera,
  Zap,
  Tag
} from 'lucide-react';
import { adminUsersService } from '@/lib/services/admin-users';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AddPartnerDialogProps {
  onPartnerAdded: () => void;
}

interface BusinessType {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface MenuTemplate {
  id: number;
  business_type_id: number;
  category_name: string;
  category_description: string;
  sort_order: number;
  is_required: boolean;
}

const AddPartnerDialog: React.FC<AddPartnerDialogProps> = ({ onPartnerAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [menuTemplates, setMenuTemplates] = useState<MenuTemplate[]>([]);

  // Form data pré-rempli avec des données par défaut
  const [formData, setFormData] = useState({
    // Informations de base
    name: 'Nouveau Partenaire',
    email: 'partenaire@exemple.com',
    phone_number: '+224 123 456 789',
    date_of_birth: '1990-01-01',
    gender: 'male',
    
    // Informations professionnelles
    business_name: 'Mon Commerce',
    business_description: 'Description de mon commerce...',
    business_type_id: 1, // ID par défaut pour restaurant
    business_address: '123 Rue Principale, Conakry',
    business_phone: '+224 123 456 789',
    business_email: 'contact@moncommerce.com',
    
    // Informations de contact
    address: '123 Rue Principale',
    city: 'Conakry',
    postal_code: '001',
    country: 'Guinée',
    
    // Informations supplémentaires
    bio: 'Partenaire passionné par son commerce',
    website: 'https://www.moncommerce.com',
    social_media: 'Facebook, Instagram',
    
    // Statut
    is_active: true,
    is_verified: true,
    
    // Informations de sécurité
    password: 'password123',
    confirm_password: 'password123'
  });

  // Charger les types de commerce au montage du composant
  useEffect(() => {
    const loadBusinessTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('business_types')
          .select('*')
          .order('name');

        if (error) {
          console.error('Erreur chargement types de commerce:', error);
          return;
        }

        setBusinessTypes(data || []);
      } catch (error) {
        console.error('Erreur chargement types de commerce:', error);
      }
    };

    if (open) {
      loadBusinessTypes();
    }
  }, [open]);

  // Charger les templates de catégories quand le type de business change
  useEffect(() => {
    const loadMenuTemplates = async () => {
      if (!formData.business_type_id) {
        setMenuTemplates([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('business_type_menu_templates')
          .select('*')
          .eq('business_type_id', formData.business_type_id)
          .order('sort_order');

        if (error) {
          console.error('Erreur chargement templates de catégories:', error);
          return;
        }

        setMenuTemplates(data || []);
      } catch (error) {
        console.error('Erreur chargement templates de catégories:', error);
      }
    };

    loadMenuTemplates();
  }, [formData.business_type_id]);

  // Gérer la sélection d'image
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour pré-remplir avec des données d'exemple
  const prefillWithExample = () => {
    const examples = [
      {
        name: 'Mamadou Diallo',
        email: 'mamadou.diallo@restaurant.com',
        phone_number: '+224 612 345 678',
        business_name: 'Restaurant Le Gourmet',
        business_description: 'Restaurant traditionnel guinéen avec des plats authentiques',
        business_type_id: 1, // Restaurant
        business_address: '45 Avenue de la République, Kaloum, Conakry',
        business_phone: '+224 612 345 678',
        business_email: 'contact@legourmet.com',
        address: '45 Avenue de la République',
        city: 'Conakry',
        bio: 'Chef cuisinier passionné par la cuisine traditionnelle guinéenne'
      },
      {
        name: 'Fatou Camara',
        email: 'fatou.camara@cafe.com',
        phone_number: '+224 623 456 789',
        business_name: 'Café de la Paix',
        business_description: 'Café moderne avec une ambiance chaleureuse',
        business_type_id: 2, // Café
        business_address: '78 Boulevard du Commerce, Almamya, Conakry',
        business_phone: '+224 623 456 789',
        business_email: 'info@cafedelapaix.com',
        address: '78 Boulevard du Commerce',
        city: 'Conakry',
        bio: 'Passionnée de café et de service client'
      },
      {
        name: 'Ibrahima Barry',
        email: 'ibrahima.barry@pharmacy.com',
        phone_number: '+224 634 567 890',
        business_name: 'Pharmacie Centrale',
        business_description: 'Pharmacie de quartier avec produits de qualité',
        business_type_id: 3, // Pharmacie
        business_address: '12 Rue du Marché, Dixinn, Conakry',
        business_phone: '+224 634 567 890',
        business_email: 'contact@pharmaciecentrale.com',
        address: '12 Rue du Marché',
        city: 'Conakry',
        bio: 'Pharmacien diplômé avec 10 ans d\'expérience'
      }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    
    setFormData({
      ...formData,
      ...randomExample,
      password: 'password123',
      confirm_password: 'password123'
    });

    toast.success('Formulaire pré-rempli avec des données d\'exemple');
  };

  // Fonction pour réinitialiser avec des données par défaut
  const resetToDefaults = () => {
    setFormData({
      name: 'Nouveau Partenaire',
      email: 'partenaire@exemple.com',
      phone_number: '+224 123 456 789',
      date_of_birth: '1990-01-01',
      gender: 'male',
      business_name: 'Mon Commerce',
      business_description: 'Description de mon commerce...',
      business_type_id: 1, // Restaurant par défaut
      business_address: '123 Rue Principale, Conakry',
      business_phone: '+224 123 456 789',
      business_email: 'contact@moncommerce.com',
      address: '123 Rue Principale',
      city: 'Conakry',
      postal_code: '001',
      country: 'Guinée',
      bio: 'Partenaire passionné par son commerce',
      website: 'https://www.moncommerce.com',
      social_media: 'Facebook, Instagram',
      is_active: true,
      is_verified: true,
      password: 'password123',
      confirm_password: 'password123'
    });
    setSelectedImage(null);
    setImagePreview(null);
    toast.success('Formulaire réinitialisé');
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des mots de passe
    if (formData.password !== formData.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      // Créer le partenaire avec le service
      const result = await adminUsersService.createPartner({
        ...formData,
        profile_image: selectedImage
      });

      toast.success('Partenaire ajouté avec succès');
      
      // Afficher les identifiants générés
      if (result.credentials) {
        toast.success(`Identifiants générés: Email: ${result.credentials.email}, Mot de passe: ${result.credentials.password}`, {
          duration: 10000,
          description: 'L\'utilisateur devra créer son compte auth séparément avec ces identifiants'
        });
      }
      
      setOpen(false);
      resetToDefaults();
      onPartnerAdded();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du partenaire:', error);
      toast.error('Erreur lors de l\'ajout du partenaire');
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    resetToDefaults();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Partenaire
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Ajouter un Nouveau Partenaire
          </DialogTitle>
          <DialogDescription>
            Créez un nouveau compte partenaire avec toutes les informations nécessaires
          </DialogDescription>
        </DialogHeader>

        {/* Boutons d'aide pour pré-remplir */}
        <div className="flex gap-2 mb-4">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={prefillWithExample}
          >
            <Zap className="h-4 w-4 mr-2" />
            Pré-remplir avec exemple
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={resetToDefaults}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo de profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photo de Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={imagePreview || undefined} />
                  <AvatarFallback>
                    {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="profile-image">Sélectionner une image</Label>
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="max-w-xs"
                  />
                  <p className="text-sm text-gray-500">
                    Formats acceptés: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations Personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom et prénom"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemple.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Téléphone *</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+224 123 456 789"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date de naissance</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculin</SelectItem>
                      <SelectItem value="female">Féminin</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Parlez-nous de vous..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations Professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Informations Professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nom du commerce *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Nom de votre commerce"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_type_id">Type de commerce *</Label>
                  <Select
                    value={formData.business_type_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, business_type_id: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Affichage des templates de catégories */}
              {menuTemplates.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Catégories de menu suggérées pour ce type de commerce :
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {menuTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 rounded-lg border ${
                          template.is_required 
                            ? 'border-blue-200 bg-blue-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900">
                              {template.category_name}
                              {template.is_required && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Requis
                                </Badge>
                              )}
                            </h4>
                            {template.category_description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {template.category_description}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Ordre: {template.sort_order}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Ces catégories seront automatiquement créées lors de la création du commerce.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_phone">Téléphone du commerce *</Label>
                  <Input
                    id="business_phone"
                    value={formData.business_phone}
                    onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
                    placeholder="+224 123 456 789"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_email">Email du commerce *</Label>
                  <Input
                    id="business_email"
                    type="email"
                    value={formData.business_email}
                    onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                    placeholder="contact@moncommerce.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_description">Description du commerce *</Label>
                <Textarea
                  id="business_description"
                  value={formData.business_description}
                  onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                  placeholder="Décrivez votre commerce..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_address">Adresse du commerce *</Label>
                <Input
                  id="business_address"
                  value={formData.business_address}
                  onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                  placeholder="Adresse complète du commerce"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations de Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Informations de Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse personnelle</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Adresse personnelle"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ville"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="Code postal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Pays"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de Supplémentaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Informations Supplémentaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.moncommerce.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social_media">Réseaux sociaux</Label>
                  <Input
                    id="social_media"
                    value={formData.social_media}
                    onChange={(e) => setFormData({ ...formData, social_media: e.target.value })}
                    placeholder="Facebook, Instagram, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Informations de Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mot de passe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmer le mot de passe *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    placeholder="Confirmer le mot de passe"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Compte actif</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_verified"
                  checked={formData.is_verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                />
                <Label htmlFor="is_verified">Compte vérifié</Label>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création en cours...' : 'Créer le Partenaire'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartnerDialog; 