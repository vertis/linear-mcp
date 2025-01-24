import { LinearClient } from '@linear/sdk';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class LinearAuth {
  private static readonly OAUTH_BASE_URL = 'https://linear.app/oauth';
  private config?: AuthConfig;
  private tokenData?: TokenData;
  private linearClient?: LinearClient;

  constructor() {}

  public getAuthorizationUrl(): string {
    if (!this.config) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Auth config not initialized'
      );
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'read,write,issues:create',
      actor: 'application', // Enable OAuth Actor Authorization
      state: this.generateState(),
    });

    return `${LinearAuth.OAUTH_BASE_URL}/authorize?${params.toString()}`;
  }

  public async handleCallback(code: string): Promise<void> {
    if (!this.config) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Auth config not initialized'
      );
    }

    try {
      const response = await fetch(`${LinearAuth.OAUTH_BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`);
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
        `OAuth token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async refreshAccessToken(): Promise<void> {
    if (!this.config || !this.tokenData?.refreshToken) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Auth not initialized or no refresh token available'
      );
    }

    try {
      const response = await fetch(`${LinearAuth.OAUTH_BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.tokenData.refreshToken,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
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
    if (!config.clientId || !config.clientSecret || !config.redirectUri) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: clientId, clientSecret, redirectUri'
      );
    }
    this.config = config;
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
      accessToken: tokenData.accessToken,
    });
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
