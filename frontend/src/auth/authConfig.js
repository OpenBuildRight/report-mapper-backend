export const authConfig = {
  authority: process.env.REACT_APP_OIDC_AUTHORITY || 'http://localhost:9003/realms/my-realm',
  client_id: process.env.REACT_APP_OIDC_CLIENT_ID || 'test-client',
  redirect_uri: process.env.REACT_APP_OIDC_REDIRECT_URI || 'http://localhost:3000',
  post_logout_redirect_uri: process.env.REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI || 'http://localhost:3000',
  response_type: 'code',
  scope: process.env.REACT_APP_OIDC_SCOPE || 'openid profile email',
  loadUserInfo: true,
  onSigninCallback: (user) => {
    console.log('🔐 Sign in callback triggered:', user);
    console.log('🔐 User access token:', user.access_token);
    // Store the access token for API calls
    localStorage.setItem('access_token', user.access_token);
    console.log('🔐 Access token stored in localStorage');
  },
  onRemoveUser: () => {
    console.log('🔐 Sign out callback triggered');
    // Clear the access token when user logs out
    localStorage.removeItem('access_token');
    console.log('🔐 Access token removed from localStorage');
  },
  onSigninError: (error) => {
    console.error('🔐 Sign in error:', error);
  },
  onSignoutError: (error) => {
    console.error('🔐 Sign out error:', error);
  }
};
