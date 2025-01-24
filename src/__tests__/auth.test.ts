import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { LinearAuth } from '../auth';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe('LinearAuth', () => {
  let auth: LinearAuth;

  beforeEach(() => {
    auth = new LinearAuth();
  });

  describe('initialize', () => {
    it('should initialize with valid credentials', () => {
      expect(() => {
        auth.initialize({
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          redirectUri: 'http://localhost:3000/callback'
        });
      }).not.toThrow();
    });

    it('should throw error when missing required parameters', () => {
      expect(() => {
        auth.initialize({
          clientId: 'test-client-id',
          // Missing clientSecret and redirectUri
        } as any);
      }).toThrow();
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should return valid authorization URL', () => {
      auth.initialize({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'http://localhost:3000/callback'
      });

      const url = auth.getAuthorizationUrl();
      expect(url).toContain('https://linear.app/oauth/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback');
    });

    it('should throw error when called before initialization', () => {
      expect(() => {
        auth.getAuthorizationUrl();
      }).toThrow();
    });
  });

  describe('handleCallback', () => {
    it('should handle valid authorization code', async () => {
      auth.initialize({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'http://localhost:3000/callback'
      });

      // Mock the token exchange
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600
        }),
        { status: 200 }
      ));

      await expect(auth.handleCallback('valid-code')).resolves.not.toThrow();
      expect(auth.isAuthenticated()).toBe(true);
    });

    it('should throw error for invalid authorization code', async () => {
      auth.initialize({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'http://localhost:3000/callback'
      });

      // Mock failed token exchange
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({
          error: 'invalid_grant'
        }),
        { status: 400 }
      ));

      await expect(auth.handleCallback('invalid-code')).rejects.toThrow();
    });
  });

  describe('needsTokenRefresh', () => {
    it('should return true when token is expired', () => {
      auth.initialize({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'http://localhost:3000/callback'
      });

      // Set expired token
      auth.setTokenData({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() - 1000
      });

      expect(auth.needsTokenRefresh()).toBe(true);
    });

    it('should return false for valid token', () => {
      auth.initialize({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'http://localhost:3000/callback'
      });

      // Set valid token
      auth.setTokenData({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() + 3600000 // 1 hour from now
      });

      expect(auth.needsTokenRefresh()).toBe(false);
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh token', async () => {
      auth.initialize({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'http://localhost:3000/callback'
      });

      // Set initial token data
      auth.setTokenData({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() - 1000 // Expired
      });

      // Mock successful token refresh
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600
        }),
        { status: 200 }
      ));

      await expect(auth.refreshAccessToken()).resolves.not.toThrow();
    });

    it('should throw error when refresh fails', async () => {
      auth.initialize({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'http://localhost:3000/callback'
      });

      // Set initial token data
      auth.setTokenData({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() - 1000 // Expired
      });

      // Mock failed token refresh
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({
          error: 'invalid_grant'
        }),
        { status: 400 }
      ));

      await expect(auth.refreshAccessToken()).rejects.toThrow();
    });
  });
});
