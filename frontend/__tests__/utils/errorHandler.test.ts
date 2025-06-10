import { ErrorHandler } from '../../src/utils/errorHandler';

describe('ErrorHandler', () => {
  describe('createError', () => {
    it('should create an error object with required fields', () => {
      const error = ErrorHandler.createError('TEST_CODE', 'Test message');
      
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.timestamp).toBeTruthy();
      expect(error.details).toBeUndefined();
    });

    it('should include details when provided', () => {
      const details = { extra: 'info' };
      const error = ErrorHandler.createError('TEST_CODE', 'Test message', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('handleAuthError', () => {
    it('should handle unauthorized errors', () => {
      const authError = { message: 'unauthorized access' };
      const error = ErrorHandler.handleAuthError(authError);
      
      expect(error.code).toBe('AUTH_UNAUTHORIZED');
      expect(error.message).toContain('Authentication failed');
    });

    it('should handle network errors', () => {
      const authError = { message: 'network connection failed' };
      const error = ErrorHandler.handleAuthError(authError);
      
      expect(error.code).toBe('AUTH_NETWORK');
      expect(error.message).toContain('Network error');
    });

    it('should handle unknown errors', () => {
      const authError = { message: 'something else went wrong' };
      const error = ErrorHandler.handleAuthError(authError);
      
      expect(error.code).toBe('AUTH_UNKNOWN');
      expect(error.message).toContain('Authentication error');
    });
  });

  describe('getErrorMessage', () => {
    it('should return string as is', () => {
      const message = ErrorHandler.getErrorMessage('Test error');
      expect(message).toBe('Test error');
    });

    it('should extract message from error object', () => {
      const error = { message: 'Error message' };
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('Error message');
    });

    it('should extract error_description from error object', () => {
      const error = { error_description: 'Auth0 error description' };
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('Auth0 error description');
    });

    it('should return default message for unknown error format', () => {
      const error = { someProperty: 'value' };
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('An unexpected error occurred');
    });
  });
});