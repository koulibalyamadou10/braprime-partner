import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import { validateEnv } from './config/env'
import { CurrencyRoleProvider } from './contexts/UseRoleContext'

// Valider les variables d'environnement au démarrage
validateEnv()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CurrencyRoleProvider>
      <App />
    </CurrencyRoleProvider>
  </React.StrictMode>,
)
