
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { usePartnerDashboard } from '@/hooks/use-partner-dashboard';
import {
  Search,
  Plus,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Users,
  Building,
  Clock,
  Truck,
  Loader2,
  X
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import KUserService, { InternalUser, CreateInternalUserRequest, UpdateInternalUserRequest } from '@/lib/kservices/k-users';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';

const PartnerUsers = () => {
  const { currentUser } = useAuth();
  const { isPartner } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<InternalUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<InternalUser | null>(null);

  // États pour la gestion des utilisateurs
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // États pour le formulaire d'ajout
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roles: [] as string[]
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // État pour le popup des identifiants
  const [showCredentialsPopup, setShowCredentialsPopup] = useState(false);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  // Récupérer les données du business
  const { business } = usePartnerDashboard();

  // Rôles disponibles
  const INTERNAL_ROLES = [
    { value: 'admin', label: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités' },
    { value: 'commandes', label: 'Commandes', description: 'Gestion des commandes et suivi' },
    { value: 'menu', label: 'Menu', description: 'Gestion du menu et des articles' },
    { value: 'reservations', label: 'Réservations', description: 'Gestion des réservations' },
    { value: 'livreurs', label: 'Livreurs', description: 'Gestion des livreurs et affectations' },
    { value: 'revenu', label: 'Revenus', description: 'Suivi des revenus et analytics' },
    { value: 'user', label: 'Utilisateurs', description: 'Gestion des utilisateurs clients' },
    { value: 'facturation', label: 'Facturation', description: 'Gestion des abonnements et factures' }
  ];

  // Charger les utilisateurs internes
  const loadInternalUsers = async () => {
    if (!business?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await KUserService.getInternalUsers(business.id);
      
      if (result.success && result.user) {
        const users = Array.isArray(result.user) ? result.user : [result.user];
        setInternalUsers(users);
      } else {
        setError(result.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setError('Erreur inattendue lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les utilisateurs au montage et quand le business change
  useEffect(() => {
    if (business?.id) {
      loadInternalUsers();
    }
  }, [business?.id]);

  // Valider le formulaire d'ajout
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (formData.roles.length === 0) {
      errors.roles = 'Au moins un rôle doit être sélectionné';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Créer un nouvel utilisateur interne
  const handleCreateUser = async () => {
    if (!business?.id || !currentUser?.id) return;
    
    if (!validateForm()) return;
    
    setIsCreating(true);
    
    try {
      // Vérifier si l'email existe déjà
      const emailExists = await KUserService.checkEmailExists(formData.email, business.id);
      if (emailExists) {
        setFormErrors({ email: 'Cet email est déjà utilisé dans votre business' });
        setIsCreating(false);
        return;
      }

      const userData: CreateInternalUserRequest = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        business_id: business.id,
        roles: formData.roles,
        created_by: currentUser.id
      };

      const result = await KUserService.createInternalUser(userData);

      if (result.success) {
        toast.success('Utilisateur interne créé avec succès !');
        setIsAddUserDialogOpen(false);
        
        // Afficher le popup avec les identifiants
        setCreatedUserCredentials({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setShowCredentialsPopup(true);
        
        resetForm();
        await loadInternalUsers(); // Recharger la liste
      } else {
        toast.error(result.error || 'Erreur lors de la création');
      }
    } catch (err) {
      console.error('Erreur création utilisateur:', err);
      toast.error('Erreur inattendue lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      roles: []
    });
    setFormErrors({});
  };

  // Mettre à jour un utilisateur
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setIsUpdating(true);
    
    try {
      const updates: UpdateInternalUserRequest = {};
      
      if (editingUser.name !== formData.name) updates.name = formData.name;
      if (editingUser.phone !== formData.phone) updates.phone = formData.phone;
      if (editingUser.roles !== formData.roles) updates.roles = formData.roles;

      const result = await KUserService.updateInternalUser(editingUser.id, updates);
      
      if (result.success) {
        toast.success('Utilisateur mis à jour avec succès !');
        await loadInternalUsers(); // Recharger la liste
        setIsEditDialogOpen(false);
        setEditingUser(null);
        resetForm();
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error('Erreur mise à jour utilisateur:', err);
      toast.error('Erreur inattendue lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  // Changer le statut d'un utilisateur
  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const result = await KUserService.toggleUserStatus(userId, isActive);
      
      if (result.success) {
        toast.success(`Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès !`);
        await loadInternalUsers(); // Recharger la liste
      } else {
        toast.error(result.error || 'Erreur lors du changement de statut');
      }
    } catch (err) {
      console.error('Erreur changement statut:', err);
      toast.error('Erreur inattendue lors du changement de statut');
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    
    try {
      const result = await KUserService.deleteInternalUser(deletingUser.id);
      
      if (result.success) {
        toast.success('Utilisateur supprimé avec succès !');
        setIsDeleteDialogOpen(false);
        setDeletingUser(null);
        await loadInternalUsers(); // Recharger la liste
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur suppression utilisateur:', err);
      toast.error('Erreur inattendue lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // Ouvrir le dialog d'édition
  const openEditDialog = (user: InternalUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
      roles: user.roles
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  // Ouvrir le dialog de suppression
  const openDeleteDialog = (user: InternalUser) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

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

  const handleRefetchClick = () => {
    loadInternalUsers();
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
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Équipe</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {internalUsers.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Utilisateurs Actifs</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {internalUsers.filter(u => u.is_active).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Rôles Différents</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Set(internalUsers.flatMap(u => u.roles)).size}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Dernière Connexion</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {internalUsers.length > 0 ? 'Aujourd\'hui' : 'Aucune'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-600" />
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
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Chargement des utilisateurs internes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Erreur lors du chargement : {error}</p>
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
                              onClick={() => handleToggleUserStatus(user.id, !user.is_active)}
                              disabled={isUpdating}
                            >
                              {user.is_active ? 'Désactiver' : 'Activer'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(user)}
                              disabled={isUpdating}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDeleteDialog(user)}
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
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un Utilisateur Interne</DialogTitle>
            <DialogDescription>
              Créez un nouveau compte utilisateur pour votre équipe interne.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom et prénom"
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@business.com"
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+224 XXX XXX XXX"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="roles">Rôles *</Label>
                <Select
                  value={formData.roles[0] || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roles: [value] }))}
                >
                  <SelectTrigger className={formErrors.roles ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERNAL_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.roles && <p className="text-sm text-red-500">{formErrors.roles}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 6 caractères"
                  className={formErrors.password ? 'border-red-500' : ''}
                />
                {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Répéter le mot de passe"
                  className={formErrors.confirmPassword ? 'border-red-500' : ''}
                />
                {formErrors.confirmPassword && <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddUserDialogOpen(false);
              resetForm();
            }}>
              Annuler
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer l\'utilisateur'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'Utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur interne.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom complet</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-roles">Rôles</Label>
              <Select
                value={formData.roles[0] || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, roles: [value] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {INTERNAL_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingUser(null);
              resetForm();
            }}>
              Annuler
            </Button>
            <Button onClick={handleUpdateUser} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'Utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur interne ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Utilisateur: <strong>{deletingUser?.name}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup des identifiants créés */}
      <Dialog open={showCredentialsPopup} onOpenChange={setShowCredentialsPopup}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Utilisateur Créé avec Succès !
            </DialogTitle>
            <DialogDescription>
              Voici les identifiants de connexion pour {createdUserCredentials?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Informations de l'utilisateur */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{createdUserCredentials?.name}</h4>
                  <p className="text-sm text-gray-500">Nouvel utilisateur interne</p>
                </div>
              </div>
            </div>

            {/* Identifiants de connexion */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Identifiants de Connexion</h5>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Email :</span>
                  </div>
                  <code className="px-2 py-1 bg-white rounded text-sm font-mono text-blue-800 border">
                    {createdUserCredentials?.email}
                  </code>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Mot de passe :</span>
                  </div>
                  <code className="px-2 py-1 bg-white rounded text-sm font-mono text-green-800 border">
                    {createdUserCredentials?.password}
                  </code>
                </div>
              </div>
            </div>

            {/* Avertissement de sécurité */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">⚠️ Important :</p>
                  <p>Ces identifiants ne seront plus visibles après fermeture de cette fenêtre. 
                  Envoyez-les immédiatement à l'utilisateur par email ou SMS.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-row">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none"
                onClick={() => {
                  // TODO: Implémenter l'envoi par SMS
                  toast.info('Fonctionnalité SMS à implémenter');
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Envoyer par SMS
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none"
                onClick={() => {
                  // TODO: Implémenter l'envoi par email
                  toast.info('Fonctionnalité Email à implémenter');
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Envoyer par Email
              </Button>
            </div>
            
            <Button 
              onClick={() => setShowCredentialsPopup(false)}
              className="w-full sm:w-auto"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PartnerUsers;