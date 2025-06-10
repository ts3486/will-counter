export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export class ErrorHandler {
  static createError(code: string, message: string, details?: any): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static handleAuthError(error: any): AppError {
    if (error.message?.includes('unauthorized')) {
      return this.createError('AUTH_UNAUTHORIZED', 'Authentication failed. Please login again.', error);
    }
    
    if (error.message?.includes('network')) {
      return this.createError('AUTH_NETWORK', 'Network error during authentication.', error);
    }

    return this.createError('AUTH_UNKNOWN', 'Authentication error occurred.', error);
  }

  static handleApiError(error: any): AppError {
    if (error.message?.includes('Failed to fetch')) {
      return this.createError('API_NETWORK', 'Network connection failed. Please check your internet connection.', error);
    }

    if (error.status === 401) {
      return this.createError('API_UNAUTHORIZED', 'Session expired. Please login again.', error);
    }

    if (error.status === 403) {
      return this.createError('API_FORBIDDEN', 'Access denied.', error);
    }

    if (error.status === 500) {
      return this.createError('API_SERVER', 'Server error. Please try again later.', error);
    }

    return this.createError('API_UNKNOWN', 'An unexpected error occurred.', error);
  }

  static handleDatabaseError(error: any): AppError {
    if (error.message?.includes('row level security')) {
      return this.createError('DB_PERMISSION', 'Permission denied. Please ensure you are properly authenticated.', error);
    }

    if (error.message?.includes('connection')) {
      return this.createError('DB_CONNECTION', 'Database connection failed.', error);
    }

    return this.createError('DB_UNKNOWN', 'Database error occurred.', error);
  }

  static logError(error: AppError): void {
    console.error(`[${error.timestamp}] ${error.code}: ${error.message}`, error.details);
    
    // In production, you would send this to a logging service like Sentry
    // Sentry.captureException(error);
  }

  static getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    if (error.error_description) {
      return error.error_description;
    }

    return 'An unexpected error occurred';
  }
}