import { describe, it, expect, beforeAll } from '@jest/globals';
import { LinearAuth } from '../auth';
import { LinearClient } from '@linear/sdk';

// Skip these tests if credentials are not configured
const hasCredentials = process.env.LINEAR_CLIENT_ID && 
                      process.env.LINEAR_CLIENT_SECRET && 
                      process.env.LINEAR_REDIRECT_URI;

// Only run integration tests when credentials are available
(hasCredentials ? describe : describe.skip)('LinearAuth Integration', () => {
  let auth: LinearAuth;

  beforeAll(() => {
    auth = new LinearAuth();
    auth.initialize({
      clientId: process.env.LINEAR_CLIENT_ID!,
      clientSecret: process.env.LINEAR_CLIENT_SECRET!,
      redirectUri: process.env.LINEAR_REDIRECT_URI!
    });
  });

  describe('OAuth Flow', () => {
    it('should generate valid authorization URL', () => {
      const url = auth.getAuthorizationUrl();
      expect(url).toContain('https://linear.app/oauth/authorize');
      expect(url).toContain(`client_id=${process.env.LINEAR_CLIENT_ID}`);
      expect(url).toContain(`redirect_uri=${encodeURIComponent(process.env.LINEAR_REDIRECT_URI!)}`);
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=read,write,issues:create');
      expect(url).toContain('actor=application');
      expect(url).toContain('state=');
    });

    // This test requires manual intervention to get an auth code
    // Run this test individually when needed
    it.skip('should exchange auth code for tokens', async () => {
      // This would be the code received from Linear after OAuth redirect
      const authCode = process.env.LINEAR_AUTH_CODE;
      if (!authCode) {
        throw new Error('LINEAR_AUTH_CODE environment variable is required');
      }

      await auth.handleCallback(authCode);
      expect(auth.isAuthenticated()).toBe(true);
    });
  });

  describe('Token Management', () => {
    // This test requires valid tokens to be set
    it.skip('should refresh access token', async () => {
      // Set initial token data (requires valid refresh token)
      const refreshToken = process.env.LINEAR_REFRESH_TOKEN;
      if (!refreshToken) {
        throw new Error('LINEAR_REFRESH_TOKEN environment variable is required');
      }

      auth.setTokenData({
        accessToken: 'expired-token',
        refreshToken,
        expiresAt: Date.now() - 1000 // Expired
      });

      await auth.refreshAccessToken();
      expect(auth.isAuthenticated()).toBe(true);
      
      // Verify we can make authenticated requests
      const client = auth.getClient();
      expect(client).toBeInstanceOf(LinearClient);
      
      // Try to fetch viewer info to verify token works
      const viewer = await client.viewer;
      expect(viewer).toBeDefined();
      expect(viewer.id).toBeDefined();
    });
  });
});
