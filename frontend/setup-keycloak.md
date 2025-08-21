# Keycloak Setup for Frontend

## Current Configuration

Your Keycloak client `test-client` is configured with these redirect URIs:
- `http://localhost:8080/*` (for backend)
- `http://127.0.0.1:8080/*` (for backend)
- `http://localhost:3000` (for frontend)
- `http://127.0.0.1:3000` (for frontend)

## Configuration Status

✅ **Frontend redirect URIs have been added to the Terraform configuration.**

The Terraform configuration in `local-env-setup/main.tf` has been updated to include the frontend redirect URIs. You can apply these changes by running:

```bash
cd local-env-setup
terraform apply
```

### Option 1: Update Terraform Configuration

Update `local-env-setup/main.tf`:

```hcl
resource "keycloak_openid_client" "openid_client" {
  realm_id            = keycloak_realm.this.id
  client_id           = "test-client"

  name                = "test client"
  enabled             = true

  access_type         = "CONFIDENTIAL"
  valid_redirect_uris = [
    "http://localhost:8080/*",
    "http://127.0.0.1:8080/*",
    "http://localhost:3000",  # Add this line
    "http://127.0.0.1:3000",  # Add this line
  ]

  login_theme = "keycloak"
  standard_flow_enabled = true
  implicit_flow_enabled = true
  direct_access_grants_enabled = true

  extra_config = {
    "key1" = "value1"
    "key2" = "value2"
  }
}
```

Then run:
```bash
cd local-env-setup
terraform apply
```

### Option 2: Manual Keycloak Admin Console

1. Start your local environment:
   ```bash
   cd local-env-setup
   docker-compose up -d
   ```

2. Access Keycloak Admin Console:
   - URL: http://localhost:9003
   - Username: `kc_admin_user`
   - Password: `kc_admin_password`

3. Navigate to:
   - Realm: `my-realm`
   - Clients → `test-client`

4. Add these Valid Redirect URIs:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`

5. Save the configuration

## Test Credentials

Use these credentials to test the authentication:

- **Username**: `alice`
- **Password**: `alice_password`

## Frontend Configuration

The frontend is configured to:
- Use OIDC discovery URL: `http://localhost:9003/realms/my-realm/.well-known/openid-configuration`
- Client ID: `test-client`
- Redirect URI: `http://localhost:3000`
- Scopes: `openid profile email`

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure Keycloak allows requests from `http://localhost:3000`
2. **Redirect URI Mismatch**: Ensure the redirect URI in Keycloak matches exactly
3. **Token Issues**: Check that the client is configured for `CONFIDENTIAL` access type
4. **Discovery Issues**: Verify the OIDC discovery URL is accessible

### Debug Steps:

1. Check browser console for errors
2. Verify Keycloak is running: `http://localhost:9003`
3. Test OIDC discovery: `http://localhost:9003/realms/my-realm/.well-known/openid-configuration`
4. Check network tab for failed requests
