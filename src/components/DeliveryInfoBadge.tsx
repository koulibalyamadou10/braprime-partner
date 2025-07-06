import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliveryInfoBadgeProps {
  deliveryType: 'asap' | 'scheduled';
  preferredDeliveryTime?: string;
  scheduledWindowStart?: string;
  scheduledWindowEnd?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  className?: string;
}

export const DeliveryInfoBadge: React.FC<DeliveryInfoBadgeProps> = ({
  deliveryType,
  preferredDeliveryTime,
  scheduledWindowStart,
  scheduledWindowEnd,
  estimatedDeliveryTime,
  actualDeliveryTime,
  className
}) => {
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryTypeInfo = () => {
    if (deliveryType === 'asap') {
      return {
        icon: <Zap className="h-3 w-3" />,
        label: 'Rapide',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        description: 'Livraison rapide'
      };
    } else {
      return {
        icon: <Calendar className="h-3 w-3" />,
        label: 'Programmée',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Livraison programmée'
      };
    }
  };

  const deliveryInfo = getDeliveryTypeInfo();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Badge principal du type de livraison */}
      <Badge 
        variant="outline" 
        className={cn("w-fit flex items-center gap-1", deliveryInfo.color)}
      >
        {deliveryInfo.icon}
        {deliveryInfo.label}
      </Badge>

      {/* Informations détaillées */}
      <div className="text-xs text-gray-600 space-y-1">
        {deliveryType === 'asap' ? (
          <>
            {estimatedDeliveryTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Livraison estimée: {formatTime(estimatedDeliveryTime)}</span>
              </div>
            )}
            {actualDeliveryTime && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Livré à: {formatTime(actualDeliveryTime)}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {preferredDeliveryTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Heure préférée: {formatTime(preferredDeliveryTime)}</span>
              </div>
            )}
            {scheduledWindowStart && scheduledWindowEnd && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Fenêtre: {formatTime(scheduledWindowStart)} - {formatTime(scheduledWindowEnd)}
                </span>
              </div>
            )}
            {estimatedDeliveryTime && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Livraison estimée: {formatDate(estimatedDeliveryTime)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 