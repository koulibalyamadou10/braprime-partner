import { useQuery } from '@tanstack/react-query';
import { BillingService, BillingStats, BillingInvoice, BillingPayment } from '@/lib/services/billing';

export const useBillingStats = (businessId: number, period: 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: ['billing-stats', businessId, period],
    queryFn: () => BillingService.getBillingStats(businessId, period),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBusinessInvoices = (businessId: number) => {
  return useQuery({
    queryKey: ['business-invoices', businessId],
    queryFn: () => BillingService.getBusinessInvoices(businessId),
    enabled: !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useBusinessPayments = (businessId: number) => {
  return useQuery({
    queryKey: ['business-payments', businessId],
    queryFn: () => BillingService.getBusinessPayments(businessId),
    enabled: !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
