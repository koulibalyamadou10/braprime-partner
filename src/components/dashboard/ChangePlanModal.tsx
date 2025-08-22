import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: {
    name: string;
    price: number;
    monthly_price: number;
    duration_months: number;
    savings_percentage: number;
  };
  newPlan: {
    name: string;
    price: number;
    monthly_price: number;
    duration_months: number;
    savings_percentage: number;
  };
  isLoading?: boolean;
}

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  newPlan,
  isLoading = false
}) => {
  // Calculer la différence de prix
  const priceDifference = newPlan.price - currentPlan.price;
  const isUpgrade = priceDifference > 0;
  const isDowngrade = priceDifference < 0;
  const isSamePrice = priceDifference === 0;

  // Empêcher les downgrades
  if (isDowngrade) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Changement non autorisé
            </DialogTitle>
            <DialogDescription>
              Impossible de passer à un plan inférieur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Règles de changement de plan :</p>
                  <ul className="space-y-1">
                    <li>• Seuls les upgrades sont autorisés</li>
                    <li>• Les downgrades ne sont pas possibles</li>
                    <li>• Contactez le support pour annuler votre abonnement</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Différence de prix</p>
              <p className="text-red-600 font-semibold">
                {priceDifference.toLocaleString()} GNF (remboursement)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Les remboursements ne sont pas gérés automatiquement
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Empêcher le changement vers le même plan
  if (isSamePrice) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-orange-500" />
              Plan identique
            </DialogTitle>
            <DialogDescription>
              Vous avez déjà ce plan d'abonnement
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-800">
                Vous êtes déjà abonné au plan <strong>{newPlan.name}</strong>. 
                Aucun changement n'est nécessaire.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Modal normal pour les upgrades
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Upgrade de plan
          </DialogTitle>
          <DialogDescription>
            Passer à un plan supérieur
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comparaison simple */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="text-center flex-1">
              <p className="text-sm text-gray-600">Plan actuel</p>
              <p className="font-medium">{currentPlan.name}</p>
              <p className="text-sm text-gray-500">{currentPlan.price.toLocaleString()} GNF</p>
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
            
            <div className="text-center flex-1">
              <p className="text-sm text-gray-600">Nouveau plan</p>
              <p className="font-medium">{newPlan.name}</p>
              <p className="text-sm text-gray-500">{newPlan.price.toLocaleString()} GNF</p>
            </div>
          </div>

          {/* Montant supplémentaire */}
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Montant supplémentaire</p>
            <p className="text-red-600 font-semibold text-lg">
              +{priceDifference.toLocaleString()} GNF
            </p>
          </div>

          <Separator />

          {/* Informations importantes */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Votre abonnement actuel sera désactivé</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Le nouveau plan sera activé immédiatement</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Vous devrez payer la différence de {priceDifference.toLocaleString()} GNF</span>
            </div>
          </div>

          {/* Avertissement simple */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-800">
                Cette action est irréversible
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Upgrade...
              </>
            ) : (
              'Payer et upgrade'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
