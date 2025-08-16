import React from 'react';

interface UserCredentialsProps {
  userName: string;
  userEmail: string;
  userPassword: string;
  businessName: string;
  businessLogo?: string;
  createdBy?: string;
  userRoles: string[];
}

export const UserCredentials: React.FC<UserCredentialsProps> = ({
  userName,
  userEmail,
  userPassword,
  businessName,
  createdBy,
  userRoles
}) => {
  const formatRoles = (roles: string[]) => {
    const roleLabels: { [key: string]: string } = {
      admin: 'Administrateur',
      commandes: 'Gestion des Commandes',
      menu: 'Gestion du Menu',
      reservations: 'Gestion des Réservations',
      livreurs: 'Gestion des Livreurs',
      revenu: 'Suivi des Revenus',
      user: 'Gestion des Utilisateurs',
      facturation: 'Gestion de la Facturation'
    };
    
    return roles.map(role => roleLabels[role] || role).join(', ');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa' }}>
      {/* Header avec logo */}
      <div style={{ backgroundColor: '#ffffff', padding: '30px', textAlign: 'center', borderBottom: '3px solid #3b82f6' }}>
        <h1 style={{ color: '#1f2937', margin: '0', fontSize: '28px', fontWeight: 'bold' }}>
          {businessName}
        </h1>
        <p style={{ color: '#6b7280', margin: '10px 0 0 0', fontSize: '16px' }}>
          Plateforme de Gestion Partenaire
        </p>
      </div>

      {/* Contenu principal */}
      <div style={{ backgroundColor: '#ffffff', padding: '40px 30px' }}>
        {/* Titre principal */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            backgroundColor: '#10b981', 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px auto'
          }}>
            <span style={{ color: '#ffffff', fontSize: '40px' }}>✓</span>
          </div>
          <h2 style={{ color: '#1f2937', margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
            Compte Utilisateur Interne Créé avec Succès !
          </h2>
          <p style={{ color: '#6b7280', margin: '0', fontSize: '16px' }}>
            Bienvenue dans l'équipe de {businessName}
          </p>
        </div>

        {/* Informations de l'utilisateur */}
        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '25px', 
          borderRadius: '12px', 
          marginBottom: '30px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#1f2937', margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
            👤 Profil Utilisateur
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p style={{ color: '#6b7280', margin: '0 0 5px 0', fontSize: '14px', fontWeight: '500' }}>
                Nom Complet
              </p>
              <p style={{ color: '#1f2937', margin: '0', fontSize: '16px', fontWeight: '600' }}>
                {userName}
              </p>
            </div>
            <div>
              <p style={{ color: '#6b7280', margin: '0 0 5px 0', fontSize: '14px', fontWeight: '500' }}>
                Rôles Attribués
              </p>
              <p style={{ color: '#1f2937', margin: '0', fontSize: '16px', fontWeight: '600' }}>
                {formatRoles(userRoles)}
              </p>
            </div>
            {createdBy && (
              <div>
                <p style={{ color: '#6b7280', margin: '0 0 5px 0', fontSize: '14px', fontWeight: '500' }}>
                  Créé par
                </p>
                <p style={{ color: '#1f2937', margin: '0', fontSize: '16px', fontWeight: '600' }}>
                  {createdBy}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Identifiants de connexion */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#1f2937', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
            🔐 Identifiants de Connexion
          </h3>
          
          {/* Email */}
          <div style={{ 
            backgroundColor: '#eff6ff', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '15px',
            border: '1px solid #dbeafe'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ 
                backgroundColor: '#3b82f6', 
                color: '#ffffff', 
                padding: '6px 10px', 
                borderRadius: '6px', 
                fontSize: '12px', 
                fontWeight: '600',
                marginRight: '12px'
              }}>
                📧 EMAIL
              </span>
              <span style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                {userEmail}
              </span>
            </div>
            <p style={{ color: '#6b7280', margin: '0', fontSize: '14px' }}>
              Utilisez cette adresse email pour vous connecter à la plateforme
            </p>
          </div>

          {/* Mot de passe */}
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ 
                backgroundColor: '#10b981', 
                color: '#ffffff', 
                padding: '6px 10px', 
                borderRadius: '6px', 
                fontSize: '12px', 
                fontWeight: '600',
                marginRight: '12px'
              }}>
                🔒 MOT DE PASSE
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: '18px', 
                fontWeight: '700', 
                fontFamily: 'monospace',
                backgroundColor: '#ffffff',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '2px solid #10b981'
              }}>
                {userPassword}
              </span>
            </div>
            <p style={{ color: '#6b7280', margin: '0', fontSize: '14px' }}>
              <strong>Important :</strong> Changez ce mot de passe lors de votre première connexion
            </p>
          </div>
        </div>

                 {/* Instructions de connexion */}
         <div style={{ 
           backgroundColor: '#fef3c7', 
           padding: '25px', 
           borderRadius: '12px', 
           marginBottom: '30px',
           border: '1px solid #f59e0b'
         }}>
          <h3 style={{ color: '#92400e', margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
            🚀 Première Connexion
          </h3>
          <ol style={{ color: '#92400e', margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
            <li>Rendez-vous sur la plateforme de {businessName}</li>
            <li>Cliquez sur "Se connecter" ou "Connexion"</li>
            <li>Entrez votre email : <strong>{userEmail}</strong></li>
            <li>Entrez votre mot de passe temporaire : <strong>{userPassword}</strong></li>
            <li>Une fois connecté, changez immédiatement votre mot de passe</li>
            <li>Configurez votre profil et vos préférences</li>
          </ol>
        </div>

                 {/* Avertissements de sécurité */}
         <div style={{ 
           backgroundColor: '#fef2f2', 
           padding: '25px', 
           borderRadius: '12px', 
           marginBottom: '30px',
           border: '1px solid #fecaca'
         }}>
          <h3 style={{ color: '#dc2626', margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
            ⚠️ Avertissements de Sécurité
          </h3>
          <div style={{ color: '#dc2626', fontSize: '14px', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>🔒 Sécurité des Identifiants :</strong>
            </p>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Ne partagez JAMAIS vos identifiants de connexion</li>
              <li>Changez votre mot de passe immédiatement après la première connexion</li>
              <li>Utilisez un mot de passe fort et unique</li>
              <li>Ne sauvegardez pas vos identifiants sur des appareils partagés</li>
              <li>Déconnectez-vous après chaque session</li>
            </ul>
            
            <p style={{ margin: '15px 0 0 0', padding: '15px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #fca5a5' }}>
              <strong>🚨 URGENT :</strong> Ces identifiants ne seront plus visibles après fermeture de cet email. 
              Sauvegardez-les temporairement dans un endroit sécurisé jusqu'à votre première connexion.
            </p>
          </div>
        </div>

                 {/* Support et contact */}
         <div style={{ 
           backgroundColor: '#f0f9ff', 
           padding: '25px', 
           borderRadius: '12px',
           border: '1px solid #bae6fd'
         }}>
          <h3 style={{ color: '#0369a1', margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
            📞 Support et Assistance
          </h3>
          <p style={{ color: '#0369a1', margin: '0 0 15px 0', fontSize: '14px', lineHeight: '1.6' }}>
            Si vous rencontrez des difficultés lors de votre connexion ou si vous avez des questions :
          </p>
          <ul style={{ color: '#0369a1', margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
            <li>Contactez votre administrateur système</li>
            <li>Consultez la documentation de la plateforme</li>
            <li>Utilisez le système de support intégré</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        backgroundColor: '#1f2937', 
        padding: '25px 30px', 
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
          Cet email a été généré automatiquement par la plateforme {businessName}
        </p>
        <p style={{ margin: '0', fontSize: '12px' }}>
          © {new Date().getFullYear()} {businessName} - Tous droits réservés
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
          Ne répondez pas à cet email. Pour toute question, contactez votre administrateur.
        </p>
      </div>
    </div>
  );
};

export default UserCredentials;