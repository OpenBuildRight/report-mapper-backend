import React from 'react';

export interface AuthError {
  title: string;
  message: string;
  details?: string;
  code?: string;
}

interface AuthErrorModalProps {
  error: AuthError | null;
  onClose: () => void;
  onRetry?: () => void;
}

const AuthErrorModal: React.FC<AuthErrorModalProps> = ({ error, onClose, onRetry }) => {
  if (!error) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>!</span>
          </div>
          <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>
            {error.title}
          </h3>
        </div>

        <p style={{
          margin: '0 0 16px 0',
          color: '#4b5563',
          lineHeight: '1.5'
        }}>
          {error.message}
        </p>

        {error.details && (
          <div style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#6b7280',
            fontFamily: 'monospace'
          }}>
            {error.details}
          </div>
        )}

        {error.code && (
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '16px'
          }}>
            Error Code: {error.code}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Try Again
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorModal;
