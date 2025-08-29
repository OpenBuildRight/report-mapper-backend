import React from 'react';

export interface ErrorDetails {
  title?: string;
  message: string;
  code?: string;
  details?: string;
  retryAction?: () => void;
  dismissAction?: () => void;
}

interface ErrorMessageProps {
  error: ErrorDetails;
  variant?: 'inline' | 'modal' | 'banner';
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  variant = 'inline',
  className = ''
}) => {
  const baseClasses = 'error-message';
  const variantClasses = {
    inline: 'error-message-inline',
    modal: 'error-message-modal',
    banner: 'error-message-banner'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  const renderContent = () => (
    <div className="error-content">
      <div className="error-header">
        <span className="error-icon">⚠️</span>
        <h4 className="error-title">
          {error.title || 'Error'}
        </h4>
      </div>
      
      <p className="error-message-text">{error.message}</p>
      
      {error.code && (
        <div className="error-code">
          <small>Error Code: {error.code}</small>
        </div>
      )}
      
      {error.details && (
        <details className="error-details">
          <summary>More Details</summary>
          <pre>{error.details}</pre>
        </details>
      )}
      
      <div className="error-actions">
        {error.retryAction && (
          <button 
            onClick={error.retryAction}
            className="btn btn-primary btn-sm"
          >
            Try Again
          </button>
        )}
        {error.dismissAction && (
          <button 
            onClick={error.dismissAction}
            className="btn btn-secondary btn-sm"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );

  if (variant === 'modal') {
    return (
      <div className={classes}>
        <div className="error-modal-overlay">
          <div className="error-modal-content">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes}>
      {renderContent()}
    </div>
  );
};

export default ErrorMessage;
