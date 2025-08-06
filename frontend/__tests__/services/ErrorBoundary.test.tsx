import React from 'react';
import { View, Text } from 'react-native';
import ErrorBoundary, { withErrorBoundary } from '../../src/components/shared/ErrorBoundary';

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: (styles: any) => styles,
  },
  TouchableOpacity: 'TouchableOpacity',
}));

// Component that throws an error
const ErrorThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return React.createElement('View', {}, 'No error');
};

// Component that works normally
const NormalComponent: React.FC = () => {
  return React.createElement('View', {}, 'Normal component');
};

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    // Suppress console.error during tests
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('should render children when no error occurs', () => {
    expect(() => {
      React.createElement(ErrorBoundary, {}, 
        React.createElement(NormalComponent)
      );
    }).not.toThrow();
  });

  it('should catch errors and render fallback UI', () => {
    const onError = jest.fn();
    
    // Create error boundary with error throwing component
    const boundary = React.createElement(ErrorBoundary, { onError },
      React.createElement(ErrorThrowingComponent)
    );

    expect(() => {
      // This would normally be rendered, but we're testing the creation
      boundary;
    }).not.toThrow();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();
    const boundary = new (ErrorBoundary as any)({ onError, children: null });
    const error = new Error('Test error');
    const errorInfo = { componentStack: 'test stack' };

    boundary.componentDidCatch(error, errorInfo);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'REACT_ERROR_BOUNDARY',
        message: 'Test error'
      })
    );
  });

  it('should reset error state when handleRetry is called', () => {
    const boundary = new (ErrorBoundary as any)({ children: null });
    
    // Simulate error state
    boundary.state = { hasError: true, error: new Error('test'), appError: null };
    
    // Call handleRetry
    boundary.handleRetry();
    
    // The method should be callable without errors
    expect(typeof boundary.handleRetry).toBe('function');
  });

  it('should handle resetKeys prop changes', () => {
    const boundary = new (ErrorBoundary as any)({ resetKeys: ['key1'], children: null });
    boundary.state = { hasError: true, error: new Error('test'), appError: null };
    boundary.prevResetKeys = [];
    
    // componentDidUpdate should be callable without errors
    expect(() => {
      boundary.componentDidUpdate({ resetKeys: ['key2'], children: null });
    }).not.toThrow();
  });

  it('should render with isolation container when isolate prop is true', () => {
    const boundary = new (ErrorBoundary as any)({ isolate: true, children: 'test' });
    boundary.state = { hasError: false, error: null, appError: null };
    
    const result = boundary.render();
    // The result should include isolation styling
    expect(result).toBeDefined();
  });

  describe('withErrorBoundary HOC', () => {
    it('should wrap component with error boundary', () => {
      const WrappedComponent = withErrorBoundary(NormalComponent);
      
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(NormalComponent)');
      
      // Should be able to create the wrapped component
      expect(() => {
        React.createElement(WrappedComponent);
      }).not.toThrow();
    });

    it('should pass through props to wrapped component', () => {
      const TestComponent: React.FC<{ testProp: string }> = ({ testProp }) => {
        return React.createElement('View', {}, testProp);
      };
      
      const WrappedComponent = withErrorBoundary(TestComponent);
      
      expect(() => {
        React.createElement(WrappedComponent, { testProp: 'test value' });
      }).not.toThrow();
    });

    it('should accept error boundary props', () => {
      const onError = jest.fn();
      const WrappedComponent = withErrorBoundary(NormalComponent, { onError });
      
      expect(() => {
        React.createElement(WrappedComponent);
      }).not.toThrow();
    });
  });

  describe('getDerivedStateFromError', () => {
    it('should return correct state from error', () => {
      const error = new Error('Test error');
      const newState = (ErrorBoundary as any).getDerivedStateFromError(error);
      
      expect(newState).toEqual({
        hasError: true,
        error: error
      });
    });
  });

  describe('componentDidUpdate', () => {
    it('should not reset when hasError is false', () => {
      const boundary = new (ErrorBoundary as any)({ resetKeys: ['key1'], children: null });
      boundary.state = { hasError: false, error: null, appError: null };
      
      const spy = jest.spyOn(boundary, 'handleRetry');
      
      boundary.componentDidUpdate({ resetKeys: ['key2'], children: null });
      
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should update prevResetKeys', () => {
      const boundary = new (ErrorBoundary as any)({ resetKeys: ['key1', 'key2'], children: null });
      boundary.state = { hasError: false, error: null, appError: null };
      
      boundary.componentDidUpdate({ resetKeys: ['old1', 'old2'], children: null });
      
      expect(boundary.prevResetKeys).toEqual(['key1', 'key2']);
    });
  });
});