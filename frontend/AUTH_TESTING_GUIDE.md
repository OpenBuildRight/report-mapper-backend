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
5. Try to navigate to `/observation` - should redirect to login

### 2. **Login Flow Test**
1. Click "Sign In" button
2. Complete the OIDC login process
3. After successful login, check the Auth Debug panel
4. Should show "✅ Authenticated" and user information
5. Try navigating to `/observation` again

### 3. **Token Storage Test**
1. After login, open browser DevTools
2. Go to Application tab → Local Storage
3. Check if `access_token` is present
4. Use the "Test Auth" button in the debug panel to verify

### 4. **Manual Token Test**
1. Click "Set Test Token" in the debug panel
2. This will set a fake token in localStorage
3. Check if the app recognizes you as authenticated
4. Try accessing `/observation`

### 5. **Clear Storage Test**
1. Click "Clear Storage" in the debug panel
2. This will clear all localStorage
3. Check if you're redirected to login
4. Verify the authentication state resets

## 🔧 Debugging Tools

### Auth Debug Panel
The debug panel shows:
- **Status**: Current authentication state
- **User**: User information if available
- **Token**: Whether access token is present
- **Test Auth**: Logs detailed auth state to console
- **Set Test Token**: Manually sets a test token
- **Clear Storage**: Clears all localStorage

### Console Logs
Look for these log messages:
- `🔍 Auth Debug:` - Detailed authentication state
- `🔐 Sign in callback triggered:` - OIDC login success
- `🔐 Syncing OIDC user token to localStorage` - Token sync
- `✅ Authenticated via...` - Authentication method used
- `❌ Not authenticated` - Authentication failure

## 🐛 Common Issues & Solutions

### Issue 1: OIDC Callback Not Working
**Symptoms:** Login succeeds but token not stored
**Solution:** Check OIDC configuration and callback URLs

### Issue 2: Token Not Syncing
**Symptoms:** OIDC shows authenticated but localStorage empty
**Solution:** The new `useEffect` should handle this automatically

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
REACT_APP_OIDC_REDIRECT_URI=http://localhost:3000
REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
REACT_APP_OIDC_SCOPE=openid profile email
```

## 🔄 Testing Scenarios

### Scenario 1: Fresh Login
1. Clear browser storage
2. Navigate to `/observation`
3. Should redirect to login
4. Complete login
5. Should redirect back to `/observation`

### Scenario 2: Existing Session
1. Login and stay logged in
2. Refresh the page
3. Navigate to `/observation`
4. Should work without redirect

### Scenario 3: Token Expiry
1. Login successfully
2. Manually clear the token from localStorage
3. Navigate to `/observation`
4. Should redirect to login

### Scenario 4: OIDC State Mismatch
1. Login via OIDC
2. Manually set a different token in localStorage
3. Check which authentication method wins

## 📊 Expected Behavior

| State | OIDC Auth | Has Token | Has User | Expected Result |
|-------|-----------|-----------|----------|-----------------|
| Loading | - | - | - | Show loading screen |
| Not Auth | false | false | false | Redirect to login |
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

## 📝 Notes

- The debug panel only shows in development mode
- Console logs provide detailed authentication state
- The `useEffect` in `useAuth` should automatically sync OIDC tokens
- Multiple authentication methods are supported for robustness
