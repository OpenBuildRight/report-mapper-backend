import { useState, useCallback } from 'react';
import { ErrorDetails } from '../components/ErrorMessage';

export interface ErrorHandlerOptions {
  showRetry?: boolean;
  showDismiss?: boolean;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export interface UseErrorHandlerReturn {
  error: ErrorDetails | null;
  setError: (error: Error | string | ErrorDetails) => void;
  clearError: () => void;
  handleAsyncError: <T>(promise: Promise<T>, context?: string) => Promise<T | null>;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<ErrorDetails | null>(null);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const formatError = useCallback((error: Error | string | ErrorDetails): ErrorDetails => {
    if (typeof error === 'string') {
      return {
        title: 'Error',
        message: error,
        retryAction: options.showRetry ? () => clearError() : undefined,
        dismissAction: options.showDismiss ? () => clearError() : undefined
      };
    }

    if (error instanceof Error) {
      return {
        title: 'Error',
        message: error.message || 'An unexpected error occurred',
        details: error.stack,
        retryAction: options.showRetry ? () => clearError() : undefined,
        dismissAction: options.showDismiss ? () => clearError() : undefined
      };
    }

    return {
      ...error,
      retryAction: error.retryAction || (options.showRetry ? () => clearError() : undefined),
      dismissAction: error.dismissAction || (options.showDismiss ? () => clearError() : undefined)
    };
  }, [options.showRetry, options.showDismiss, clearError]);

  const setError = useCallback((error: Error | string | ErrorDetails) => {
    const formattedError = formatError(error);
    setErrorState(formattedError);

    if (options.autoDismiss && options.autoDismissDelay) {
      setTimeout(() => {
        setErrorState(null);
      }, options.autoDismissDelay);
    }
  }, [formatError, options.autoDismiss, options.autoDismissDelay]);

  const handleAsyncError = useCallback(async <T>(
    promise: Promise<T>, 
    context?: string
  ): Promise<T | null> => {
    try {
      return await promise;
    } catch (error) {
      const errorMessage = context 
        ? `${context}: ${error instanceof Error ? error.message : String(error)}`
        : error instanceof Error ? error.message : String(error);
      
      setError(errorMessage);
      return null;
    }
  }, [setError]);

  return {
    error,
    setError,
    clearError,
    handleAsyncError
  };
};

// Utility functions for common error scenarios
export const createNetworkError = (message: string, retryAction?: () => void): ErrorDetails => ({
  title: 'Network Error',
  message,
  code: 'NETWORK_ERROR',
  retryAction
});

export const createAuthError = (message: string, retryAction?: () => void): ErrorDetails => ({
  title: 'Authentication Error',
  message,
  code: 'AUTH_ERROR',
  retryAction
});

export const createValidationError = (message: string): ErrorDetails => ({
  title: 'Validation Error',
  message,
  code: 'VALIDATION_ERROR'
});

export const createUploadError = (message: string, retryAction?: () => void): ErrorDetails => ({
  title: 'Upload Error',
  message,
  code: 'UPLOAD_ERROR',
  retryAction
});
