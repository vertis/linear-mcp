import { LinearClient } from '@linear/sdk';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Authentication implementations for Linear API:
 * 
 * 1. OAuth - For applications with full Linear org admin access
 * 2. Personal Access Token (PAT) - For applications without admin access
 */

export interface OAuthConfig {
  type: 'oauth';
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface PersonalAccessTokenConfig {
  type: 'pat';
  accessToken: string;
}

export type AuthConfig = OAuthConfig | PersonalAccessTokenConfig;

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Interface for Linear authentication strategies
 */
export interface ILinearAuth {
  /**
   * Initialize the authentication with configuration
   */
  initialize(config: AuthConfig): void;
  
  /**
   * Get the authenticated Linear client
   */
  getClient(): LinearClient;
  
  /**
   * Check if authentication is established
   */
  isAuthenticated(): boolean;
  
  /**
   * Check if token refresh is needed (OAuth only)
   */
  needsTokenRefresh(): boolean;
  
  /**
   * Get authorization URL for OAuth flow (OAuth only)
   */
  getAuthorizationUrl?(): string;
  
  /**
   * Handle OAuth callback with authorization code (OAuth only)
   */
  handleCallback?(code: string): Promise<void>;
  
  /**
   * Refresh OAuth access token (OAuth only)
   */
  refreshAccessToken?(): Promise<void>;
}

/**
 * Authentication implementation using Personal Access Token
 */
export class PatLinearAuth implements ILinearAuth {
  private linearClient?: LinearClient;
  private tokenData?: TokenData;

  constructor() {}

  public initialize(config: AuthConfig): void {
    if (config.type !== 'pat') {
      throw new McpError(
        ErrorCode.InvalidParams,
        'PatLinearAuth requires PAT configuration'
      );
    }

    this.tokenData = {
      accessToken: config.accessToken,
      refreshToken: '', // Not needed for PAT
      expiresAt: Number.MAX_SAFE_INTEGER, // PATs don't expire
    };
    
    this.linearClient = new LinearClient({
      apiKey: config.accessToken,
    });
  }

  public getClient(): LinearClient {
    if (!this.linearClient) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Linear client not initialized'
      );
    }
    return this.linearClient;
  }

  public isAuthenticated(): boolean {
    return !!this.linearClient && !!this.tokenData;
  }

  public needsTokenRefresh(): boolean {
    return false; // PATs don't expire
  }
}

/**
 * Authentication implementation using OAuth flow
 */
export class OAuthLinearAuth implements ILinearAuth {
  private static readonly OAUTH_AUTH_URL = 'https://linear.app/oauth';
  private static readonly OAUTH_TOKEN_URL = 'https://api.linear.app';
  private config?: OAuthConfig;
  private tokenData?: TokenData;
  private linearClient?: LinearClient;

  constructor() {}

