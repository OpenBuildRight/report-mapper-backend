export interface AuthConfig {
  authority: string;
  client_id: string;
  redirect_uri: string;
  post_logout_redirect_uri: string;
  response_type: string;
  scope: string;
  loadUserInfo: boolean;
  pkce: boolean;
  onSigninCallback: (user: any) => void;
  onRemoveUser: () => void;
  onSigninError: (error: Error) => void;
  onSignoutError: (error: Error) => void;
}

export const authConfig: AuthConfig = {
  authority: process.env.REACT_APP_OIDC_AUTHORITY || 'http://localhost:9003/realms/my-realm',
  client_id: process.env.REACT_APP_OIDC_CLIENT_ID || 'test-client',
  redirect_uri: process.env.REACT_APP_OIDC_REDIRECT_URI || 'http://localhost:3000/auth-callback',
  post_logout_redirect_uri: process.env.REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI || 'http://localhost:3000',
  response_type: 'code',
  scope: process.env.REACT_APP_OIDC_SCOPE || 'openid profile email',
  loadUserInfo: true,
  pkce: true,
  onSigninCallback: (user: any) => {
    console.log('🔐 Sign in callback triggered:', user);
    console.log('🔐 User access token:', user.access_token);
    
    // Validate the token has required claims
    if (!user.access_token) {
      console.error('🔐 No access token received from OIDC provider');
      throw new Error('No access token received from authentication provider');
    }
    
    // Store the access token for API calls
    localStorage.setItem('access_token', user.access_token);
    console.log('🔐 Access token stored in localStorage');
    
    // Log user information for debugging
    console.log('🔐 User info:', {
      name: user.profile?.name,
      email: user.profile?.email,
      sub: user.profile?.sub,
      tokenExpiresAt: user.expires_at
    });
  },
  onRemoveUser: () => {
    console.log('🔐 Sign out callback triggered');
    // Clear the access token when user logs out
    localStorage.removeItem('access_token');
    localStorage.removeItem('pendingAction');
    console.log('🔐 Access token removed from localStorage');
  },
  onSigninError: (error: Error) => {
    console.error('🔐 Sign in error:', error);
    console.error('🔐 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Clear any potentially corrupted tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('pendingAction');
  },
  onSignoutError: (error: Error) => {
    console.error('🔐 Sign out error:', error);
    console.error('🔐 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Clear tokens even on signout error
    localStorage.removeItem('access_token');
    localStorage.removeItem('pendingAction');
  }
};
