import React from 'react';
import ErrorScreen from './ErrorScreen';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message || 'Something went wrong' };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
    // Aquí puedes enviar errores a un servicio de logging (Sentry, Datadog, etc.)
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' });
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen message={this.state.message} onRetry={this.handleRetry} />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
