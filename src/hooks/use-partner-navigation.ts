import { getPartnerNavItems } from '@/components/dashboard/DashboardLayout';
import { isInternalUser } from '@/hooks/use-internal-users';
import { useEffect, useMemo, useState } from 'react';

interface Business {
  id: number;
  business_type_id: number;
  name: string;
  business_type?: string;
}

export const usePartnerNavigation = () => {
  const [businessTypeId, setBusinessTypeId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  
  // Récupérer le businessTypeId en utilisant la même méthode que PartnerColis
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 [usePartnerNavigation] Chargement des données business...');
        
        const {
          isInternal, 
          data, 
          user, 
          businessId: businessIdOrigin,
          businessData: businessDataOrigin
        } = await isInternalUser();
        
        console.log('🔍 [usePartnerNavigation] Résultats isInternalUser:', {
          isInternal,
          businessId: businessIdOrigin,
          businessData: businessDataOrigin
        });
        
        if (businessIdOrigin !== null && businessDataOrigin) {
          console.log('✅ [usePartnerNavigation] Business trouvé:', {
            id: businessDataOrigin.id,
            name: businessDataOrigin.name,
            business_type_id: businessDataOrigin.business_type_id
          });
          
          setBusiness(businessDataOrigin as Business);
          setBusinessTypeId(businessDataOrigin.business_type_id);
          
          console.log('🎯 [usePartnerNavigation] businessTypeId défini:', businessDataOrigin.business_type_id);
        } else {
          console.log('❌ [usePartnerNavigation] Aucun business associé à votre compte partenaire');
        }
      } catch (err) {
        console.error('❌ [usePartnerNavigation] Erreur lors du chargement des données business:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBusinessData();
  }, []);
  
  const navItems = useMemo(() => {
    return getPartnerNavItems(businessTypeId);
  }, [businessTypeId]);
  
  return {
    navItems,
    businessTypeId,
    business,
    isLoading
  };
};
