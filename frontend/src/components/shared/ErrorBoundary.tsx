import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ErrorHandler, AppError } from '../../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  appError: AppError | null;
}

class ErrorBoundary extends Component<Props, State> {
  private prevResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, appError: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const appError = ErrorHandler.createError(
      'REACT_ERROR_BOUNDARY',
      error.message,
      { error, errorInfo }
    );
    
    this.setState({ appError });
    ErrorHandler.logError(appError);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(appError);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;
    
    // Reset error if resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, idx) => this.prevResetKeys[idx] !== key
      );
      
      if (hasResetKeyChanged) {
        this.handleRetry();
      }
    }
    
    this.prevResetKeys = resetKeys || [];
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, appError: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.appError?.message || 
                          this.state.error?.message || 
                          'An unexpected error occurred';

      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          {__DEV__ && this.state.error && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>{this.state.error.stack}</Text>
            </View>
          )}
        </View>
      );
    }

    // Wrap in isolation container if requested
    if (this.props.isolate) {
      return (
        <View style={styles.isolationContainer}>
          {this.props.children}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  isolationContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F9FA',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    maxWidth: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
});

// Higher-order component to wrap components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;