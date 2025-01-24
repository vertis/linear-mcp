# Linear MCP Server

## Overview:
The Linear MCP Server enables seamless integration with Linear's project management platform, allowing agents to manage tasks, issues, and projects through natural language and structured commands. It focuses on providing a robust and secure interface while maintaining simplicity in operation.

### Key Features:
* OAuth Authentication: Secure user authentication with automatic token refresh and error handling
* Issue Management: Create, update, and track Linear issues with support for all core fields
* Search Capabilities: Complex issue querying and filtering with full-text search support
* Metadata Operations: Access to teams, projects, cycles, and label management
* Batch Operations: Efficient handling of multiple issues and project templates
* Natural Language Support: Contextual understanding of Linear-related requests and commands


## Development

### Prerequisites

- Node.js 16+
- npm
- A Linear account and OAuth application credentials

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create a Linear OAuth application at https://linear.app/settings/api/applications

3. Configure environment variables:
```bash
# Required for running tests
LINEAR_CLIENT_ID=your_client_id
LINEAR_CLIENT_SECRET=your_client_secret
```

### Testing

#### Unit Tests

Run the unit test suite:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

Coverage report:
```bash
npm run test:coverage
```

#### Integration Tests

The integration tests require valid Linear OAuth credentials and tokens. Follow these steps to set up integration testing:

1. Set up environment variables:
```bash
LINEAR_CLIENT_ID=your_client_id
LINEAR_CLIENT_SECRET=your_client_secret
```

2. Get test tokens by running:
```bash
npm run get-test-tokens
```

This will:
- Start a local server
- Open your browser to Linear's OAuth page
- Handle the OAuth callback
- Log the necessary test credentials

3. Copy the logged credentials to your environment:
```bash
LINEAR_AUTH_CODE=code_from_output
LINEAR_REDIRECT_URI=uri_from_output
LINEAR_REFRESH_TOKEN=token_from_output
```

4. Run integration tests:
```bash
npm run test:integration
```

Note: Some integration tests are skipped by default as they require valid tokens. To run a specific integration test, remove the `.skip` from the test case and ensure you have valid credentials set up.

## Architecture

The server implements Linear's OAuth 2.0 flow and provides MCP tools for:
- Authentication and token management
- Issue operations (create, read, update, delete)
- Search functionality
- Metadata operations (teams, projects, cycles)
- Batch operations

See the [architecture document](../cline/tmp/linear/linear.md) for more details.
