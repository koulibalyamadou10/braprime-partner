import React, { useState } from 'react';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import AddPartnerDialog from '@/components/dashboard/AddPartnerDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  Shield,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminUsers = () => {
  const {
    users,
    usersTotal,
    usersPage,
    usersSearch,
    loading,
    error,
    handleUsersSearch,
    handleUsersPageChange,
    refreshData
  } = useAdminDashboard();

  const [searchTerm, setSearchTerm] = useState(usersSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleUsersSearch(searchTerm);
  };

  const handlePartnerAdded = () => {
    // Rafraîchir les données après l'ajout d'un partenaire
    refreshData();
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrateur', variant: 'destructive' as const, icon: Shield },
      partner: { label: 'Partenaire', variant: 'default' as const, icon: Users },
      driver: { label: 'Livreur', variant: 'secondary' as const, icon: Users },
      customer: { label: 'Client', variant: 'outline' as const, icon: Users }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { 
      label: role, 
      variant: 'outline' as const, 
      icon: Users 
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M GNF`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  const totalPages = Math.ceil(usersTotal / 10);

  if (loading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Gestion des Utilisateurs">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Gestion des Utilisateurs">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Gestion des Utilisateurs">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des Utilisateurs</h2>
            <p className="text-muted-foreground">
              Gérez tous les utilisateurs de la plateforme - {usersTotal} utilisateurs au total
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <AddPartnerDialog onPartnerAdded={handlePartnerAdded} />
            <Button variant="outline" size="icon" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                  <p className="text-2xl font-bold">{usersTotal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Commandes Moyennes</p>
                  <p className="text-2xl font-bold">
                    {users.length > 0 
                      ? Math.round(users.reduce((sum, u) => sum + (u.total_orders || 0), 0) / users.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Dépenses Moyennes</p>
                  <p className="text-2xl font-bold">
                    {users.length > 0 
                      ? formatCurrency(Math.round(users.reduce((sum, u) => sum + (u.total_spent || 0), 0) / users.length))
                      : '0 GNF'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche et filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Rechercher des utilisateurs</CardTitle>
            <CardDescription>
              Trouvez rapidement un utilisateur par nom ou email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  handleUsersSearch('');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Liste des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Utilisateurs</CardTitle>
            <CardDescription>
              {users.length} utilisateurs affichés sur {usersTotal} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Commandes</TableHead>
                    <TableHead>Dépenses</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.profile_image} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.phone_number && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone_number}
                            </div>
                          )}
                          {user.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.address.substring(0, 30)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Actif
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Inactif
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <ShoppingBag className="h-4 w-4 mr-1 text-blue-600" />
                          {user.total_orders || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                          {formatCurrency(user.total_spent || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handleUsersPageChange(usersPage - 1)}
                        className={usersPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handleUsersPageChange(page)}
                            isActive={page === usersPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handleUsersPageChange(totalPages)}
                            isActive={totalPages === usersPage}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handleUsersPageChange(usersPage + 1)}
                        className={usersPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers; 