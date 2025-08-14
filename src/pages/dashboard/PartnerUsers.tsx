import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { AddInternalUserDialog } from '@/components/dashboard/AddInternalUserDialog';
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
  Users,
  Building,
  Clock,
  Truck
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

// Données statiques pour les utilisateurs clients
const mockCustomers = [
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
  }
];

// Données statiques pour les utilisateurs internes
const mockInternalUsers = [
  {
    id: '1',
    name: 'Aissatou Barry',
    email: 'aissatou.barry@business.com',
    phone: '+224 777 888 999',
    role: 'admin',
    status: 'active',
    joinDate: '2024-01-10',
    lastLogin: '2024-03-22',
    createdBy: 'Propriétaire',
    permissions: ['full_access']
  },
  {
    id: '2',
    name: 'Ousmane Keita',
    email: 'ousmane.keita@business.com',
    phone: '+224 333 444 555',
    role: 'commandes',
    status: 'active',
    joinDate: '2024-02-15',
    lastLogin: '2024-03-21',
    createdBy: 'Aissatou Barry',
    permissions: ['orders_management', 'order_tracking']
  },
  {
    id: '3',
    name: 'Mariama Diallo',
    email: 'mariama.diallo@business.com',
    phone: '+224 111 222 333',
    role: 'menu',
    status: 'active',
    joinDate: '2024-02-20',
    lastLogin: '2024-03-20',
    createdBy: 'Aissatou Barry',
    permissions: ['menu_management', 'item_editing']
  }
];

const PartnerUsers = () => {
  const { currentUser } = useAuth();
  const { isPartner } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'customers' | 'internal'>('customers');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  // Filtrer les utilisateurs clients
  const filteredCustomers = mockCustomers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Filtrer les utilisateurs internes
  const filteredInternalUsers = mockInternalUsers.filter(user => {
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

  // Obtenir la couleur du rôle interne
  const getInternalRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'commandes': return 'bg-blue-100 text-blue-800';
      case 'menu': return 'bg-green-100 text-green-800';
      case 'reservations': return 'bg-purple-100 text-purple-800';
      case 'livreurs': return 'bg-orange-100 text-orange-800';
      case 'revenu': return 'bg-yellow-100 text-yellow-800';
      case 'user': return 'bg-indigo-100 text-indigo-800';
      case 'facturation': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du rôle interne
  const getInternalRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'commandes': return <ShoppingBag className="h-4 w-4" />;
      case 'menu': return <Star className="h-4 w-4" />;
      case 'reservations': return <Calendar className="h-4 w-4" />;
      case 'livreurs': return <Truck className="h-4 w-4" />;
      case 'revenu': return <Building className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'facturation': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  // Obtenir le label du rôle interne
  const getInternalRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'commandes': return 'Commandes';
      case 'menu': return 'Menu';
      case 'reservations': return 'Réservations';
      case 'livreurs': return 'Livreurs';
      case 'revenu': return 'Revenus';
      case 'user': return 'Utilisateurs';
      case 'facturation': return 'Facturation';
      default: return role;
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

  const handleUserAdded = () => {
    toast.success('Utilisateur interne ajouté avec succès !');
    // Ici vous pourriez rafraîchir la liste des utilisateurs internes
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
              Gérez vos clients et votre équipe interne
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'internal' && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsAddUserDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un Utilisateur Interne
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => setActiveTab(activeTab === 'customers' ? 'internal' : 'customers')}
            >
              {activeTab === 'customers' ? 'Voir Équipe Interne' : 'Voir Clients'}
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    {activeTab === 'customers' ? 'Total Clients' : 'Total Équipe'}
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {activeTab === 'customers' ? mockCustomers.length : mockInternalUsers.length}
                  </p>
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
                    {activeTab === 'customers' 
                      ? mockCustomers.filter(u => u.status === 'active').length
                      : mockInternalUsers.filter(u => u.status === 'active').length
                    }
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
                  <p className="text-sm font-medium text-purple-800">
                    {activeTab === 'customers' ? 'Commandes Totales' : 'Rôles Différents'}
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {activeTab === 'customers' 
                      ? mockCustomers.reduce((sum, user) => sum + user.totalOrders, 0)
                      : new Set(mockInternalUsers.map(u => u.role)).size
                    }
                  </p>
                </div>
                {activeTab === 'customers' ? (
                  <ShoppingBag className="h-8 w-8 text-purple-600" />
                ) : (
                  <Shield className="h-8 w-8 text-purple-600" />
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {activeTab === 'customers' ? 'Revenus Totaux' : 'Dernière Connexion'}
                  </p>
                  <p className="text-3xl font-bold text-amber-900">
                    {activeTab === 'customers' 
                      ? formatCurrency(mockCustomers.reduce((sum, user) => sum + user.totalSpent, 0))
                      : 'Aujourd\'hui'
                    }
                  </p>
                </div>
                {activeTab === 'customers' ? (
                  <Star className="h-8 w-8 text-amber-600" />
                ) : (
                  <Clock className="h-8 w-8 text-amber-600" />
                )}
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
                    placeholder={`Rechercher par nom, email ou téléphone...`}
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
                  <option value="all">
                    {activeTab === 'customers' ? 'Tous les rôles' : 'Tous les rôles internes'}
                  </option>
                  {activeTab === 'customers' ? (
                    <>
                      <option value="customer">Clients</option>
                      <option value="vip">VIP</option>
                      <option value="premium">Premium</option>
                    </>
                  ) : (
                    <>
                      <option value="admin">Administrateur</option>
                      <option value="commandes">Commandes</option>
                      <option value="menu">Menu</option>
                      <option value="reservations">Réservations</option>
                      <option value="livreurs">Livreurs</option>
                      <option value="revenu">Revenus</option>
                      <option value="user">Utilisateurs</option>
                      <option value="facturation">Facturation</option>
                    </>
                  )}
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
            <CardTitle>
              {activeTab === 'customers' ? 'Liste des Clients' : 'Liste de l\'Équipe Interne'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'customers' 
                ? `${filteredCustomers.length} client(s) trouvé(s)`
                : `${filteredInternalUsers.length} membre(s) de l'équipe trouvé(s)`
              }
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
                    {activeTab === 'customers' ? (
                      <>
                        <TableHead>Activité</TableHead>
                        <TableHead>Localisation</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Dernière Connexion</TableHead>
                        <TableHead>Créé par</TableHead>
                      </>
                    )}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTab === 'customers' ? (
                    // Affichage des clients
                    filteredCustomers.map((user) => (
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
                    ))
                  ) : (
                    // Affichage des utilisateurs internes
                    filteredInternalUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
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
                          <Badge className={`${getInternalRoleColor(user.role)} flex w-fit items-center gap-1`}>
                            {getInternalRoleIcon(user.role)}
                            <span>{getInternalRoleLabel(user.role)}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(user.lastLogin)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{user.createdBy}</span>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal d'ajout d'utilisateur interne */}
      <AddInternalUserDialog
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        businessId={1} // À remplacer par l'ID réel du business
        onUserAdded={handleUserAdded}
      />
    </DashboardLayout>
  );
};

export default PartnerUsers;