  public initialize(config: AuthConfig): void {
    if (config.type !== 'oauth') {
      throw new McpError(
        ErrorCode.InvalidParams,
        'OAuthLinearAuth requires OAuth configuration'
      );
    }

    if (!config.clientId || !config.clientSecret || !config.redirectUri) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required OAuth parameters: clientId, clientSecret, redirectUri'
      );
    }
    
    this.config = config;
  }

  public getAuthorizationUrl(): string {
    if (!this.config) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'OAuth config not initialized'
      );
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'read,write,issues:create,offline_access',
      actor: 'application', // Enable OAuth Actor Authorization
      state: this.generateState(),
      access_type: 'offline',
    });

    return `${OAuthLinearAuth.OAUTH_AUTH_URL}/authorize?${params.toString()}`;
  }

  public async handleCallback(code: string): Promise<void> {
    if (!this.config) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'OAuth config not initialized'
      );
    }

    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
        access_type: 'offline'
      });

      const response = await fetch(`${OAuthLinearAuth.OAUTH_TOKEN_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token request failed: ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();
      this.tokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      this.linearClient = new LinearClient({
        apiKey: this.tokenData.accessToken,
      });
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `OAuth token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async refreshAccessToken(): Promise<void> {
    if (!this.config || !this.tokenData?.refreshToken) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'OAuth not initialized or no refresh token available'
      );
    }

    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.tokenData.refreshToken
      });

      const response = await fetch(`${OAuthLinearAuth.OAUTH_TOKEN_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();
      this.tokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      this.linearClient = new LinearClient({
        apiKey: this.tokenData.accessToken,
      });
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public getClient(): LinearClient {
    if (!this.linearClient) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Linear client not initialized'
      );
    }
    return this.linearClient;
  }

  public isAuthenticated(): boolean {
    return !!this.linearClient && !!this.tokenData;
  }

  public needsTokenRefresh(): boolean {
    if (!this.tokenData) return false;
    return Date.now() >= this.tokenData.expiresAt - 300000; // Refresh 5 minutes before expiry
  }

  // For testing purposes
  public setTokenData(tokenData: TokenData): void {
    this.tokenData = tokenData;
      this.linearClient = new LinearClient({
        apiKey: tokenData.accessToken,
      });
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Legacy authentication class for backward compatibility
 * @deprecated Use PatLinearAuth or OAuthLinearAuth instead
 */
export class LinearAuth implements ILinearAuth {
  private static readonly OAUTH_AUTH_URL = 'https://linear.app/oauth';
  private static readonly OAUTH_TOKEN_URL = 'https://api.linear.app';
  private config?: AuthConfig;
  private tokenData?: TokenData;
  private linearClient?: LinearClient;
  private authImpl?: ILinearAuth;

  constructor() {}

  public getAuthorizationUrl(): string {
    if (!this.config || this.config.type !== 'oauth') {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'OAuth config not initialized'
      );
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'read,write,issues:create,offline_access',
      actor: 'application', // Enable OAuth Actor Authorization
      state: this.generateState(),
      access_type: 'offline',
    });

    return `${LinearAuth.OAUTH_AUTH_URL}/authorize?${params.toString()}`;
  }

  public async handleCallback(code: string): Promise<void> {
    if (!this.config || this.config.type !== 'oauth') {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'OAuth config not initialized'
      );
    }

    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
        access_type: 'offline'
      });

      const response = await fetch(`${LinearAuth.OAUTH_TOKEN_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token request failed: ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();
      this.tokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      this.linearClient = new LinearClient({
        apiKey: this.tokenData.accessToken,
      });
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `OAuth token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async refreshAccessToken(): Promise<void> {
    if (!this.config || this.config.type !== 'oauth' || !this.tokenData?.refreshToken) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'OAuth not initialized or no refresh token available'
      );
    }

    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.tokenData.refreshToken
      });

      const response = await fetch(`${LinearAuth.OAUTH_TOKEN_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();
      this.tokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      this.linearClient = new LinearClient({
        accessToken: this.tokenData.accessToken,
      });
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public initialize(config: AuthConfig): void {
    this.config = config;
    
    if (config.type === 'pat') {
      // Create PatLinearAuth implementation
      const patAuth = new PatLinearAuth();
      patAuth.initialize(config);
      this.authImpl = patAuth;
      this.linearClient = patAuth.getClient();
      
      // For backward compatibility
      this.tokenData = {
        accessToken: config.accessToken,
        refreshToken: '',
        expiresAt: Number.MAX_SAFE_INTEGER,
      };
    } else {
      // OAuth flow
      if (!config.clientId || !config.clientSecret || !config.redirectUri) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Missing required OAuth parameters: clientId, clientSecret, redirectUri'
        );
      }
      
      // For backward compatibility, we don't create an OAuthLinearAuth instance yet
      // because it requires an additional handleCallback step
    }
  }

  public getClient(): LinearClient {
    // Use the delegate implementation if available
    if (this.authImpl) {
      return this.authImpl.getClient();
    }
    
    // Otherwise, fall back to legacy implementation
    if (!this.linearClient) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Linear client not initialized'
      );
    }
    return this.linearClient;
  }

  public isAuthenticated(): boolean {
    // Use the delegate implementation if available
    if (this.authImpl) {
      return this.authImpl.isAuthenticated();
    }
    
    // Otherwise, fall back to legacy implementation
    return !!this.linearClient && !!this.tokenData;
  }

  public needsTokenRefresh(): boolean {
    // Use the delegate implementation if available
    if (this.authImpl) {
      return this.authImpl.needsTokenRefresh();
    }
    
    // Otherwise, fall back to legacy implementation
    if (!this.tokenData || !this.config || this.config.type === 'pat') return false;
    return Date.now() >= this.tokenData.expiresAt - 300000; // Refresh 5 minutes before expiry
  }

  // For testing purposes
  public setTokenData(tokenData: TokenData): void {
    this.tokenData = tokenData;
    this.linearClient = new LinearClient({
      apiKey: tokenData.accessToken,
    });
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
