import { useAuth as useOidcAuth } from 'react-oidc-context';

export const useAuth = () => {
  const auth = useOidcAuth();
  
  const getAccessToken = () => {
    return localStorage.getItem('access_token');
  };

  // Check if user is authenticated - either by OIDC context or by having an access token
  const isAuthenticated = () => {
    const hasOidcAuth = auth.isAuthenticated;
    const hasToken = !!getAccessToken();
    
    console.log('🔍 Auth Debug:', {
      oidcAuthenticated: hasOidcAuth,
      hasToken: hasToken,
      user: auth.user,
      isLoading: auth.isLoading
    });
    
    // If OIDC says we're authenticated, we're authenticated
    if (hasOidcAuth) {
      console.log('✅ Authenticated via OIDC context');
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
  };

  return {
    ...auth,
    getAccessToken,
    isAuthenticated: isAuthenticated()
  };
};
