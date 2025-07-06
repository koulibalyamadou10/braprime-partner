import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useRequests } from '@/hooks/use-requests';

const RequestStatusBadge = () => {
  const { currentRequestStatus, hasPendingRequest } = useRequests();

  // Ne pas afficher le badge pour les utilisateurs connectés
  // Le badge n'est utile que pour les visiteurs non connectés
  if (!hasPendingRequest) {
    return null;
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Demande en cours',
          variant: 'secondary' as const,
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };
      case 'under_review':
        return {
          icon: AlertCircle,
          label: 'En révision',
          variant: 'secondary' as const,
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Approuvée',
          variant: 'default' as const,
          className: 'bg-green-50 text-green-700 border-green-200'
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejetée',
          variant: 'destructive' as const,
          className: 'bg-red-50 text-red-700 border-red-200'
        };
      default:
        return {
          icon: Clock,
          label: 'En attente',
          variant: 'secondary' as const,
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig(currentRequestStatus);

  return (
    <Badge 
      variant={statusConfig.variant}
      className={`flex items-center gap-1 px-3 py-1 text-xs font-medium ${statusConfig.className}`}
    >
      <statusConfig.icon className="h-3 w-3" />
      {statusConfig.label}
    </Badge>
  );
};

export default RequestStatusBadge; 