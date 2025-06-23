// Configuration des variables d'environnement
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here',
  },
  app: {
    name: 'BraPrime',
    version: '1.0.0',
  }
}

// Vérification des variables d'environnement requises
export const validateEnv = () => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName]
  )

  if (missingVars.length > 0) {
    console.warn(
      'Variables d\'environnement manquantes:',
      missingVars.join(', ')
    )
    console.warn(
      'Créez un fichier .env.local avec ces variables pour une configuration complète'
    )
  }
} 