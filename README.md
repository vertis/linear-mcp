# Linear MCP Server

An MCP server for interacting with Linear's API. This server provides a set of tools for managing Linear issues, projects, and teams through Cline.

## Setup Guide

### 1. Environment Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

### 2. Authentication

The server supports two authentication methods:

#### Personal Access Token (Recommended)

This method is ideal for organizations where you don't have admin access:

1. Go to Linear: Settings > API > Create a Personal Access Token
2. Add the token to your `.env` file:
   ```
   LINEAR_PAT=your_personal_access_token
   ```

To use PAT authentication in your code:

```typescript
import { PatLinearAuth, PersonalAccessTokenConfig } from './auth.js';

// Create PAT config
const patConfig: PersonalAccessTokenConfig = {
  type: 'pat',
  accessToken: process.env.LINEAR_PAT || ''
};

// Initialize authentication
const linearAuth = new PatLinearAuth();
linearAuth.initialize(patConfig);

// Get Linear client
const linearClient = linearAuth.getClient();
```

#### OAuth Flow (Alternative)

For organizations where you have admin access, OAuth provides more features:

1. Create an OAuth application at https://linear.app/settings/api/applications
2. Configure OAuth environment variables in `.env`:
   ```
   LINEAR_CLIENT_ID=your_oauth_client_id
   LINEAR_CLIENT_SECRET=your_oauth_client_secret
   LINEAR_REDIRECT_URI=http://localhost:3000/callback
   ```

To use OAuth authentication in your code:

```typescript
import { OAuthLinearAuth, OAuthConfig } from './auth.js';

// Create OAuth config
const oauthConfig: OAuthConfig = {
  type: 'oauth',
  clientId: process.env.LINEAR_CLIENT_ID || '',
  clientSecret: process.env.LINEAR_CLIENT_SECRET || '',
  redirectUri: process.env.LINEAR_REDIRECT_URI || ''
};

// Initialize authentication
const linearAuth = new OAuthLinearAuth();
linearAuth.initialize(oauthConfig);

// Get authorization URL for user to authorize
const authUrl = linearAuth.getAuthorizationUrl();
console.log('Visit this URL to authorize:', authUrl);

// After user authorizes and is redirected with code:
await linearAuth.handleCallback(code);

// Get Linear client
const linearClient = linearAuth.getClient();
```

### 3. Running the Server

1. Build the server:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   npm start
   ```

### 4. Cline Integration

1. Open your Cline MCP settings file:
   - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Windows: `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. Add the Linear MCP server configuration:
   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "node",
         "args": ["/path/to/linear-mcp/build/index.js"],
         "env": {
           "LINEAR_PAT": "your_personal_access_token"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

## Available Actions

The server currently supports the following operations:

### Issue Management
- ✅ Create issues with full field support (title, description, team, project, etc.)
- ✅ Update existing issues (priority, description, etc.)
- ✅ Delete issues (single or bulk deletion)
- ✅ Search issues with filtering
- ✅ Associate issues with projects
- ✅ Create parent/child issue relationships

### Project Management
- ✅ Create projects with associated issues
- ✅ Get project information
- ✅ Associate issues with projects

### Team Management
- ✅ Get team information (with states and workflow details)
- ✅ Access team states and labels

### Authentication
- ✅ Personal Access Token (PAT) authentication
- ✅ Secure token storage

### Batch Operations
- ✅ Bulk issue creation
- ✅ Bulk issue deletion

### Bulk Updates (In Testing)
- 🚧 Bulk issue updates (parallel processing implemented, needs testing)

## Features in Development

The following features are currently being worked on:

### Issue Management
- 🚧 Comment functionality (add/edit comments, threading)
- 🚧 Complex search filters
- 🚧 Pagination support for large result sets

### Metadata Operations
- 🚧 Label management (create/update/assign)
- 🚧 Cycle/milestone management

### Project Management
- 🚧 Project template support
- 🚧 Advanced project operations

### Authentication
- 🚧 OAuth flow with automatic token refresh

### Performance & Security
- 🚧 Rate limiting
- 🚧 Detailed logging
- 🚧 Load testing and optimization

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run integration tests (requires LINEAR_ACCESS_TOKEN)
npm run test:integration

# Build the server
npm run build

# Start the server
npm start
```

## Integration Testing

Integration tests verify that authentication and API calls work correctly:

### With Personal Access Token (PAT)

1. Set up PAT authentication in your `.env` file:
   ```
   LINEAR_PAT=your_personal_access_token
   ```
2. Run integration tests:
   ```bash
   npm run test:integration
   ```

### With OAuth

1. Configure OAuth credentials in `.env`:
   ```
   LINEAR_CLIENT_ID=your_oauth_client_id
   LINEAR_CLIENT_SECRET=your_oauth_client_secret
   LINEAR_REDIRECT_URI=http://localhost:3000/callback
   ```
2. Remove `.skip` from OAuth tests in `src/__tests__/auth.integration.test.ts`
3. Run integration tests with OAuth:
   ```bash
   npm run test:oauth
   ```
