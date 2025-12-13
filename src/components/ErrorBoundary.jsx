import React from 'react';
import { toast } from '@/hooks/use-toast';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
    
    // Mostrar toast com erro
    toast({
      variant: "destructive",
      title: "❌ Erro no Sistema",
      description: `${error.message || 'Erro desconhecido'}`,
    });
  }

  render() {
    if (this.state.hasError) {
      // Reset do erro após mostrar toast
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);
    }

    return this.props.children;
  }
}
