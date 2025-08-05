
// Types pour les emails
export interface EmailRequest {
  request_id: string
  request_type: 'partner' | 'driver'
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
}

export interface AdminNotificationRequest {
  request_id: string
  request_type: 'partner' | 'driver'
  user_name: string
  user_email: string
  user_phone: string
  vehicle_type?: string
  vehicle_plate?: string
  notes?: string
  submitted_at: string
  admin_dashboard_url: string
}

export interface RequestApprovalRequest {
  request_id: string
  request_type: 'partner' | 'driver'
  user_name: string
  user_email: string
  user_phone: string
  business_name?: string
  selected_plan_name?: string
  selected_plan_price?: number
  login_email: string
  login_password: string
  dashboard_url: string
  approved_at: string
  approved_by: string
}

export interface AccountCredentialsRequest {
  account_type: 'partner' | 'driver'
  user_name: string
  user_email: string
  login_email: string
  login_password: string
  business_name?: string
  business_id?: string
  selected_plan_name?: string
  selected_plan_price?: number
  dashboard_url: string
  account_created_at: string
  created_by: string
  support_email: string
  support_phone: string
}

export interface PasswordResetRequest {
  user_email: string
  user_name: string
  user_type: 'customer' | 'partner' | 'driver' | 'admin'
  reset_token: string
  reset_url: string
  expires_at: string
}

export interface OrderConfirmationRequest {
  order_id: string
  user_name: string
  user_email: string
  business_name: string
  business_address: string
  order_items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  delivery_fee: number
  tax: number
  total: number
  delivery_address: string
  estimated_delivery: string
  order_number: string
  created_at: string
}

export interface OrderStatusUpdateRequest {
  order_id: string
  user_name: string
  user_email: string
  business_name: string
  order_number: string
  old_status: string
  new_status: string
  status_label: string
  estimated_delivery?: string
  driver_name?: string
  driver_phone?: string
  updated_at: string
}

export interface RequestRejectionRequest {
  request_id: string
  request_type: 'partner' | 'driver'
  user_name: string
  user_email: string
  business_name?: string
  rejection_reason: string
  admin_notes?: string
  rejected_at: string
  rejected_by: string
  contact_email: string
  contact_phone: string
}

export interface PaymentReminderRequest {
  partner_id: string
  partner_name: string
  partner_email: string
  business_name: string
  subscription_id: string
  plan_name: string
  plan_price: number
  days_remaining: number
  payment_url: string
  reminder_type: 'first' | 'final'
}

export interface EmailResponse {
  success: boolean
  message: string
  email_id?: string
  sent_at?: string
  [key: string]: any
}

export class EmailService {
  private static API_BASE_URL = import.meta.env.VITE_API_URL || 'https://braprime-backend.vercel.app'

