# linear-mcp Development Guide

## Commands
- Build: `npm run build` - Compiles TS to JS
- Dev: `npm run dev` - Watches files and rebuilds/restarts on changes
- Test: `npm test` - Runs all tests
- Test single file: `npx jest path/to/test.ts` - Run specific test file
- Test watch: `npm run test:watch` - Run tests in watch mode
- Integration tests: `npm run test:integration` - Run integration tests only
- Code coverage: `npm run test:coverage` - Generate test coverage report
- OAuth test: `npm run test:oauth` - Tests OAuth flow
- Get test tokens: `npm run get-test-tokens` - Retrieves test tokens

## Code Style Guidelines
- **Imports**: Use ES module syntax; .js extension on imports required (e.g., `import {...} from './file.js'`)
- **Types**: Strict TypeScript; explicit types for function params/returns; prefer interfaces for object shapes
- **Naming**: PascalCase for classes/interfaces; camelCase for variables/functions; descriptive names
- **Error Handling**: Use try/catch blocks; return standardized error responses (ErrorToolResponse interface)
- **Components**: Follow feature-based directory structure with handlers/types separation
- **Testing**: Write unit tests for all handlers; use mocks for external dependencies
- **Documentation**: JSDoc comments for interfaces, classes, and non-obvious methods

## Implementation Priorities
- **PAT Authentication**: Implement Personal Access Token authentication as priority for orgs without admin access
- Refactor LinearAuth into separate classes with ILinearAuth interface, dedicated PAT and OAuth implementations
- Improve error handling with domain-specific error types