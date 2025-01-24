import { LinearClient } from '@linear/sdk';
import { DocumentNode } from 'graphql';

export class LinearGraphQLClient {
  private linearClient: LinearClient;

  constructor(linearClient: LinearClient) {
    this.linearClient = linearClient;
  }

  async execute<T = any, V extends Record<string, unknown> = Record<string, unknown>>(
    document: DocumentNode,
    variables?: V
  ): Promise<T> {
    const graphQLClient = this.linearClient.client;
    try {
      const response = await graphQLClient.rawRequest(
        document.loc?.source.body || '',
        variables
      );
      return response.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`GraphQL operation failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Create single issue
  async createIssue(input: any) {
    const { CREATE_ISSUES_MUTATION } = await import('./mutations.js');
    return this.execute(CREATE_ISSUES_MUTATION, { input });
  }

  // Create multiple issues
  async createIssues(issues: any[]) {
    // For multiple issues, we'll need to make multiple requests
    const results = await Promise.all(issues.map(issue => this.createIssue(issue)));
    return {
      issueCreate: {
        success: results.every(r => r.issueCreate.success),
        issues: results.map(r => r.issueCreate.issue)
      }
    };
  }

  // Create project with associated issues
  async createProjectWithIssues(projectInput: any, issues: any[]) {
    const { CREATE_PROJECT_WITH_ISSUES } = await import('./mutations.js');
    return this.execute(CREATE_PROJECT_WITH_ISSUES, {
      projectInput,
      issues,
    });
  }

  // Update a single issue
  async updateIssue(id: string, input: any) {
    const { UPDATE_ISSUES_MUTATION } = await import('./mutations.js');
    return this.execute(UPDATE_ISSUES_MUTATION, {
      id,
      input,
    });
  }

  // Bulk update issues
  // We don't want to take this approach in the future
  // TODO: turn this into a single graphQL call
  async updateIssues(ids: string[], input: any) {
    // For multiple issues, we'll need to make multiple requests
    const results = await Promise.all(ids.map(id => this.updateIssue(id, input)));
    return {
      issueUpdate: {
        success: results.every(r => r.issueUpdate.success),
        issues: results.map(r => r.issueUpdate.issue)
      }
    };
  }

  // Create multiple labels
  async createIssueLabels(labels: any[]) {
    const { CREATE_ISSUE_LABELS } = await import('./mutations.js');
    return this.execute(CREATE_ISSUE_LABELS, { labels });
  }

  // Search issues with pagination
  async searchIssues(filter: any, first: number = 50, after?: string, orderBy: string = "updatedAt") {
    const { SEARCH_ISSUES_QUERY } = await import('./queries.js');
    return this.execute(SEARCH_ISSUES_QUERY, {
      filter,
      first,
      after,
      orderBy,
    });
  }

  // Get teams with their states and labels
  async getTeams() {
    const { GET_TEAMS_QUERY } = await import('./queries.js');
    return this.execute(GET_TEAMS_QUERY);
  }

  // Get current user info
  async getCurrentUser() {
    const { GET_USER_QUERY } = await import('./queries.js');
    return this.execute(GET_USER_QUERY);
  }

  // Get project info
  async getProject(id: string) {
    const { GET_PROJECT_QUERY } = await import('./queries.js');
    return this.execute(GET_PROJECT_QUERY, { id });
  }

  // Delete an issue
  async deleteIssue(id: string) {
    const { DELETE_ISSUE_MUTATION } = await import('./mutations.js');
    return this.execute(DELETE_ISSUE_MUTATION, { id });
  }

  // Delete multiple issues
  async deleteIssues(ids: string[]) {
    // Make parallel requests for each issue
    const results = await Promise.all(ids.map(id => this.deleteIssue(id)));
    return {
      issueDelete: {
        success: results.every(r => r.issueDelete.success)
      }
    };
  }
}
