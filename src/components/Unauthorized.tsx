import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, Lock, AlertTriangle, Home, ArrowLeft, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UnauthorizedProps {
  title?: string;
  message?: string;
  description?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showLoginButton?: boolean;
  customActions?: React.ReactNode;
  severity?: 'info' | 'warning' | 'error';
}

export default function Unauthorized({
  title = "Accès Non Autorisé",
  message = "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
  description = "Cette section nécessite des droits d'accès spécifiques. Veuillez contacter votre administrateur ou vous connecter avec un compte disposant des bonnes permissions.",
  showHomeButton = true,
  showBackButton = true,
  showLoginButton = true,
  customActions,
  severity = 'warning'
}: UnauthorizedProps) {
  const getSeverityStyles = () => {
    switch (severity) {
      case 'error':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: Lock,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'info':
      default:
        return {
          icon: Shield,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
    }
  };

  const styles = getSeverityStyles();
  const IconComponent = styles.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className={`${styles.bgColor} ${styles.borderColor} border-2 shadow-lg`}>
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
              <IconComponent className={`h-8 w-8 ${styles.iconColor}`} />
            </div>
            <CardTitle className={`text-2xl font-bold ${styles.textColor}`}>
              {title}
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              {message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Description détaillée */}
            <div className="text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Actions par défaut */}
            {!customActions && (
              <div className="flex flex-col gap-3">
                {showLoginButton && (
                  <Button asChild className="w-full" variant="default">
                    <Link to="/login" className="flex items-center justify-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Se connecter
                    </Link>
                  </Button>
                )}
                
                {showHomeButton && (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/" className="flex items-center justify-center gap-2">
                      <Home className="h-4 w-4" />
                      Retour à l'accueil
                    </Link>
                  </Button>
                )}
                
                {showBackButton && (
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => window.history.back()}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour en arrière
                  </Button>
                )}
              </div>
            )}

            {/* Actions personnalisées */}
            {customActions && (
              <div className="space-y-3">
                {customActions}
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Besoin d'aide ?
                </p>
                <div className="flex justify-center gap-4 text-xs">
                  <Link 
                    to="/contact" 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Contact
                  </Link>
                  <Link 
                    to="/support" 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Support
                  </Link>
                  <Link 
                    to="/faq" 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    FAQ
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}