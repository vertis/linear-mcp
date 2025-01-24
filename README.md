# Linear MCP Server

An MCP server for interacting with Linear's API.

## Authentication

The server supports two authentication methods:

### 1. Personal Access Token (Recommended for Testing)

1. Generate a Personal Access Token at https://linear.app/settings/api
2. Copy `.env.example` to `.env`
3. Set `LINEAR_ACCESS_TOKEN` in your `.env` file
4. Run `npm run get-test-tokens` to verify authentication works

### 2. OAuth Flow (For Production Use)

1. Create an OAuth application at https://linear.app/settings/api/applications
2. Copy `.env.example` to `.env`
3. Configure OAuth environment variables:
   ```
   LINEAR_CLIENT_ID=your_oauth_client_id
   LINEAR_CLIENT_SECRET=your_oauth_client_secret
   LINEAR_REDIRECT_URI=http://localhost:3000/callback
   ```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run integration tests (requires LINEAR_ACCESS_TOKEN)
npm run test:integration
```

## Integration Testing

Integration tests verify that authentication and API calls work correctly. By default, they use Personal Access Token (PAT) authentication as it's simpler and more reliable for testing.

1. Generate a PAT at https://linear.app/settings/api
2. Set `LINEAR_ACCESS_TOKEN` in your `.env` file
3. Run integration tests:
   ```bash
   npm run test:integration
   ```

OAuth flow tests are included but skipped by default. They can be enabled by:

1. Configuring OAuth credentials in `.env`
2. Removing `.skip` from the OAuth test suite in `src/__tests__/auth.integration.test.ts`
3. Running integration tests with `npm run test:integration`
