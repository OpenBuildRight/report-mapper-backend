import React from 'react';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';
import { authConfig } from './authConfig';

export const AuthProvider = ({ children }) => {
  console.log('🔐 AuthProvider initialized with config:', authConfig);
  
  return (
    <OidcAuthProvider {...authConfig}>
      {children}
    </OidcAuthProvider>
  );
};
