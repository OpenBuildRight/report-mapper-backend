import { useAuth as useOidcAuth } from 'react-oidc-context';
import { useMemo, useEffect } from 'react';

export interface AuthUser {
  access_token?: string;
  name?: string;
  email?: string;
  sub?: string;
  [key: string]: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  getAccessToken: () => string | null;
  logout: () => void;
  signinRedirect: () => Promise<void>;
  signoutRedirect: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const auth = useOidcAuth();
  
  const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token');
  };

  const logout = (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('pendingAction');
    if (auth.signoutRedirect) {
      auth.signoutRedirect();
    }
  };

  // Effect to sync OIDC user with localStorage token
  useEffect(() => {
    if (auth.user && auth.user.access_token) {
      console.log('🔐 Syncing OIDC user token to localStorage');
      localStorage.setItem('access_token', auth.user.access_token);
    }
  }, [auth.user]);

  // Check if user is authenticated - either by OIDC context or by having an access token
  const isAuthenticated = useMemo((): boolean => {
    const hasOidcAuth = auth.isAuthenticated;
    const hasToken = !!getAccessToken();
    const hasUser = !!auth.user;
    
    console.log('🔍 Auth Debug:', {
      oidcAuthenticated: hasOidcAuth,
      hasToken: hasToken,
      hasUser: hasUser,
      user: auth.user,
      isLoading: auth.isLoading,
      authState: auth
    });
    
    // If OIDC says we're authenticated, we're authenticated
    if (hasOidcAuth) {
      console.log('✅ Authenticated via OIDC context');
      return true;
    }
    
    // If we have a user object, we're authenticated
    if (hasUser) {
      console.log('✅ Authenticated via user object');
      return true;
    }
    
    // If we have an access token in localStorage, we're authenticated
    // (this handles the case where the token is stored but OIDC context hasn't updated yet)
    if (hasToken) {
      console.log('✅ Authenticated via localStorage token');
      return true;
    }
    
    console.log('❌ Not authenticated');
    return false;
  }, [auth.isAuthenticated, auth.user, auth.isLoading, auth]);

  return {
    isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user as AuthUser | null,
    getAccessToken,
    logout,
    signinRedirect: auth.signinRedirect,
    signoutRedirect: auth.signoutRedirect
  };
};
