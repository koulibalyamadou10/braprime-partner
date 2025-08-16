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
import { useInternalUsers } from '@/hooks/use-internal-users';
import { usePartnerDashboard } from '@/hooks/use-partner-dashboard';
import {
  Search,
  Plus,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
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

const PartnerUsers = () => {
  const { currentUser } = useAuth();
  const { isPartner } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  // Récupérer les données du business
  const { business } = usePartnerDashboard();
  
  // Récupérer les utilisateurs internes
  const {
    internalUsers,
    isLoading: internalUsersLoading,
    error: internalUsersError,
    deleteUser,
    isDeleting,
    refetch: refetchInternalUsers
  } = useInternalUsers(business?.id || 0, currentUser?.id);

  // Filtrer les utilisateurs internes
  const filteredInternalUsers = internalUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || (user.is_active ? 'active' : 'inactive') === statusFilter;
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter as any);
    
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
      case 'commandes': return <Shield className="h-4 w-4" />;
      case 'menu': return <Shield className="h-4 w-4" />;
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

  // Actions sur les utilisateurs internes
  const handleViewUser = (userId: string) => {
    toast.info(`Voir les détails de l'utilisateur ${userId}`);
  };

  const handleEditUser = (userId: string) => {
    toast.info(`Modifier l'utilisateur ${userId}`);
  };

  const handleDeleteInternalUser = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur interne ? Cette action est irréversible.')) {
      deleteUser(userId);
    }
  };

  const handleUserAdded = () => {
    refetchInternalUsers();
  };

  const handleRefetchClick = () => {
    refetchInternalUsers();
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

  // Afficher un message d'erreur si pas de business
  if (!business?.id) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Utilisateurs">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Business Non Trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Impossible de charger les informations de votre business.
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
              Gérez votre équipe interne
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddUserDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Utilisateur Interne
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Équipe</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {internalUsers.length}
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
                    {internalUsers.filter(u => u.is_active).length}
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
                  <p className="text-sm font-medium text-purple-800">Rôles Différents</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {new Set(internalUsers.flatMap(u => u.roles)).size}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-800">Dernière Connexion</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {internalUsers.length > 0 ? 'Aujourd\'hui' : 'Aucune'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
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
                  <option value="all">Tous les rôles internes</option>
                  <option value="admin">Administrateur</option>
                  <option value="commandes">Commandes</option>
                  <option value="menu">Menu</option>
                  <option value="reservations">Réservations</option>
                  <option value="livreurs">Livreurs</option>
                  <option value="revenu">Revenus</option>
                  <option value="user">Utilisateurs</option>
                  <option value="facturation">Facturation</option>
                </select>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres Avancés
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table des utilisateurs internes */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Liste de l'Équipe Interne</CardTitle>
            <CardDescription>
              {filteredInternalUsers.length} membre(s) de l'équipe trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {internalUsersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Chargement des utilisateurs internes...</p>
              </div>
            ) : internalUsersError ? (
              <div className="text-center py-12">
                <p className="text-red-500">Erreur lors du chargement : {internalUsersError.message}</p>
                <Button onClick={handleRefetchClick} className="mt-2">
                  Réessayer
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Dernière Connexion</TableHead>
                      <TableHead>Créé par</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInternalUsers.map((user) => (
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
                            {user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(user.is_active ? 'active' : 'inactive')} flex w-fit items-center gap-1`}>
                            {getStatusIcon(user.is_active ? 'active' : 'inactive')}
                            <span>{getStatusLabel(user.is_active ? 'active' : 'inactive')}</span>
                          </Badge>
                        </TableCell>
                                                  <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role, index) => (
                                <Badge key={index} className={`${getInternalRoleColor(role)} flex w-fit items-center gap-1`}>
                                  {getInternalRoleIcon(role)}
                                  <span>{getInternalRoleLabel(role)}</span>
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {user.last_login ? formatDate(user.last_login) : 'Jamais connecté'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{user.created_by}</span>
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
                              onClick={() => handleDeleteInternalUser(user.id)}
                              disabled={isDeleting}
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal d'ajout d'utilisateur interne */}
      <AddInternalUserDialog
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        businessId={business.id}
        onUserAdded={handleUserAdded}
      />
    </DashboardLayout>
  );
};

export default PartnerUsers;
