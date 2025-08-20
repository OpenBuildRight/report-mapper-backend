# Report Mapper Frontend

A React-based web interface for the Report Mapper API. This frontend provides a user-friendly interface for uploading images and creating observations with location data.

## Features

- **OIDC Authentication**: Secure login with Keycloak Identity Provider
- **Image Upload**: Drag-and-drop interface for uploading images with metadata
- **Location Support**: Automatic geolocation detection and manual coordinate input
- **Observation Creation**: Create observations with location, images, and custom properties
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Feedback**: Success/error messages and loading states
- **Token Management**: Automatic token handling for API requests

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Running Report Mapper Backend API (on localhost:8080)
- Running Keycloak Identity Provider (on localhost:9003)

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will open in your browser at `http://localhost:3000`.

## Authentication Setup

Before using the application, you need to configure Keycloak to allow the frontend redirect URI:

1. **Update Keycloak Configuration** (see `setup-keycloak.md` for detailed instructions):
   - Add `http://localhost:3000` to the valid redirect URIs for the `test-client`
   - You can do this via Terraform or the Keycloak Admin Console

2. **Test Credentials**:
   - Username: `alice`
   - Password: `alice_password`

## Usage

### Upload Images
1. Click on the "Upload Images" tab
2. Drag and drop images or click to select files
3. Optionally add:
   - Description
   - Image generated time
   - Location coordinates (or use "Get Current Location")
4. Click "Upload Images"

### Create Observation
1. Click on the "Create Observation" tab
2. Fill in required fields:
   - Title
   - Description
   - Location coordinates
3. Optionally add:
   - Observation time
   - Associated images
   - Custom properties (key-value pairs)
4. Click "Create Observation"

## API Integration

The frontend communicates with the following API endpoints:

- `POST /image` - Upload images with metadata
- `POST /observation` - Create observations
- `GET /image/{id}` - Get image metadata
- `GET /image/download/{id}` - Download images

All API requests include Bearer token authentication using the OIDC access token.

## Development

### Project Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── auth/
│   │   ├── authConfig.js
│   │   ├── AuthProvider.js
│   │   └── useAuth.js
│   ├── api/
│   │   └── apiClient.js
│   ├── components/
│   │   ├── ImageUploadForm.js
│   │   ├── ObservationForm.js
│   │   ├── LoginPage.js
│   │   └── Header.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── setup-keycloak.md
└── README.md
```

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Configuration

The frontend is configured to proxy API requests to `http://localhost:8080` (the backend). This is set in `package.json`:

```json
{
  "proxy": "http://localhost:8080"
}
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your backend is running and configured to allow requests from `http://localhost:3000`.

### API Connection Issues
- Verify the backend is running on port 8080
- Check that the proxy configuration in `package.json` is correct
- Ensure your backend endpoints are accessible

### Geolocation Issues
- Make sure you're using HTTPS or localhost (geolocation requires secure context)
- Grant location permissions to the browser when prompted

## Building for Production

To create a production build:

```bash
npm run build
```

This creates a `build` folder with optimized static files that can be served by any web server.

## Security Notes

- The frontend currently doesn't handle authentication (the backend has OAuth2 configured)
- For production use, implement proper authentication and authorization
- Consider adding input validation and sanitization
- Use HTTPS in production environments
