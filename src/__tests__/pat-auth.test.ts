import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { PatLinearAuth, OAuthLinearAuth, PersonalAccessTokenConfig, OAuthConfig } from '../auth.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { LinearClient } from '@linear/sdk';

// Mock LinearClient
jest.mock('@linear/sdk', () => {
  return {
    LinearClient: jest.fn().mockImplementation(() => ({
      // Mock methods as needed
    }))
  };
});

describe('PatLinearAuth', () => {
  let patAuth: PatLinearAuth;
  const validPatConfig: PersonalAccessTokenConfig = {
    type: 'pat',
    accessToken: 'test-access-token'
  };

  const invalidOAuthConfig: OAuthConfig = {
    type: 'oauth',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback'
  };

  beforeEach(() => {
    patAuth = new PatLinearAuth();
    (LinearClient as jest.Mock).mockClear();
  });

  describe('initialize', () => {
    it('should initialize with valid PAT config', () => {
      expect(() => {
        patAuth.initialize(validPatConfig);
      }).not.toThrow();

      expect(LinearClient).toHaveBeenCalledWith({
        accessToken: 'test-access-token'
      });
    });

    it('should throw error when initialized with OAuth config', () => {
      expect(() => {
        patAuth.initialize(invalidOAuthConfig);
      }).toThrow(McpError);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true after successful initialization', () => {
      patAuth.initialize(validPatConfig);
      expect(patAuth.isAuthenticated()).toBe(true);
    });

    it('should return false before initialization', () => {
      expect(patAuth.isAuthenticated()).toBe(false);
    });
  });

  describe('needsTokenRefresh', () => {
    it('should always return false for PAT authentication', () => {
      patAuth.initialize(validPatConfig);
      expect(patAuth.needsTokenRefresh()).toBe(false);
    });
  });

  describe('getClient', () => {
    it('should return LinearClient after initialization', () => {
      patAuth.initialize(validPatConfig);
      expect(patAuth.getClient()).toBeDefined();
      expect(LinearClient).toHaveBeenCalledWith({
        accessToken: 'test-access-token'
      });
    });

    it('should throw error when called before initialization', () => {
      expect(() => {
        patAuth.getClient();
      }).toThrow(McpError);
    });
  });
});

describe('OAuthLinearAuth', () => {
  let oauthAuth: OAuthLinearAuth;
  const validOAuthConfig: OAuthConfig = {
    type: 'oauth',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback'
  };

  const invalidPatConfig: PersonalAccessTokenConfig = {
    type: 'pat',
    accessToken: 'test-access-token'
  };

  beforeEach(() => {
    oauthAuth = new OAuthLinearAuth();
    (LinearClient as jest.Mock).mockClear();
  });

  describe('initialize', () => {
    it('should initialize with valid OAuth config', () => {
      expect(() => {
        oauthAuth.initialize(validOAuthConfig);
      }).not.toThrow();

      // OAuth doesn't create client until handleCallback
      expect(LinearClient).not.toHaveBeenCalled();
    });

    it('should throw error when initialized with PAT config', () => {
      expect(() => {
        oauthAuth.initialize(invalidPatConfig);
      }).toThrow(McpError);
    });

    it('should throw error when missing required OAuth parameters', () => {
      expect(() => {
        oauthAuth.initialize({
          type: 'oauth',
          clientId: 'test-client-id',
          // Missing clientSecret and redirectUri
        } as any);
      }).toThrow(McpError);
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should return valid authorization URL after initialization', () => {
      oauthAuth.initialize(validOAuthConfig);
      const url = oauthAuth.getAuthorizationUrl();
      
      expect(url).toContain('https://linear.app/oauth/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback');
    });

    it('should throw error when called before initialization', () => {
      expect(() => {
        oauthAuth.getAuthorizationUrl();
      }).toThrow(McpError);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false before token exchange', () => {
      oauthAuth.initialize(validOAuthConfig);
      expect(oauthAuth.isAuthenticated()).toBe(false);
    });
  });
});