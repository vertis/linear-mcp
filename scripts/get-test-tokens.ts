import express from 'express';
import open from 'open';
import { config } from 'dotenv';
import { LinearAuth } from '../src/auth.js';

// Load environment variables
config();

// Create express app for OAuth callback handling
const app = express();
const port = 3000;

// Initialize Linear auth
const auth = new LinearAuth();

// Validate environment variables
const requiredEnvVars = {
  LINEAR_CLIENT_ID: process.env.LINEAR_CLIENT_ID,
  LINEAR_CLIENT_SECRET: process.env.LINEAR_CLIENT_SECRET,
  LINEAR_REDIRECT_URI: process.env.LINEAR_REDIRECT_URI
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Initialize auth with credentials
auth.initialize({
  clientId: requiredEnvVars.LINEAR_CLIENT_ID!,
  clientSecret: requiredEnvVars.LINEAR_CLIENT_SECRET!,
  redirectUri: requiredEnvVars.LINEAR_REDIRECT_URI!
});

// Handle OAuth callback
app.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('OAuth error:', error);
    res.send('Authentication failed. Check console for details.');
    return;
  }

  if (!code || typeof code !== 'string') {
    console.error('No authorization code received');
    res.send('No authorization code received');
    return;
  }

  try {
    // Exchange code for tokens
    console.log('\nAttempting token exchange...');
    await auth.handleCallback(code);
    console.log('Token exchange successful!');

    // Log the code and tokens for test setup
    console.log('\nTest Credentials:\n');
    console.log('Token exchange response:', (auth as any).tokenData);
    console.log(`LINEAR_AUTH_CODE=${code}`);
    console.log(`LINEAR_REDIRECT_URI=${requiredEnvVars.LINEAR_REDIRECT_URI}`);
    
    // Get refresh token from auth instance
    const tokenData = (auth as any).tokenData;
    if (tokenData?.refreshToken) {
      console.log(`LINEAR_REFRESH_TOKEN=${tokenData.refreshToken}`);
    }

    res.send('Authentication successful! Check console for test credentials.');
  } catch (error) {
    console.error('Token exchange failed:', error);
    res.send('Token exchange failed. Check console for details.');
  }
});

// Start server and open auth URL
app.listen(port, () => {
  console.log(`\nStarting OAuth flow...\n`);
  
  // Get and open authorization URL
  const authUrl = auth.getAuthorizationUrl();
  console.log(`Opening: ${authUrl}\n`);
  open(authUrl);
});
