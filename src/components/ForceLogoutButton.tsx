import React from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function ForceLogoutButton() {
  const handleForceLogout = async () => {
    try {
      // Déconnexion via Supabase
      await supabase.auth.signOut()
      
      // Nettoyer le localStorage et sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Rediriger vers la page d'accueil
      window.location.href = '/'
      
      toast.success('Déconnexion forcée réussie')
    } catch (error) {
      console.error('Erreur lors de la déconnexion forcée:', error)
      
      // Fallback : nettoyer manuellement et recharger
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  return (
    <Button 
      variant="destructive" 
      size="sm"
      onClick={handleForceLogout}
      className="flex items-center gap-2"
    >
      <AlertTriangle className="h-4 w-4" />
      <LogOut className="h-4 w-4" />
      Déconnexion Forcée
    </Button>
  )
} 