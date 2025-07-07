import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

interface BusinessChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  existingBusinessName: string;
  newBusinessName: string;
  itemName: string;
}

export const BusinessChangeDialog: React.FC<BusinessChangeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  existingBusinessName,
  newBusinessName,
  itemName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Changer de restaurant
          </DialogTitle>
          <DialogDescription>
            Vous avez déjà des articles du restaurant <strong>{existingBusinessName}</strong> dans votre panier.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              Voulez-vous vider votre panier actuel et ajouter <strong>{itemName}</strong> du restaurant <strong>{newBusinessName}</strong> ?
            </p>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>• Votre panier actuel sera vidé</p>
            <p>• Vous pourrez commander uniquement du restaurant {newBusinessName}</p>
            <p>• Une seule livraison sera effectuée</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Vider et ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 