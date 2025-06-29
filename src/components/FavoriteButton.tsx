import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  showText?: boolean;
  disabled?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  isLoading = false,
  size = 'md',
  variant = 'ghost',
  className,
  showText = false,
  disabled = false
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      variant={variant}
      size={showText ? 'default' : 'icon'}
      onClick={onToggle}
      disabled={isLoading || disabled}
      className={cn(
        'transition-all duration-200',
        isFavorite && 'text-red-500 hover:text-red-600',
        !isFavorite && 'text-gray-500 hover:text-red-500',
        showText && sizeClasses[size],
        !showText && 'rounded-full',
        className
      )}
    >
      {isLoading ? (
        <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
      ) : (
        <>
          {isFavorite ? (
            <Heart className={cn('fill-current', iconSizes[size])} />
          ) : (
            <Heart className={iconSizes[size]} />
          )}
          {showText && (
            <span className="ml-2">
              {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </span>
          )}
        </>
      )}
    </Button>
  );
};

// Composant spécialisé pour les businesses
export const BusinessFavoriteButton: React.FC<{
  businessId: number;
  isFavorite: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ businessId, isFavorite, onToggle, isLoading, size = 'md', className }) => {
  return (
    <FavoriteButton
      isFavorite={isFavorite}
      onToggle={onToggle}
      isLoading={isLoading}
      size={size}
      className={cn(
        'absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white',
        className
      )}
    />
  );
};

// Composant spécialisé pour les menu items
export const MenuItemFavoriteButton: React.FC<{
  menuItemId: number;
  isFavorite: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ menuItemId, isFavorite, onToggle, isLoading, size = 'md', className }) => {
  return (
    <FavoriteButton
      isFavorite={isFavorite}
      onToggle={onToggle}
      isLoading={isLoading}
      size={size}
      className={cn(
        'absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white',
        className
      )}
    />
  );
}; 