import { useState, useEffect } from 'react';
import { BusinessService, Business } from '@/lib/services/business';

export const useRestaurantsReservations = () => {
  const [restaurants, setRestaurants] = useState<Business[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les restaurants depuis Supabase
  const loadRestaurants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await BusinessService.getRestaurantsForReservations();
      
      if (error) {
        setError(error);
        setRestaurants([]);
        setFilteredRestaurants([]);
      } else {
        setRestaurants(data);
        setFilteredRestaurants(data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des restaurants');
      setRestaurants([]);
      setFilteredRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les restaurants
  const filterRestaurants = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFilteredRestaurants(restaurants);
      return;
    }

    const filtered = restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredRestaurants(filtered);
  };

  // Charger les restaurants au montage du composant
  useEffect(() => {
    loadRestaurants();
  }, []);

  return {
    restaurants,
    filteredRestaurants,
    isLoading,
    error,
    loadRestaurants,
    filterRestaurants
  };
}; 