  /**
   * Envoyer un email de confirmation de demande
   */
  static async sendRequestConfirmation(data: EmailRequest): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/request-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email de confirmation')
      }

      return result
    } catch (error) {
      console.error('Erreur EmailService.sendRequestConfirmation:', error)
      throw error
    }
  }

  /**
   * Envoyer une notification admin
   */
  static async sendAdminNotification(data: AdminNotificationRequest): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/admin-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de la notification admin')
      }

      return result
    } catch (error) {
      console.error('Erreur EmailService.sendAdminNotification:', error)
      throw error
    }
  }

  /**
   * Envoyer un email d'approbation de demande
   */
  static async sendRequestApproval(data: RequestApprovalRequest): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/request-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email d\'approbation')
      }

      return result
    } catch (error) {
      console.error('Erreur EmailService.sendRequestApproval:', error)
      throw error
    }
  }

  /**
   * Envoyer un email avec les identifiants de connexion
   */
  static async sendAccountCredentials(data: AccountCredentialsRequest): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/account-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi des identifiants')
      }

      return result
    } catch (error) {
      console.error('Erreur EmailService.sendAccountCredentials:', error)
      throw error
    }
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  static async sendPasswordReset(data: PasswordResetRequest): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email de réinitialisation')
      }

      return result
    } catch (error) {
      console.error('Erreur EmailService.sendPasswordReset:', error)
      throw error
    }
  }

  /**
   * Envoyer un email de confirmation de commande
   */
  static async sendOrderConfirmation(data: OrderConfirmationRequest): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/order-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email de confirmation de commande')
      }

      return result
    } catch (error) {
      console.error('Erreur EmailService.sendOrderConfirmation:', error)
      throw error
    }
  }

  /**
   * Envoyer un email de mise à jour de statut de commande
   */
  static async sendOrderStatusUpdate(data: OrderStatusUpdateRequest): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/order-status-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email de mise à jour de statut')
      }

      return result
    } catch (error) {
      console.error('Erreur EmailService.sendOrderStatusUpdate:', error)
      throw error
    }
  }

  /**
   * Envoyer un email de rejet de demande
   */
  static async sendRequestRejection(data: RequestRejectionRequest): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/request-rejection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email de rejet')
      }

      return result
    } catch (error) {
      console.error('Erreur EmailService.sendRequestRejection:', error)
      throw error
    }
  }

  /**
   * Envoyer un email de rappel de paiement
   */
  static async sendPaymentReminder(data: PaymentReminderRequest): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/emails/payment-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi du rappel de paiement')
      }

      return result
    } catch (error) {
      console.error('Erreur EmailService.sendPaymentReminder:', error)
      throw error
    }
  }

  /**
   * Méthode utilitaire pour envoyer un email de confirmation de demande
   */
  static async sendRequestConfirmationEmail(requestData: any): Promise<EmailResponse> {
    const emailData: EmailRequest = {
      request_id: requestData.id,
      request_type: requestData.type,
      user_name: requestData.user_name,
      user_email: requestData.user_email,
      user_phone: requestData.user_phone,
      business_name: requestData.business_name,
      business_type: requestData.business_type,
      business_address: requestData.business_address,
      selected_plan_name: requestData.selected_plan_name,
      selected_plan_price: requestData.selected_plan_price,
      notes: requestData.notes,
      submitted_at: new Date().toISOString()
    }

    return this.sendRequestConfirmation(emailData)
  }

  /**
   * Méthode utilitaire pour envoyer une notification admin
   */
  static async sendAdminNotificationEmail(requestData: any): Promise<EmailResponse> {
    const emailData: AdminNotificationRequest = {
      request_id: requestData.id,
      request_type: requestData.type,
      user_name: requestData.user_name,
      user_email: requestData.user_email,
      user_phone: requestData.user_phone,
      vehicle_type: requestData.vehicle_type,
      vehicle_plate: requestData.vehicle_plate,
      notes: requestData.notes,
      submitted_at: new Date().toISOString(),
      admin_dashboard_url: `${window.location.origin}/admin/requests`
    }

    return this.sendAdminNotification(emailData)
  }

  /**
   * Méthode utilitaire pour envoyer un email de confirmation de commande
   */
  static async sendOrderConfirmationEmail(orderData: any, userData: any): Promise<EmailResponse> {
    const emailData: OrderConfirmationRequest = {
      order_id: orderData.id,
      user_name: userData.name,
      user_email: userData.email,
      business_name: orderData.business_name,
      business_address: orderData.business_address,
      order_items: orderData.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: orderData.subtotal,
      delivery_fee: orderData.delivery_fee,
      tax: orderData.tax,
      total: orderData.total,
      delivery_address: orderData.delivery_address,
      estimated_delivery: orderData.estimated_delivery,
      order_number: orderData.order_number,
      created_at: new Date().toISOString()
    }

    return this.sendOrderConfirmation(emailData)
  }

  /**
   * Méthode utilitaire pour envoyer un email de réinitialisation de mot de passe
   */
  static async sendPasswordResetEmail(userData: any, resetToken: string): Promise<EmailResponse> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 heures

    const emailData: PasswordResetRequest = {
      user_email: userData.email,
      user_name: userData.name,
      user_type: userData.role,
      reset_token: resetToken,
      reset_url: resetUrl,
      expires_at: expiresAt
    }

    return this.sendPasswordReset(emailData)
  }

  /**
   * Méthode utilitaire pour envoyer les emails de demande de partenariat
   */
  static async sendPartnerRequestEmails(requestData: {
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
  }): Promise<EmailResponse> {
    // Validation des champs requis
    if (!requestData.request_id || !requestData.user_name || !requestData.user_email || !requestData.user_phone) {
      throw new Error('Champs manquants: request_id, user_name, user_email, user_phone sont requis')
    }

    // Envoyer email de confirmation au demandeur
    const confirmationResult = await this.sendRequestConfirmation({
      request_id: requestData.request_id,
      request_type: 'partner',
      user_name: requestData.user_name,
      user_email: requestData.user_email,
      user_phone: requestData.user_phone,
      business_name: requestData.business_name,
      business_type: requestData.business_type,
      business_address: requestData.business_address,
      selected_plan_name: requestData.selected_plan_name,
      selected_plan_price: requestData.selected_plan_price,
      notes: requestData.notes,
      submitted_at: requestData.submitted_at
    })

    // Envoyer notification admin
    const adminResult = await this.sendAdminNotification({
      request_id: requestData.request_id,
      request_type: 'partner',
      user_name: requestData.user_name,
      user_email: requestData.user_email,
      user_phone: requestData.user_phone,
      business_name: requestData.business_name,
      business_type: requestData.business_type,
      business_address: requestData.business_address,
      notes: requestData.notes,
      submitted_at: requestData.submitted_at,
      admin_dashboard_url: `${window.location.origin}/admin/requests`
    })

    return confirmationResult
  }

  /**
   * Méthode utilitaire pour envoyer les emails de demande de chauffeur
   */
  static async sendDriverRequestEmails(requestData: {
    request_id: string
    user_name: string
    user_email: string
    user_phone: string
    vehicle_type?: string
    vehicle_plate?: string
    notes?: string
    submitted_at: string
  }): Promise<EmailResponse> {
    // Validation des champs requis
    if (!requestData.request_id || !requestData.user_name || !requestData.user_email || !requestData.user_phone) {
      throw new Error('Champs manquants: request_id, user_name, user_email, user_phone sont requis')
    }

    // Envoyer email de confirmation au demandeur
    const confirmationResult = await this.sendRequestConfirmation({
      request_id: requestData.request_id,
      request_type: 'driver',
      user_name: requestData.user_name,
      user_email: requestData.user_email,
      user_phone: requestData.user_phone,
      notes: requestData.notes,
      submitted_at: requestData.submitted_at
    })

    // Envoyer notification admin
    const adminResult = await this.sendAdminNotification({
      request_id: requestData.request_id,
      request_type: 'driver',
      user_name: requestData.user_name,
      user_email: requestData.user_email,
      user_phone: requestData.user_phone,
      vehicle_type: requestData.vehicle_type,
      vehicle_plate: requestData.vehicle_plate,
      notes: requestData.notes,
      submitted_at: requestData.submitted_at,
      admin_dashboard_url: `${window.location.origin}/admin/requests`
    })

    return confirmationResult
  }
} 