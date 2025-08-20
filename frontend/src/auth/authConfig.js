export const authConfig = {
  authority: process.env.REACT_APP_OIDC_AUTHORITY || 'http://localhost:9003/realms/my-realm',
  client_id: process.env.REACT_APP_OIDC_CLIENT_ID || 'test-client',
  redirect_uri: process.env.REACT_APP_OIDC_REDIRECT_URI || 'http://localhost:3000',
  post_logout_redirect_uri: process.env.REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI || 'http://localhost:3000',
  response_type: 'code',
  scope: process.env.REACT_APP_OIDC_SCOPE || 'openid profile email',
  loadUserInfo: true,
  automaticSilentRenew: false, // Disable for now to simplify debugging
  code_challenge_method: 'S256', // Ensure PKCE is used
  onSigninCallback: (user) => {
    // Store the access token for API calls
    console.log('✅ Signin callback triggered with user:', user);
    console.log('✅ Access token:', user.access_token ? 'Present' : 'Missing');
    localStorage.setItem('access_token', user.access_token);
    console.log('✅ Token stored in localStorage');
  },
  onRemoveUser: () => {
    // Clear the access token when user logs out
    console.log('🗑️ User removed, clearing token');
    localStorage.removeItem('access_token');
  },
  onSigninError: (error) => {
    console.error('❌ Signin error:', error);
  },
  onSilentRenewError: (error) => {
    console.error('❌ Silent renew error:', error);
  },
  onUserLoaded: (user) => {
    console.log('👤 User loaded:', user);
  },
  onUserUnloaded: () => {
    console.log('👤 User unloaded');
  }
};
