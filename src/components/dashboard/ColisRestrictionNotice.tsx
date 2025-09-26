import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Package } from 'lucide-react';

interface ColisRestrictionNoticeProps {
  businessType?: string;
}

export const ColisRestrictionNotice = ({ businessType }: ColisRestrictionNoticeProps) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-blue-900">Fonctionnalité Colis</CardTitle>
        </div>
        <CardDescription className="text-blue-700">
          La gestion des colis est disponible uniquement pour les entreprises de type "Colis"
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-start gap-3">
          <Package className="h-8 w-8 text-blue-600 mt-1" />
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              <strong>Votre type de business actuel :</strong> {businessType || 'Non défini'}
            </p>
            <p className="text-sm text-blue-700">
              Pour accéder à la gestion des colis, votre entreprise doit être enregistrée comme service de colis.
              Contactez l'administration pour modifier votre type de business si nécessaire.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
