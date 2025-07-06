import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { useRequests } from '@/hooks/use-requests';

interface RequestStatusBadgeProps {
  className?: string;
}

const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ className }) => {
  const { currentRequestStatus, loadingStatus } = useRequests();

  if (loadingStatus) {
    return (
      <Badge variant="outline" className={className}>
        <div className="animate-pulse h-3 w-16 bg-gray-200 rounded"></div>
      </Badge>
    );
  }

  if (!currentRequestStatus) {
    return null;
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        label: 'Demande en cours',
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-yellow-600'
      },
      under_review: {
        label: 'En révision',
        variant: 'outline' as const,
        icon: AlertCircle,
        color: 'text-blue-600'
      },
      approved: {
        label: 'Approuvée',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600'
      },
      rejected: {
        label: 'Rejetée',
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600'
      }
    };

    return configs[status as keyof typeof configs] || {
      label: 'Demande',
      variant: 'outline' as const,
      icon: FileText,
      color: 'text-gray-600'
    };
  };

  const config = getStatusConfig(currentRequestStatus);

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${className}`}>
      <config.icon className={`h-3 w-3 ${config.color}`} />
      {config.label}
    </Badge>
  );
};

export default RequestStatusBadge; 