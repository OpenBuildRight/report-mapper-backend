import { useAuth as useOidcAuth } from 'react-oidc-context';

export const useAuth = () => {
  const auth = useOidcAuth();
  
  const getAccessToken = () => {
    return localStorage.getItem('access_token');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('pendingAction');
    if (auth.signoutRedirect) {
      auth.signoutRedirect();
    }
  };

  // Check if user is authenticated - either by OIDC context or by having an access token
  const isAuthenticated = () => {
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
  };

  const isUserAuthenticated = isAuthenticated();

  return {
    ...auth,
    getAccessToken,
    logout,
    isAuthenticated: isUserAuthenticated,
    user: auth.user
  };
};
