import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { useInternalUsers } from '@/hooks/use-internal-users';
import { useAuth } from '@/contexts/AuthContext';

interface AddInternalUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  onUserAdded: () => void;
}

const INTERNAL_ROLES = [
  { value: 'commandes', label: 'Commandes', description: 'Gestion des commandes et suivi' },
  { value: 'menu', label: 'Menu', description: 'Gestion du menu et des articles' },
  { value: 'reservations', label: 'Réservations', description: 'Gestion des réservations' },
  { value: 'livreurs', label: 'Livreurs', description: 'Gestion des livreurs et affectations' },
  { value: 'revenu', label: 'Revenus', description: 'Suivi des revenus et analytics' },
  { value: 'user', label: 'Utilisateurs', description: 'Gestion des utilisateurs clients' },
  { value: 'facturation', label: 'Facturation', description: 'Gestion des abonnements et factures' },
  { value: 'admin', label: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités' }
];

export const AddInternalUserDialog = ({
  isOpen,
  onClose,
  businessId,
  onUserAdded
}: AddInternalUserDialogProps) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roles: [] as string[],
    password: '',
    confirmPassword: ''
  });
  const [emailError, setEmailError] = useState('');

  // Utiliser le hook pour la gestion des utilisateurs internes
  const { createUser, checkEmailExists, isCreating } = useInternalUsers(businessId, currentUser?.id);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Réinitialiser l'erreur d'email si l'utilisateur modifie l'email
    if (field === 'email') {
      setEmailError('');
    }
  };

  const handleRoleToggle = (roleValue: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleValue)
        ? prev.roles.filter(role => role !== roleValue)
        : [...prev.roles, roleValue]
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('L\'email est requis');
      return false;
    }
    if (formData.roles.length === 0) {
      toast.error('Au moins un rôle est requis');
      return false;
    }
    // Pour l'instant, le mot de passe n'est pas requis
    // car nous créons seulement l'utilisateur dans la table profil_internal_user
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentUser?.id) {
      toast.error('Vous devez être connecté pour créer un utilisateur');
      return;
    }
    
    try {
      // Vérifier si l'email existe déjà
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setEmailError('Cet email est déjà utilisé dans votre business');
        return;
      }

      // Créer l'utilisateur interne via le hook
      createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        roles: formData.roles as any
      }, {
        onSuccess: () => {
          toast.success('Utilisateur interne créé avec succès !');
          onUserAdded();
          handleClose();
        },
        onError: (error: Error) => {
          toast.error(`Erreur lors de la création : ${error.message}`);
        }
      });

    } catch (error) {
      console.error('Error creating internal user:', error);
      toast.error('Erreur lors de l\'ajout de l\'utilisateur');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      roles: [],
      password: '',
      confirmPassword: ''
    });
    setEmailError('');
    onClose();
  };

  const getRoleDescription = (roleValue: string) => {
    const role = INTERNAL_ROLES.find(r => r.value === roleValue);
    return role?.description || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un Utilisateur Interne</DialogTitle>
          <DialogDescription>
            Créez un compte pour un membre de votre équipe avec des permissions spécifiques.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nom et prénom"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+224 XXX XXX XXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@exemple.com"
              required
              className={emailError ? 'border-red-500' : ''}
            />
            {emailError && (
              <p className="text-sm text-red-500">{emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rôles *</Label>
            <div className="grid grid-cols-2 gap-3">
              {INTERNAL_ROLES.map((role) => (
                <div key={role.value} className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id={`role-${role.value}`}
                    checked={formData.roles.includes(role.value)}
                    onChange={() => handleRoleToggle(role.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor={`role-${role.value}`} className="text-sm font-medium text-gray-900 cursor-pointer">
                      {role.label}
                    </label>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {formData.roles.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Rôles sélectionnés : {formData.roles.map(role => 
                  INTERNAL_ROLES.find(r => r.value === role)?.label
                ).join(', ')}
              </p>
            )}
          </div>

          {/* Champs de mot de passe temporairement masqués
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Minimum 6 caractères"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Répéter le mot de passe"
                required
              />
            </div>
          </div>
          */}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> L'utilisateur est ajouté à votre équipe interne. 
              La création de compte de connexion sera implémentée dans une prochaine version.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Ajout en cours...' : 'Ajouter l\'utilisateur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
