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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
    if (!formData.role) {
      toast.error('Le rôle est requis');
      return false;
    }
    if (!formData.password) {
      toast.error('Le mot de passe est requis');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulation d'ajout d'utilisateur (à remplacer par l'appel API réel)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Utilisateur interne ajouté avec succès !');
      onUserAdded();
      handleClose();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'utilisateur');
      console.error('Error adding internal user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      password: '',
      confirmPassword: ''
    });
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {INTERNAL_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-sm text-gray-500">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.role && (
              <p className="text-sm text-gray-600 mt-1">
                {getRoleDescription(formData.role)}
              </p>
            )}
          </div>

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

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> L'utilisateur recevra un email avec ses identifiants de connexion.
              Il pourra se connecter directement à votre dashboard partenaire.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Ajout en cours...' : 'Ajouter l\'utilisateur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
