import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

// Simple error content without hooks to avoid context issues
const ErrorBoundaryContent: React.FC<{
  error?: Error;
  errorInfo?: ErrorInfo;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
}> = ({ error, errorInfo, onReset, onReload, onGoHome }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Quelque chose s'est mal passé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Nous sommes désolés, mais quelque chose d'inattendu s'est produit. Veuillez essayer de rafraîchir la page.
          </p>

          {process.env.NODE_ENV === "development" && error && (
            <details className="bg-muted p-3 rounded-md">
              <summary className="cursor-pointer font-medium text-sm">
                Détails de l'erreur (Développement)
              </summary>
              <pre className="mt-2 text-xs overflow-auto">
                {error.toString()}
                {errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={onReset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>

            <Button onClick={onReload} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Recharger la page
            </Button>

            <Button onClick={onGoHome} variant="ghost" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorBoundaryContent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}
