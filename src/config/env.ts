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

// Configuration des variables d'environnement pour l'API email
export const EMAIL_CONFIG = {
  // URL de l'API backend
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://braprime-backend.vercel.app',
  
  // Emails de support
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@bradelivery.com',
  SUPPORT_PHONE: import.meta.env.VITE_SUPPORT_PHONE || '+224 621 00 00 00',
  
  // Emails admin
  ADMIN_EMAILS: import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [
    'admin@bradelivery.com',
    'manager@bradelivery.com'
  ],
  
  // URLs de l'application
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'https://bradelivery.com',
  PARTNER_DASHBOARD_URL: import.meta.env.VITE_PARTNER_DASHBOARD_URL || 'https://bradelivery.com/partner-dashboard',
  DRIVER_DASHBOARD_URL: import.meta.env.VITE_DRIVER_DASHBOARD_URL || 'https://bradelivery.com/driver-dashboard',
  ADMIN_DASHBOARD_URL: import.meta.env.VITE_ADMIN_DASHBOARD_URL || 'https://bradelivery.com/admin-dashboard',
  
  // Configuration Resend (si utilisé directement)
  RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY,
  EMAIL_FROM: import.meta.env.VITE_EMAIL_FROM || 'noreply@bradelivery.com',
  EMAIL_FROM_NAME: import.meta.env.VITE_EMAIL_FROM_NAME || 'BraPrime',
} as const;

// Validation des variables d'environnement requises
export const validateEmailConfig = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_SUPPORT_EMAIL',
    'VITE_ADMIN_EMAILS'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Variables d\'environnement manquantes pour l\'API email:', missingVars);
    console.warn('Utilisation des valeurs par défaut');
  }
};

// Initialiser la validation au chargement
validateEmailConfig(); 