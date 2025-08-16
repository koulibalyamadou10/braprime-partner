interface DriverCredentialsProps {
    email: string;
    password: string;
    driverName: string;
    businessName: string;
}

export const DriverCredentials = ({ email, password, driverName, businessName }: DriverCredentialsProps) => {
    return (
        <div style={{ 
            fontFamily: 'Arial, sans-serif', 
            maxWidth: '600px', 
            margin: '0 auto', 
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
            {/* Header avec logo */}
            <div style={{ 
                textAlign: 'center', 
                borderBottom: '2px solid #f0f0f0', 
                paddingBottom: '20px',
                marginBottom: '30px'
            }}>
                <h1 style={{ 
                    color: '#2563eb', 
                    margin: '0', 
                    fontSize: '28px',
                    fontWeight: 'bold'
                }}>
                    🚗 BraPrime
                </h1>
                <p style={{ 
                    color: '#6b7280', 
                    margin: '5px 0 0 0', 
                    fontSize: '16px'
                }}>
                    Plateforme de Livraison
                </p>
            </div>

            {/* Message de bienvenue */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ 
                    color: '#1f2937', 
                    fontSize: '24px', 
                    marginBottom: '15px',
                    fontWeight: '600'
                }}>
                    Bonjour {driverName} ! 👋
                </h2>
                <p style={{ 
                    color: '#374151', 
                    fontSize: '16px', 
                    lineHeight: '1.6',
                    marginBottom: '15px'
                }}>
                    Félicitations ! Votre compte chauffeur a été créé avec succès sur la plateforme BraPrime. 
                    Vous êtes maintenant partenaire de <strong>{businessName}</strong> et pouvez commencer 
                    à recevoir des missions de livraison.
                </p>
            </div>

            {/* Section des identifiants */}
            <div style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '25px',
                marginBottom: '30px'
            }}>
                <h3 style={{ 
                    color: '#1f2937', 
                    fontSize: '20px', 
                    marginBottom: '20px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    🔐 Vos Identifiants de Connexion
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                        display: 'block', 
                        color: '#374151', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        fontSize: '14px'
                    }}>
                        Adresse Email :
                    </label>
                    <div style={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '12px',
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#1f2937',
                        fontWeight: '500'
                    }}>
                        {email}
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                        display: 'block', 
                        color: '#374151', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        fontSize: '14px'
                    }}>
                        Mot de Passe Temporaire :
                    </label>
                    <div style={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '12px',
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#dc2626',
                        fontWeight: '600',
                        letterSpacing: '1px'
                    }}>
                        {password}
                    </div>
                </div>

                <div style={{ 
                    backgroundColor: '#fef3c7', 
                    border: '1px solid #f59e0b',
                    borderRadius: '6px',
                    padding: '15px',
                    marginTop: '20px'
                }}>
                    <p style={{ 
                        color: '#92400e', 
                        margin: '0', 
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        ⚠️ <strong>Important :</strong> Ce mot de passe est temporaire. 
                        Changez-le dès votre première connexion pour des raisons de sécurité.
                    </p>
                </div>
            </div>

            {/* Instructions de connexion */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                    color: '#1f2937', 
                    fontSize: '20px', 
                    marginBottom: '20px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    🚀 Comment Commencer ?
                </h3>
                
                <div style={{ 
                    backgroundColor: '#f0f9ff', 
                    border: '1px solid #0ea5e9',
                    borderRadius: '8px',
                    padding: '20px'
                }}>
                    <ol style={{ 
                        color: '#0c4a6e', 
                        fontSize: '16px', 
                        lineHeight: '1.8',
                        margin: '0',
                        paddingLeft: '20px'
                    }}>
                        <li style={{ marginBottom: '10px' }}>
                            <strong>Connectez-vous</strong> à votre compte sur l'application BraPrime
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <strong>Changez votre mot de passe</strong> dans les paramètres de votre profil
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <strong>Complétez votre profil</strong> avec vos informations personnelles
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <strong>Activez votre disponibilité</strong> pour recevoir des missions
                        </li>
                        <li>
                            <strong>Commencez à livrer</strong> et gagnez de l'argent !
                        </li>
                    </ol>
                </div>
            </div>

            {/* Conseils de sécurité */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                    color: '#1f2937', 
                    fontSize: '20px', 
                    marginBottom: '20px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    🛡️ Conseils de Sécurité
                </h3>
                
                <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '20px'
                }}>
                    <ul style={{ 
                        color: '#991b1b', 
                        fontSize: '16px', 
                        lineHeight: '1.6',
                        margin: '0',
                        paddingLeft: '20px'
                    }}>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>Ne partagez jamais</strong> vos identifiants avec qui que ce soit
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>Utilisez un mot de passe fort</strong> avec des lettres, chiffres et symboles
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>Déconnectez-vous</strong> après chaque utilisation de l'application
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>Signalez immédiatement</strong> toute activité suspecte
                        </li>
                        <li>
                            <strong>Gardez vos informations personnelles</strong> à jour et sécurisées
                        </li>
                    </ul>
                </div>
            </div>

            {/* Support et contact */}
            <div style={{ 
                backgroundColor: '#f9fafb', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h4 style={{ 
                    color: '#374151', 
                    fontSize: '18px', 
                    marginBottom: '15px',
                    fontWeight: '600'
                }}>
                    Besoin d'Aide ? 🤝
                </h4>
                <p style={{ 
                    color: '#6b7280', 
                    fontSize: '16px', 
                    lineHeight: '1.6',
                    marginBottom: '15px'
                }}>
                    Notre équipe support est disponible 24h/24 pour vous accompagner 
                    dans votre parcours de chauffeur BraPrime.
                </p>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div>
                        <strong style={{ color: '#374151' }}>📧 Support :</strong>
                        <br />
                        <span style={{ color: '#6b7280' }}>support@braprime.com</span>
                    </div>
                    <div>
                        <strong style={{ color: '#374151' }}>📱 Téléphone :</strong>
                        <br />
                        <span style={{ color: '#6b7280' }}>+224 XXX XXX XXX</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ 
                textAlign: 'center', 
                borderTop: '2px solid #f0f0f0', 
                paddingTop: '20px',
                marginTop: '30px'
            }}>
                <p style={{ 
                    color: '#9ca3af', 
                    fontSize: '14px', 
                    margin: '0'
                }}>
                    © 2024 BraPrime. Tous droits réservés.
                </p>
                <p style={{ 
                    color: '#9ca3af', 
                    fontSize: '12px', 
                    margin: '5px 0 0 0'
                }}>
                    Ce message est généré automatiquement, merci de ne pas y répondre.
                </p>
            </div>
        </div>
    );
};

// Export par défaut pour la compatibilité
export default DriverCredentials;

// Exemple d'utilisation :
/*
import { DriverCredentials } from './DriverCredentials';

// Dans votre composant ou service d'email
const emailContent = (
    <DriverCredentials
        email="chauffeur@example.com"
        password="TempPass123!"
        driverName="Mamadou Diallo"
        businessName="Restaurant Le Gourmet"
    />
);

// Ou pour l'envoi par email
const emailHtml = ReactDOMServer.renderToString(emailContent);
*/