import { useToast } from '@/hooks/use-toast'
import { EmailService, type EmailResponse } from '@/lib/services/email'
import { useCallback, useState } from 'react'

export interface UseEmailServiceReturn {
  loading: boolean
  error: string | null
  sendRequestConfirmation: (data: any) => Promise<EmailResponse | null>
  sendAdminNotification: (data: any) => Promise<EmailResponse | null>
  sendRequestApproval: (data: any) => Promise<EmailResponse | null>
  sendAccountCredentials: (data: any) => Promise<EmailResponse | null>
  sendPasswordReset: (userData: any, resetToken: string) => Promise<EmailResponse | null>
  sendOrderConfirmation: (orderData: any, userData: any) => Promise<EmailResponse | null>
  sendOrderStatusUpdate: (orderData: any, userData: any, statusData: any) => Promise<EmailResponse | null>
  sendRequestRejection: (requestData: any, rejectionData: any) => Promise<EmailResponse | null>
  sendPaymentReminder: (partnerData: any, subscriptionData: any) => Promise<EmailResponse | null>
  sendPartnerRequestEmails: (requestData: {
    request_id: string
    user_name: string
    user_email: string
    user_phone: string
    business_name?: string
    business_type?: string
    business_address?: string
    selected_plan_name?: string
    selected_plan_price?: number
    notes?: string
    submitted_at: string
  }) => Promise<EmailResponse | null>
  sendDriverRequestEmails: (requestData: {
    request_id: string
    user_name: string
    user_email: string
    user_phone: string
    vehicle_type?: string
    vehicle_plate?: string
    notes?: string
    submitted_at: string
  }) => Promise<EmailResponse | null>
}

export function useEmailService(): UseEmailServiceReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleEmailSuccess = useCallback((message: string) => {
    toast({
      title: "Email envoyé",
      description: message,
    })
  }, [toast])

  const handleEmailError = useCallback((errorMessage: string) => {
    toast({
      title: "Erreur d'envoi",
      description: errorMessage,
      variant: "destructive",
    })
  }, [toast])

  const sendRequestConfirmation = useCallback(async (requestData: any): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await EmailService.sendRequestConfirmationEmail(requestData)
      handleEmailSuccess("Email de confirmation envoyé avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email de confirmation'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  const sendAdminNotification = useCallback(async (requestData: any): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await EmailService.sendAdminNotificationEmail(requestData)
      handleEmailSuccess("Notification admin envoyée avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la notification admin'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  const sendRequestApproval = useCallback(async (requestData: any): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await EmailService.sendRequestApproval(requestData)
      handleEmailSuccess("Email d'approbation envoyé avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email d\'approbation'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  const sendAccountCredentials = useCallback(async (requestData: any): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await EmailService.sendAccountCredentials(requestData)
      handleEmailSuccess("Email avec identifiants envoyé avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi des identifiants'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  const sendPasswordReset = useCallback(async (userData: any, resetToken: string): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await EmailService.sendPasswordResetEmail(userData, resetToken)
      handleEmailSuccess("Email de réinitialisation envoyé avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email de réinitialisation'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  const sendOrderConfirmation = useCallback(async (orderData: any, userData: any): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await EmailService.sendOrderConfirmationEmail(orderData, userData)
      handleEmailSuccess("Email de confirmation de commande envoyé avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email de confirmation de commande'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  const sendOrderStatusUpdate = useCallback(async (orderData: any, userData: any, statusData: any): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const emailData = {
        order_id: orderData.id,
        user_name: userData.name,
        user_email: userData.email,
        business_name: orderData.business_name,
        order_number: orderData.order_number,
        old_status: statusData.old_status,
        new_status: statusData.new_status,
        status_label: statusData.status_label,
        estimated_delivery: statusData.estimated_delivery,
        driver_name: statusData.driver_name,
        driver_phone: statusData.driver_phone,
        updated_at: new Date().toISOString()
      }

      const result = await EmailService.sendOrderStatusUpdate(emailData)
      handleEmailSuccess("Email de mise à jour de statut envoyé avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email de mise à jour de statut'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  const sendRequestRejection = useCallback(async (requestData: any, rejectionData: any): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const emailData = {
        request_id: requestData.id,
        request_type: requestData.type,
        user_name: requestData.user_name,
        user_email: requestData.user_email,
        business_name: requestData.business_name,
        rejection_reason: rejectionData.reason,
        admin_notes: rejectionData.admin_notes,
        rejected_at: new Date().toISOString(),
        rejected_by: rejectionData.rejected_by,
        contact_email: "support@bradelivery.com",
        contact_phone: "+224 621 00 00 00"
      }

      const result = await EmailService.sendRequestRejection(emailData)
      handleEmailSuccess("Email de rejet envoyé avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email de rejet'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  const sendPaymentReminder = useCallback(async (partnerData: any, subscriptionData: any): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const emailData = {
        partner_id: partnerData.id,
        partner_name: partnerData.name,
        partner_email: partnerData.email,
        business_name: partnerData.business_name,
        subscription_id: subscriptionData.id,
        plan_name: subscriptionData.plan_name,
        plan_price: subscriptionData.plan_price,
        days_remaining: subscriptionData.days_remaining,
        payment_url: `${window.location.origin}/partner-dashboard/settings/billing`,
        reminder_type: (subscriptionData.days_remaining <= 1 ? 'final' : 'first') as 'first' | 'final'
      }

      const result = await EmailService.sendPaymentReminder(emailData)
      handleEmailSuccess("Rappel de paiement envoyé avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi du rappel de paiement'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  const sendPartnerRequestEmails = useCallback(async (requestData: {
    request_id: string
    user_name: string
    user_email: string
    user_phone: string
    business_name?: string
    business_type?: string
    business_address?: string
    selected_plan_name?: string
    selected_plan_price?: number
    notes?: string
    submitted_at: string
  }): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await EmailService.sendPartnerRequestEmails(requestData)
      handleEmailSuccess("Email de demande de partenariat envoyé avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email de demande de partenariat'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  const sendDriverRequestEmails = useCallback(async (requestData: {
    request_id: string
    user_name: string
    user_email: string
    user_phone: string
    vehicle_type?: string
    vehicle_plate?: string
    notes?: string
    submitted_at: string
  }): Promise<EmailResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await EmailService.sendDriverRequestEmails(requestData)
      handleEmailSuccess("Email de demande de chauffeur envoyé avec succès")
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email de demande de chauffeur'
      setError(errorMessage)
      handleEmailError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleEmailSuccess, handleEmailError])

  return {
    loading,
    error,
    sendRequestConfirmation,
    sendAdminNotification,
    sendRequestApproval,
    sendAccountCredentials,
    sendPasswordReset,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendRequestRejection,
    sendPaymentReminder,
    sendPartnerRequestEmails,
    sendDriverRequestEmails
  }
} 