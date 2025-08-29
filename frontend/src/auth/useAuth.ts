import { useAuth as useOidcAuth } from 'react-oidc-context';
import { useMemo, useEffect, useState } from 'react';
import { AuthError } from '../components/AuthErrorModal';

export interface AuthUser {
  access_token?: string;
  id_token?: string;
  name?: string;
  email?: string;
  sub?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  [key: string]: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: AuthError | null;
  getAccessToken: () => string | null;
  logout: () => void;
  clearError: () => void;
  signinRedirect: () => Promise<void>;
  signoutRedirect: () => Promise<void>;
  handleRetryLogin: () => void;
}

export const useAuth = (): AuthState => {
  const auth = useOidcAuth();
  const [error, setError] = useState<AuthError | null>(null);
  
  const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token');
  };

  const logout = (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('pendingAction');
    setError(null);
    if (auth.signoutRedirect) {
      auth.signoutRedirect();
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  // Extract user information from OIDC user profile
  const user = useMemo((): AuthUser | null => {
    if (!auth.user) return null;
    
    const profile = auth.user.profile;
    const userInfo: AuthUser = {
      access_token: auth.user.access_token,
      id_token: auth.user.id_token,
      sub: profile?.sub,
      name: profile?.name || profile?.preferred_username,
      email: profile?.email,
      given_name: profile?.given_name,
      family_name: profile?.family_name,
      preferred_username: profile?.preferred_username,
    };
    
    // Add any additional claims from the profile
    if (profile) {
      Object.keys(profile).forEach(key => {
        if (!userInfo[key]) {
          userInfo[key] = profile[key];
        }
      });
    }
    
    return userInfo;
  }, [auth.user]);

  // Effect to sync OIDC user with localStorage token
  useEffect(() => {
    if (auth.user && auth.user.access_token) {
      console.log('🔐 Syncing OIDC user token to localStorage');
      localStorage.setItem('access_token', auth.user.access_token);
      setError(null); // Clear any previous errors on successful auth
    }
  }, [auth.user]);

  // Effect to handle authentication errors
  useEffect(() => {
    if (auth.error) {
      console.error('🔐 Authentication error:', auth.error);
      
      let authError: AuthError;
      
      // Handle different types of OIDC errors
      switch (auth.error.name) {
        case 'SigninError':
          authError = {
            title: 'Login Failed',
            message: 'There was a problem signing you in. Please try again.',
            details: auth.error.message,
            code: 'SIGNIN_ERROR'
          };
          break;
        case 'SignoutError':
          authError = {
            title: 'Logout Failed',
            message: 'There was a problem signing you out.',
            details: auth.error.message,
            code: 'SIGNOUT_ERROR'
          };
          break;
        case 'SilentRenewError':
          authError = {
            title: 'Session Renewal Failed',
            message: 'Your session could not be renewed automatically. Please log in again.',
            details: auth.error.message,
            code: 'SILENT_RENEW_ERROR'
          };
          break;
        default:
          authError = {
            title: 'Authentication Error',
            message: 'An unexpected authentication error occurred.',
            details: auth.error.message,
            code: auth.error.name || 'UNKNOWN_ERROR'
          };
      }
      
      setError(authError);
      
      // Clear any stored tokens on error
      localStorage.removeItem('access_token');
    }
  }, [auth.error]);

  // Check if user is authenticated - either by OIDC context or by having an access token
  const isAuthenticated = useMemo((): boolean => {
    const hasOidcAuth = auth.isAuthenticated;
    const hasToken = !!getAccessToken();
    const hasUser = !!auth.user;
    
    console.log('🔍 Auth Debug:', {
      oidcAuthenticated: hasOidcAuth,
      hasToken: hasToken,
      hasUser: hasUser,
      user: user,
      isLoading: auth.isLoading,
      hasError: !!auth.error,
      authState: auth
    });
    
    // If there's an error, we're not authenticated
    if (auth.error) {
      console.log('❌ Not authenticated due to error');
      return false;
    }
    
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
  }, [auth.isAuthenticated, auth.user, auth.isLoading, auth.error, user, auth]);

  const handleRetryLogin = (): void => {
    clearError();
    if (auth.signinRedirect) {
      auth.signinRedirect();
    }
  };

  return {
    isAuthenticated,
    isLoading: auth.isLoading,
    user,
    error,
    getAccessToken,
    logout,
    clearError,
    signinRedirect: auth.signinRedirect,
    signoutRedirect: auth.signoutRedirect,
    handleRetryLogin
  };
};
