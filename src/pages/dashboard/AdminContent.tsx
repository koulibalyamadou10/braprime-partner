import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Tag, 
  Award,
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  Star,
  Clock,
  Check,
  X,
  AlertTriangle,
  Download,
  Upload,
  BarChart3,
  Settings,
  Palette,
  Image,
  Link as LinkIcon,
  Globe,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Map,
  Building2,
  Utensils,
  Coffee,
  ShoppingBag,
  Car,
  Heart,
  BookOpen,
  Scissors,
  Wrench,
  Pill,
  Gift
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  link: string;
  description: string;
  is_active: boolean;
  image: string;
  business_count: number;
  created_at: string;
  updated_at: string;
}

interface BusinessType {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
  image_url: string;
  business_count: number;
  created_at: string;
  updated_at: string;
}

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: "Restaurants",
      icon: "Utensils",
      color: "#FF6B6B",
      link: "/restaurants",
      description: "Restaurants et établissements de restauration",
      is_active: true,
      image: "/api/placeholder/400/200",
      business_count: 45,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-20T15:30:00Z"
    },
    {
      id: 2,
      name: "Cafés",
      icon: "Coffee",
      color: "#4ECDC4",
      link: "/cafes",
      description: "Cafés et pâtisseries",
      is_active: true,
      image: "/api/placeholder/400/200",
      business_count: 23,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-20T15:30:00Z"
    },
    {
      id: 3,
      name: "Épiceries",
      icon: "ShoppingBag",
      color: "#45B7D1",
      link: "/epiceries",
      description: "Épiceries et supermarchés",
      is_active: true,
      image: "/api/placeholder/400/200",
      business_count: 67,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-20T15:30:00Z"
    },
    {
      id: 4,
      name: "Pharmacies",
      icon: "Pill",
      color: "#96CEB4",
      link: "/pharmacies",
      description: "Pharmacies et parapharmacies",
      is_active: false,
      image: "/api/placeholder/400/200",
      business_count: 12,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-20T15:30:00Z"
    }
  ]);

  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([
    {
      id: 1,
      name: "Restaurant",
      icon: "Utensils",
      color: "#FF6B6B",
      description: "Établissements de restauration",
      features: ["Livraison", "Réservation", "Menu en ligne"],
      image_url: "/api/placeholder/400/200",
      business_count: 45,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-20T15:30:00Z"
    },
    {
      id: 2,
      name: "Café",
      icon: "Coffee",
      color: "#4ECDC4",
      description: "Cafés et pâtisseries",
      features: ["Livraison", "Réservation"],
      image_url: "/api/placeholder/400/200",
      business_count: 23,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-20T15:30:00Z"
    },
    {
      id: 3,
      name: "Épicerie",
      icon: "ShoppingBag",
      color: "#45B7D1",
      description: "Épiceries et supermarchés",
      features: ["Livraison", "Panier en ligne"],
      image_url: "/api/placeholder/400/200",
      business_count: 67,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-20T15:30:00Z"
    }
  ]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBusinessTypes = businessTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCategoryStatus = (categoryId: number) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? { ...category, is_active: !category.is_active }
        : category
    ));
    toast.success("Statut de la catégorie mis à jour");
  };

  const deleteCategory = (categoryId: number) => {
    setCategories(prev => prev.filter(category => category.id !== categoryId));
    toast.success("Catégorie supprimée");
  };

  const deleteBusinessType = (typeId: number) => {
    setBusinessTypes(prev => prev.filter(type => type.id !== typeId));
    toast.success("Type de commerce supprimé");
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Utensils, Coffee, ShoppingBag, Pill, Car, Heart, BookOpen, Scissors, Wrench, Gift
    };
    return iconMap[iconName] || Tag;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">Actif</Badge>
    ) : (
      <Badge variant="secondary">Inactif</Badge>
    );
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="Gestion du Contenu">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion du Contenu</h2>
            <p className="text-muted-foreground">
              Gérez les catégories, types de commerce et contenu de la plateforme
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-2 border-b">
          <Button
            variant={activeTab === 'categories' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('categories')}
            className="flex items-center gap-2"
          >
            <Tag className="h-4 w-4" />
            Catégories
          </Button>
          <Button
            variant={activeTab === 'business-types' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('business-types')}
            className="flex items-center gap-2"
          >
            <Award className="h-4 w-4" />
            Types de Commerce
          </Button>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={`Rechercher ${activeTab === 'categories' ? 'une catégorie' : 'un type de commerce'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Tag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-sm text-gray-500">Total catégories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {categories.filter(c => c.is_active).length}
                  </p>
                  <p className="text-sm text-gray-500">Catégories actives</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{businessTypes.length}</p>
                  <p className="text-sm text-gray-500">Types de commerce</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {categories.reduce((sum, c) => sum + c.business_count, 0)}
                  </p>
                  <p className="text-sm text-gray-500">Commerces total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'categories' && (
          <Card>
            <CardHeader>
              <CardTitle>Catégories</CardTitle>
              <CardDescription>
                {filteredCategories.length} catégorie(s) trouvée(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Commerces</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => {
                      const IconComponent = getIconComponent(category.icon);
                      return (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: category.color + '20' }}
                              >
                                <IconComponent 
                                  className="h-5 w-5" 
                                  style={{ color: category.color }}
                                />
                              </div>
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-sm text-gray-500">{category.link}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{category.description}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{category.business_count} commerces</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(category.is_active)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Détails de la Catégorie</DialogTitle>
                                    <DialogDescription>
                                      Informations sur {category.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Nom</p>
                                        <p className="font-medium">{category.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Lien</p>
                                        <p className="font-medium">{category.link}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Couleur</p>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="h-4 w-4 rounded"
                                            style={{ backgroundColor: category.color }}
                                          />
                                          <span className="font-medium">{category.color}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Commerces</p>
                                        <p className="font-medium">{category.business_count}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Description</p>
                                      <p className="text-sm">{category.description}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toggleCategoryStatus(category.id)}
                              >
                                {category.is_active ? (
                                  <PowerOff className="h-4 w-4" />
                                ) : (
                                  <Power className="h-4 w-4" />
                                )}
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirmer la suppression</DialogTitle>
                                    <DialogDescription>
                                      Êtes-vous sûr de vouloir supprimer la catégorie "{category.name}" ? 
                                      Cette action est irréversible.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline">Annuler</Button>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => deleteCategory(category.id)}
                                    >
                                      Supprimer
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'business-types' && (
          <Card>
            <CardHeader>
              <CardTitle>Types de Commerce</CardTitle>
              <CardDescription>
                {filteredBusinessTypes.length} type(s) trouvé(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Fonctionnalités</TableHead>
                      <TableHead>Commerces</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinessTypes.map((type) => {
                      const IconComponent = getIconComponent(type.icon);
                      return (
                        <TableRow key={type.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: type.color + '20' }}
                              >
                                <IconComponent 
                                  className="h-5 w-5" 
                                  style={{ color: type.color }}
                                />
                              </div>
                              <div>
                                <p className="font-medium">{type.name}</p>
                                <p className="text-sm text-gray-500">{type.color}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{type.description}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {type.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{type.business_count} commerces</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Détails du Type de Commerce</DialogTitle>
                                    <DialogDescription>
                                      Informations sur {type.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Nom</p>
                                        <p className="font-medium">{type.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Couleur</p>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="h-4 w-4 rounded"
                                            style={{ backgroundColor: type.color }}
                                          />
                                          <span className="font-medium">{type.color}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">Commerces</p>
                                        <p className="font-medium">{type.business_count}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Description</p>
                                      <p className="text-sm">{type.description}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Fonctionnalités</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {type.features.map((feature, index) => (
                                          <Badge key={index} variant="outline">
                                            {feature}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirmer la suppression</DialogTitle>
                                    <DialogDescription>
                                      Êtes-vous sûr de vouloir supprimer le type "{type.name}" ? 
                                      Cette action est irréversible.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline">Annuler</Button>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => deleteBusinessType(type.id)}
                                    >
                                      Supprimer
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminContent; 