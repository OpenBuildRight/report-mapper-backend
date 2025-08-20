# Frontend Deployment Guide

This guide explains how to deploy the Report Mapper frontend with proper environment configuration.

## Environment Variables

The frontend uses the following environment variables that can be configured at deployment time:

### OIDC Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_OIDC_AUTHORITY` | Keycloak realm authority URL | `https://keycloak.example.com/realms/my-realm` |
| `REACT_APP_OIDC_CLIENT_ID` | OIDC client ID | `my-frontend-client` |
| `REACT_APP_OIDC_REDIRECT_URI` | Frontend redirect URI after login | `https://frontend.example.com` |
| `REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI` | Frontend redirect URI after logout | `https://frontend.example.com` |
| `REACT_APP_OIDC_SCOPE` | OIDC scopes | `openid profile email` |

### API Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `https://api.example.com` |
| `REACT_APP_API_TIMEOUT` | API request timeout (ms) | `30000` |

## Local Development

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Start the development server:
   ```bash
   ./start-frontend.sh
   ```

## Production Deployment

### Docker Deployment

1. Create a production environment file:
   ```bash
   cp env.production.example .env.production
   ```

2. Edit `.env.production` with your production values

3. Build the production image:
   ```bash
   docker build -t report-mapper-frontend .
   ```

4. Run with environment variables:
   ```bash
   docker run -p 3000:80 \
     -e REACT_APP_OIDC_AUTHORITY=https://keycloak.example.com/realms/my-realm \
     -e REACT_APP_OIDC_CLIENT_ID=my-frontend-client \
     -e REACT_APP_OIDC_REDIRECT_URI=https://frontend.example.com \
     -e REACT_APP_API_URL=https://api.example.com \
     report-mapper-frontend
   ```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: report-mapper-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: report-mapper-frontend
  template:
    metadata:
      labels:
        app: report-mapper-frontend
    spec:
      containers:
      - name: frontend
        image: report-mapper-frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: REACT_APP_OIDC_AUTHORITY
          value: "https://keycloak.example.com/realms/my-realm"
        - name: REACT_APP_OIDC_CLIENT_ID
          value: "my-frontend-client"
        - name: REACT_APP_OIDC_REDIRECT_URI
          value: "https://frontend.example.com"
        - name: REACT_APP_API_URL
          value: "https://api.example.com"
```

### Cloud Platform Deployment

#### AWS Amplify

1. Connect your repository
2. Set environment variables in the Amplify console:
   - `REACT_APP_OIDC_AUTHORITY`
   - `REACT_APP_OIDC_CLIENT_ID`
   - `REACT_APP_OIDC_REDIRECT_URI`
   - `REACT_APP_API_URL`

#### Vercel

1. Deploy from GitHub
2. Set environment variables in Vercel dashboard
3. Configure custom domain if needed

#### Netlify

1. Deploy from Git
2. Set environment variables in Netlify dashboard
3. Configure redirects for SPA routing

## Keycloak Configuration

For production deployment, ensure your Keycloak client is configured with:

1. **Valid Redirect URIs**: Include your production frontend URL
2. **Web Origins**: Add your frontend domain for CORS
3. **Client Protocol**: `openid-connect`
4. **Access Type**: `public` (for frontend clients)

Example Keycloak client configuration:
```json
{
  "clientId": "my-frontend-client",
  "enabled": true,
  "protocol": "openid-connect",
  "publicClient": true,
  "redirectUris": ["https://frontend.example.com"],
  "webOrigins": ["https://frontend.example.com"]
}
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **CORS Configuration**: Configure proper CORS in Keycloak
3. **Token Storage**: Access tokens are stored in localStorage (consider httpOnly cookies for enhanced security)
4. **Environment Variables**: Never commit sensitive values to version control
5. **Client Secrets**: Frontend clients should not use client secrets (use public client type)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check Keycloak web origins configuration
2. **Redirect URI Mismatch**: Ensure exact match between frontend and Keycloak
3. **Token Issues**: Verify client configuration and scopes
4. **Environment Variables**: Ensure all required variables are set

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded correctly
3. Test OIDC discovery endpoint
4. Check network tab for failed requests
