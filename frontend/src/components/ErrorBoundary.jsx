import React from 'react';
import ErrorScreen from './ErrorScreen';
import { getErrorMessageKey } from '../api/AppError';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, messageKey: null };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      messageKey: getErrorMessageKey(error, 'error.generic')
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
    // Aquí puedes enviar errores a un servicio de logging (Sentry, Datadog, etc.)
  }

  handleRetry = () => {
    this.setState({ hasError: false, messageKey: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          messageKey={this.state.messageKey}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
