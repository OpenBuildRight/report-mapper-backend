# Authentication Testing Guide

## 🔍 Problem Description
The observation form redirects to login even after the user has logged in. This suggests an issue with authentication state management.

## 🧪 Testing Steps

### 1. **Basic Authentication Flow Test**
```bash
# Start the development server
cd frontend
pnpm start
```

**Steps:**
1. Open browser to `http://localhost:3000`
2. Look for the Auth Debug panel in the top-right corner
3. Check the initial state (should show "❌ Not Authenticated")
4. Click "Test Auth" button to see detailed console logs
5. Try to navigate to `/observation` - should start OAuth flow

### 2. **OAuth Flow Test**
1. Navigate directly to `http://localhost:3000/observation`
2. Should automatically start OAuth flow (redirect to login)
3. Complete the OIDC login process
4. Should redirect back to `/auth-callback`
5. Should then redirect to `/observation` with authenticated state
6. Should see the observation form

### 3. **Error Handling Test**
1. Navigate to `/observation` while not authenticated
2. If OAuth fails, should show error message
3. Should remain on the intended URL (`/observation`)
4. Error should be dismissible and allow retry

### 4. **Token Storage Test**
1. After successful login, open browser DevTools
2. Go to Application tab → Local Storage
3. Check if `access_token` is present
4. Use the "Test Auth" button in the debug panel to verify

### 5. **Manual Token Test**
1. Click "Set Test Token" in the debug panel
2. This will set a fake token in localStorage
3. Check if the app recognizes you as authenticated
4. Try accessing `/observation`

### 6. **Clear Storage Test**
1. Click "Clear Storage" in the debug panel
2. This will clear all localStorage
3. Check if you're redirected to login when accessing protected routes
4. Verify the authentication state resets

## 🔧 Debugging Tools

### Auth Debug Panel
The debug panel shows:
- **Status**: Current authentication state
- **User**: User information if available
- **Token**: Whether access token is present
- **Error**: Any authentication errors
- **Test Auth**: Logs detailed auth state to console
- **Set Test Token**: Manually sets a test token
- **Simulate Error**: Simulates an authentication error
- **Clear Storage**: Clears all localStorage
- **Clear Error**: Clears error state

### Console Logs
Look for these log messages:
- `🔍 Auth Debug:` - Detailed authentication state
- `🔐 Sign in callback triggered:` - OIDC login success
- `🔐 Syncing OIDC user token to localStorage` - Token sync
- `🔐 Starting OAuth flow, redirecting to:` - OAuth flow initiation
- `🔐 Authentication successful, redirecting to:` - Successful redirect
- `✅ Authenticated via...` - Authentication method used
- `❌ Not authenticated` - Authentication failure

## 🐛 Common Issues & Solutions

### Issue 1: OAuth Callback Not Working
**Symptoms:** Login succeeds but user not redirected back
**Solution:** Check OIDC configuration and callback URLs (`/auth-callback`)

### Issue 2: Token Not Syncing
**Symptoms:** OIDC shows authenticated but localStorage empty
**Solution:** The `useEffect` should handle this automatically

### Issue 3: Race Condition
**Symptoms:** Intermittent authentication failures
**Solution:** Check if `isLoading` state is properly handled

### Issue 4: Environment Variables
**Symptoms:** OIDC not connecting properly
**Solution:** Verify environment variables in `.env` file

## 📋 Environment Variables Check
Make sure these are set in your `.env` file:
```env
REACT_APP_OIDC_AUTHORITY=http://localhost:9003/realms/my-realm
REACT_APP_OIDC_CLIENT_ID=test-client
REACT_APP_OIDC_REDIRECT_URI=http://localhost:3000/auth-callback
REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
REACT_APP_OIDC_SCOPE=openid profile email
```

## 🔄 Testing Scenarios

### Scenario 1: Fresh OAuth Flow
1. Clear browser storage
2. Navigate to `/observation`
3. Should start OAuth flow automatically
4. Complete login
5. Should redirect back to `/observation`

### Scenario 2: Existing Session
1. Login and stay logged in
2. Refresh the page
3. Navigate to `/observation`
4. Should work without OAuth flow

### Scenario 3: OAuth Failure
1. Navigate to `/observation`
2. Start OAuth flow
3. If login fails, should show error
4. Should remain on `/observation` URL
5. Should allow retry

### Scenario 4: Token Expiry
1. Login successfully
2. Manually clear the token from localStorage
3. Navigate to `/observation`
4. Should start OAuth flow again

## 📊 Expected Behavior

| State | OIDC Auth | Has Token | Has User | Expected Result |
|-------|-----------|-----------|----------|-----------------|
| Loading | - | - | - | Show loading screen |
| Not Auth | false | false | false | Start OAuth flow |
| Token Only | false | true | false | ✅ Authenticated |
| User Only | false | false | true | ✅ Authenticated |
| OIDC Auth | true | - | - | ✅ Authenticated |
| Full Auth | true | true | true | ✅ Authenticated |

## 🚨 Troubleshooting

If the issue persists:

1. **Check Network Tab**: Look for failed OIDC requests
2. **Check Console**: Look for authentication errors
3. **Check localStorage**: Verify token storage
4. **Check OIDC Server**: Ensure Keycloak/identity server is running
5. **Check CORS**: Ensure redirect URIs are properly configured
6. **Check Callback URL**: Verify `/auth-callback` is configured in OIDC provider

## 📝 Notes

- The debug panel only shows in development mode
- Console logs provide detailed authentication state
- OAuth flow automatically starts when accessing protected routes
- Errors are shown in-place without redirecting away
- The `useEffect` in `useAuth` should automatically sync OIDC tokens
- Multiple authentication methods are supported for robustness
