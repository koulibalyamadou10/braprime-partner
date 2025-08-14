import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  ShoppingBag,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

// Données statiques pour les utilisateurs
const mockUsers = [
  {
    id: '1',
    name: 'Mamadou Diallo',
    email: 'mamadou.diallo@email.com',
    phone: '+224 123 456 789',
    role: 'customer',
    status: 'active',
    joinDate: '2024-01-15',
    lastOrder: '2024-03-20',
    totalOrders: 12,
    totalSpent: 450000,
    location: 'Conakry, Kaloum',
    avatar: '/placeholder-avatar.jpg'
  },
  {
    id: '2',
    name: 'Fatoumata Camara',
    email: 'fatoumata.camara@email.com',
    phone: '+224 987 654 321',
    role: 'customer',
    status: 'active',
    joinDate: '2024-02-10',
    lastOrder: '2024-03-18',
    totalOrders: 8,
    totalSpent: 320000,
    location: 'Conakry, Ratoma',
    avatar: '/placeholder-avatar.jpg'
  },
  {
    id: '3',
    name: 'Ibrahima Bah',
    email: 'ibrahima.bah@email.com',
    phone: '+224 555 123 456',
    role: 'customer',
    status: 'inactive',
    joinDate: '2023-12-05',
    lastOrder: '2024-01-20',
    totalOrders: 5,
    totalSpent: 180000,
    location: 'Conakry, Dixinn',
    avatar: '/placeholder-avatar.jpg'
  },
  {
    id: '4',
    name: 'Aissatou Barry',
    email: 'aissatou.barry@email.com',
    phone: '+224 777 888 999',
    role: 'customer',
    status: 'active',
    joinDate: '2024-03-01',
    lastOrder: '2024-03-22',
    totalOrders: 3,
    totalSpent: 95000,
    location: 'Conakry, Matam',
    avatar: '/placeholder-avatar.jpg'
  },
  {
    id: '5',
    name: 'Ousmane Keita',
    email: 'ousmane.keita@email.com',
    phone: '+224 333 444 555',
    role: 'customer',
    status: 'active',
    joinDate: '2024-01-20',
    lastOrder: '2024-03-19',
    totalOrders: 15,
    totalSpent: 680000,
    location: 'Conakry, Matoto',
    avatar: '/placeholder-avatar.jpg'
  }
];

const PartnerUsers = () => {
  const { currentUser } = useAuth();
  const { isPartner } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Filtrer les utilisateurs
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="h-4 w-4" />;
      case 'inactive': return <UserX className="h-4 w-4" />;
      case 'suspended': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  // Obtenir le label du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  // Obtenir l'icône du rôle
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'customer': return <User className="h-4 w-4" />;
      case 'vip': return <Crown className="h-4 w-4" />;
      case 'premium': return <Star className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formater le montant
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M GNF`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  // Actions sur les utilisateurs
  const handleViewUser = (userId: string) => {
    toast.info(`Voir les détails de l'utilisateur ${userId}`);
  };

  const handleEditUser = (userId: string) => {
    toast.info(`Modifier l'utilisateur ${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    toast.info(`Supprimer l'utilisateur ${userId}`);
  };

  // Vérifier si l'utilisateur est authentifié
  if (!currentUser) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Utilisateurs">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Authentification Requise</h3>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder à cette page
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Vérifier si l'utilisateur est un partenaire
  if (!isPartner) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Utilisateurs">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
            <p className="text-muted-foreground mb-4">
              Cette page est réservée aux partenaires.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={partnerNavItems} title="Gestion des Utilisateurs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h2>
            <p className="text-gray-500">
              Gérez vos clients et suivez leur activité
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un Utilisateur
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Utilisateurs</p>
                  <p className="text-3xl font-bold text-blue-900">{mockUsers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Utilisateurs Actifs</p>
                  <p className="text-3xl font-bold text-green-900">
                    {mockUsers.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Commandes Totales</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {mockUsers.reduce((sum, user) => sum + user.totalOrders, 0)}
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-800">Revenus Totaux</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {formatCurrency(mockUsers.reduce((sum, user) => sum + user.totalSpent, 0))}
                  </p>
                </div>
                <Star className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, email ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                  <option value="suspended">Suspendus</option>
                </select>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="customer">Clients</option>
                  <option value="vip">VIP</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres Avancés
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table des utilisateurs */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Liste des Utilisateurs</CardTitle>
            <CardDescription>
              {filteredUsers.length} utilisateur(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Activité</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(user.status)} flex w-fit items-center gap-1`}>
                          {getStatusIcon(user.status)}
                          <span>{getStatusLabel(user.status)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">Inscrit le {formatDate(user.joinDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{user.totalOrders} commandes</span>
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(user.totalSpent)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUser(user.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerUsers;
