import React from 'react';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';
import { authConfig } from './authConfig';

export const AuthProvider = ({ children }) => {
  console.log('🔐 AuthProvider initialized with config:', authConfig);
  console.log('🔐 Environment variables:', {
    authority: process.env.REACT_APP_OIDC_AUTHORITY,
    client_id: process.env.REACT_APP_OIDC_CLIENT_ID,
    redirect_uri: process.env.REACT_APP_OIDC_REDIRECT_URI
  });
  
  return (
    <OidcAuthProvider {...authConfig}>
      {children}
    </OidcAuthProvider>
  );
};
