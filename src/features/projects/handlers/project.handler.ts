import { BaseHandler } from '../../../core/handlers/base.handler.js';
import { BaseToolResponse } from '../../../core/interfaces/tool-handler.interface.js';
import { LinearAuth } from '../../../auth.js';
import { LinearGraphQLClient } from '../../../graphql/client.js';

/**
 * Handler for project-related operations.
 * Manages creating, searching, and retrieving project information.
 */
export class ProjectHandler extends BaseHandler {
  constructor(auth: LinearAuth, graphqlClient?: LinearGraphQLClient) {
    super(auth, graphqlClient);
  }

  /**
   * Creates a new project with associated issues.
   */
  async handleCreateProjectWithIssues(args: any): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ['project', 'issues']);

      if (!Array.isArray(args.issues)) {
        throw new Error('Issues parameter must be an array');
      }

      const result = await client.createProjectWithIssues(
        args.project,
        args.issues
      );

      if (!result.projectCreate.success) {
        throw new Error('Failed to create project');
      }

      const { project } = result.projectCreate;
      const issuesCreated = result.issueCreate.issues.length;

      return this.createResponse(
        `Successfully created project with issues\n` +
        `Project: ${project.name}\n` +
        `URL: ${project.url}\n` +
        `Issues created: ${issuesCreated}`
      );
    } catch (error) {
      this.handleError(error, 'create project with issues');
    }
  }

  /**
   * Gets information about a specific project.
   */
  async handleGetProject(args: any): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ['id']);

      const result = await client.getProject(args.id);

      return this.createJsonResponse(result);
    } catch (error) {
      this.handleError(error, 'get project info');
    }
  }

  /**
   * Searches for projects by name.
   */
  async handleSearchProjects(args: any): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ['name']);

      const result = await client.searchProjects({
        name: { eq: args.name }
      });

      return this.createJsonResponse(result);
    } catch (error) {
      this.handleError(error, 'search projects');
    }
  }
}
