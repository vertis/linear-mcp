# Linear MCP Architecture

This document outlines the architecture of the Linear MCP (Model Context Protocol) implementation.

## Overview

The Linear MCP provides a type-safe, modular interface to the Linear API. It abstracts away the complexity of GraphQL operations while providing a clean, domain-driven API surface through MCP tools.

## Core Concepts

### Domain-Driven Design

The codebase is organized around business domains:
- Authentication
- Issues
- Projects
- Teams
- Users

Each domain has its own set of:
- Handlers (for MCP tool operations)
- Types
- Tests

### Layered Architecture

The codebase follows a layered architecture pattern:

```
src/
├── core/               # Core infrastructure
│   ├── handlers/      # Base handler and factory
│   │   ├── base.handler.ts
│   │   └── handler.factory.ts
│   ├── types/         # Shared type definitions
│   │   ├── tool.types.ts     # MCP tool schemas
│   │   └── common.types.ts
│   └── interfaces/    # Core interfaces
│       └── tool-handler.interface.ts
│
├── features/          # Feature modules by domain
│   ├── auth/         # Authentication
│   │   └── handlers/
│   ├── issues/       # Issue management
│   │   └── handlers/
│   ├── projects/     # Project operations
│   │   └── handlers/
│   ├── teams/        # Team operations
│   │   └── handlers/
│   └── users/        # User operations
│       └── handlers/
│
├── infrastructure/    # Infrastructure concerns
│   ├── graphql/      # GraphQL implementation
│   │   ├── operations/   # GraphQL operations by domain
│   │   └── fragments/    # Shared GraphQL fragments
│   └── http/         # HTTP client
│
└── utils/            # Shared utilities
    ├── logger.ts     # Logging system
    └── config.ts     # Configuration management
```

## Key Components

### Handler Architecture

The handler system provides a clean separation of concerns for MCP tool operations:

```typescript
// Base handler with shared functionality
abstract class BaseHandler {
  protected verifyAuth(): LinearGraphQLClient;
  protected createResponse(text: string): BaseToolResponse;
  protected createJsonResponse(data: unknown): BaseToolResponse;
  protected handleError(error: unknown, operation: string): never;
  protected validateRequiredParams(params: Record<string, unknown>, required: string[]): void;
}

// Feature-specific handlers extend the base
class IssueHandler extends BaseHandler {
  handleCreateIssue(args: any): Promise<BaseToolResponse>;
  handleSearchIssues(args: any): Promise<BaseToolResponse>;
  // ... other issue operations
}

// Factory for managing handlers
class HandlerFactory {
  private authHandler: AuthHandler;
  private issueHandler: IssueHandler;
  // ... other handlers

  getHandlerForTool(toolName: string): { handler: BaseHandler; method: string };
}
```

### Authentication Layer

The authentication system supports both PAT and OAuth flows:

```typescript
class AuthHandler extends BaseHandler {
  handleAuth(args: any): Promise<BaseToolResponse>;
  handleAuthCallback(args: any): Promise<BaseToolResponse>;
}

interface AuthConfig {
  type: 'pat' | 'oauth';
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}
```

### GraphQL Layer

The GraphQL layer provides domain-specific operations:

```typescript
class LinearGraphQLClient {
  // Execute GraphQL operations
  async execute<T>(document: DocumentNode, variables?: any): Promise<T>;
  
  // Domain-specific methods
  async createIssue(input: any): Promise<IssueResult>;
  async searchProjects(filter: any): Promise<ProjectResult>;
  // ... other operations
}
```

### Error Handling

Errors are handled consistently through the MCP error system:

```typescript
interface BaseToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface ErrorToolResponse extends BaseToolResponse {
  isError: true;
}
```

## Best Practices

1. **Handler Organization**
   - Each domain has its own handler
   - Handlers extend BaseHandler
   - Keep handler methods focused and single-purpose

2. **Type Safety**
   - Define tool schemas in tool.types.ts
   - Use interfaces for handler methods
   - Minimize use of 'any' type

3. **Error Handling**
   - Use BaseHandler error methods
   - Provide clear error messages
   - Include operation context in errors

4. **Testing**
   - Test each handler independently
   - Use integration tests for full flows
   - Mock GraphQL responses

## Future Improvements

1. **Type Safety**
   - Add proper types for handler arguments
   - Remove remaining 'any' types
   - Generate types from GraphQL schema

2. **Handler Enhancements**
   - Add input validation
   - Implement response caching
   - Add retry logic

3. **OAuth Implementation**
   - Complete OAuth flow
   - Add token refresh
   - Implement proper state management

4. **GraphQL Operations**
   - Move to code generation
   - Add operation validation
   - Implement batching

## Contributing

When contributing to this codebase:

1. Follow the handler pattern
2. Maintain domain separation
3. Add tests for new handlers
4. Update tool schemas
5. Keep handlers focused
6. Document new tools

## File Organization

Keep related code together:

```
features/issues/
├── handlers/          # Issue-related handlers
│   └── issue.handler.ts
├── types/            # Issue-specific types
│   └── issue.types.ts
└── __tests__/        # Tests
    ├── issue.test.ts
    └── issue.integration.test.ts
```

## Dependency Management

- Keep dependencies minimal
- Use peer dependencies where appropriate
- Lock dependency versions
- Document breaking changes
