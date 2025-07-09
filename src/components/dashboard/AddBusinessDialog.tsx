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
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  User, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star,
  CheckCircle,
  XCircle,
  Store,
  Coffee,
  ShoppingCart,
  Pill,
  Tv,
  Heart,
  Briefcase
} from 'lucide-react';
import { adminBusinessesService, BusinessType, Partner } from '@/lib/services/admin-businesses';
import { toast } from 'sonner';

interface AddBusinessDialogProps {
  onBusinessAdded: () => void;
}

// Mapping des types de business avec leurs traductions et icônes
const businessTypeMapping: { [key: string]: { label: string; icon: React.ReactNode; description: string } } = {
  'Restaurant': {
    label: 'Restaurant',
    icon: <Store className="h-4 w-4" />,
    description: 'Restaurants et établissements de restauration'
  },
  'Café': {
    label: 'Café',
    icon: <Coffee className="h-4 w-4" />,
    description: 'Cafés et établissements de boissons'
  },
  'Marché': {
    label: 'Marché',
    icon: <ShoppingCart className="h-4 w-4" />,
    description: 'Marchés et épiceries locales'
  },
  'Supermarché': {
    label: 'Supermarché',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Supermarchés et grandes surfaces'
  },
  'Pharmacie': {
    label: 'Pharmacie',
    icon: <Pill className="h-4 w-4" />,
    description: 'Pharmacies et parapharmacies'
  },
  'Électronique': {
    label: 'Électronique',
    icon: <Tv className="h-4 w-4" />,
    description: 'Magasins d\'électronique et technologie'
  },
  'Beauté': {
    label: 'Beauté',
    icon: <Heart className="h-4 w-4" />,
    description: 'Salons de beauté et cosmétiques'
  },
  'Autre': {
    label: 'Autre',
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Autres types de commerces'
  }
};

const AddBusinessDialog: React.FC<AddBusinessDialogProps> = ({ onBusinessAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchingPartner, setSearchingPartner] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    business_type_id: '',
    address: '',
    phone: '',
    email: '',
    opening_hours: '',
    cuisine_type: '',
    delivery_time: '30-45 min',
    delivery_fee: 5000,
    is_active: true,
    is_open: true
  });

  // Charger les types de commerce
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const types = await adminBusinessesService.getBusinessTypes();
        setBusinessTypes(types);
      } catch (error) {
        console.error('Erreur lors du chargement des types de business:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    if (open) {
      loadInitialData();
    }
  }, [open]);

  // Rechercher des partenaires
  const searchPartners = async (search: string) => {
    if (!search.trim()) {
      setPartners([]);
      return;
    }

    setSearchingPartner(true);
    try {
      const partners = await adminBusinessesService.searchPartners(search);
      setPartners(partners);
    } catch (error) {
      console.error('Erreur lors de la recherche de partenaires:', error);
      toast.error('Erreur lors de la recherche de partenaires');
    } finally {
      setSearchingPartner(false);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPartner) {
      toast.error('Veuillez sélectionner un partenaire');
      return;
    }

    setLoading(true);
    try {
      await adminBusinessesService.addBusiness({
        ...formData,
        business_type_id: parseInt(formData.business_type_id),
        delivery_fee: parseInt(formData.delivery_fee.toString()),
        owner_id: selectedPartner.id
      });

      toast.success('Commerce ajouté avec succès');
      setOpen(false);
      resetForm();
      onBusinessAdded();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commerce:', error);
      toast.error('Erreur lors de l\'ajout du commerce');
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      business_type_id: '',
      address: '',
      phone: '',
      email: '',
      opening_hours: '',
      cuisine_type: '',
      delivery_time: '30-45 min',
      delivery_fee: 5000,
      is_active: true,
      is_open: true
    });
    setSelectedPartner(null);
    setSearchTerm('');
    setPartners([]);
  };

  // Obtenir les informations du type de business
  const getBusinessTypeInfo = (typeName: string) => {
    return businessTypeMapping[typeName] || {
      label: typeName,
      icon: <Store className="h-4 w-4" />,
      description: 'Type de commerce'
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Commerce
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ajouter un Nouveau Commerce
          </DialogTitle>
          <DialogDescription>
            Créez un nouveau commerce et assignez-le à un partenaire existant
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du Partenaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Sélectionner le Partenaire Propriétaire
              </CardTitle>
              <CardDescription>
                Choisissez le partenaire qui gérera ce commerce
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recherche de partenaire */}
              <div className="space-y-2">
                <Label htmlFor="partner-search">Rechercher un partenaire</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="partner-search"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      searchPartners(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Liste des partenaires */}
              {searchingPartner && (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {partners.length > 0 && !searchingPartner && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {partners.map((partner) => (
                    <div
                      key={partner.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPartner?.id === partner.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <Avatar>
                        <AvatarImage src={partner.profile_image} />
                        <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{partner.name}</p>
                          <Badge variant={partner.is_active ? "default" : "secondary"}>
                            {partner.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{partner.email}</p>
                        {partner.phone_number && (
                          <p className="text-sm text-gray-600">{partner.phone_number}</p>
                        )}
                      </div>
                      {selectedPartner?.id === partner.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Partenaire sélectionné */}
              {selectedPartner && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedPartner.profile_image} />
                      <AvatarFallback>{selectedPartner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-green-800">{selectedPartner.name}</p>
                      <p className="text-sm text-green-600">{selectedPartner.email}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPartner(null)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations du Commerce */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Informations du Commerce
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du commerce *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom du commerce"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_type">Type de commerce *</Label>
                  <Select
                    value={formData.business_type_id}
                    onValueChange={(value) => setFormData({ ...formData, business_type_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => {
                        const typeInfo = getBusinessTypeInfo(type.name);
                        return (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            <div className="flex items-center gap-2">
                              {typeInfo.icon}
                              <div>
                                <div className="font-medium">{typeInfo.label}</div>
                                <div className="text-xs text-gray-500">{typeInfo.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuisine_type">Type de cuisine</Label>
                  <Input
                    id="cuisine_type"
                    value={formData.cuisine_type}
                    onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                    placeholder="Ex: Italienne, Africaine, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+224 123 456 789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du commerce..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Adresse complète"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@commerce.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opening_hours">Heures d'ouverture</Label>
                  <Input
                    id="opening_hours"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                    placeholder="Ex: 8h-22h"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_time">Temps de livraison</Label>
                  <Input
                    id="delivery_time"
                    value={formData.delivery_time}
                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                    placeholder="Ex: 30-45 min"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_fee">Frais de livraison (GNF)</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    value={formData.delivery_fee}
                    onChange={(e) => setFormData({ ...formData, delivery_fee: parseInt(e.target.value) || 0 })}
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Commerce actif</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_open"
                    checked={formData.is_open}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_open: checked })}
                  />
                  <Label htmlFor="is_open">Ouvert actuellement</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading || !selectedPartner || !formData.name || !formData.address || !formData.business_type_id}
          >
            {loading ? 'Ajout en cours...' : 'Ajouter le Commerce'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBusinessDialog; 