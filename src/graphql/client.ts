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

  // Bulk create issues
  async createIssues(issues: any[]) {
    const { CREATE_ISSUES_MUTATION } = await import('./mutations');
    return this.execute(CREATE_ISSUES_MUTATION, { issues });
  }

  // Create project with associated issues
  async createProjectWithIssues(projectInput: any, issues: any[]) {
    const { CREATE_PROJECT_WITH_ISSUES } = await import('./mutations');
    return this.execute(CREATE_PROJECT_WITH_ISSUES, {
      projectInput,
      issues,
    });
  }

  // Bulk update issues
  async updateIssues(ids: string[], input: any) {
    const { UPDATE_ISSUES_MUTATION } = await import('./mutations');
    return this.execute(UPDATE_ISSUES_MUTATION, {
      ids,
      input,
    });
  }

  // Create multiple labels
  async createIssueLabels(labels: any[]) {
    const { CREATE_ISSUE_LABELS } = await import('./mutations');
    return this.execute(CREATE_ISSUE_LABELS, { labels });
  }

  // Search issues with pagination
  async searchIssues(filter: any, first: number = 50, after?: string, orderBy: string = "updatedAt") {
    const { SEARCH_ISSUES_QUERY } = await import('./queries');
    return this.execute(SEARCH_ISSUES_QUERY, {
      filter,
      first,
      after,
      orderBy,
    });
  }

  // Get teams with their states and labels
  async getTeams() {
    const { GET_TEAMS_QUERY } = await import('./queries');
    return this.execute(GET_TEAMS_QUERY);
  }

  // Get current user info
  async getCurrentUser() {
    const { GET_USER_QUERY } = await import('./queries');
    return this.execute(GET_USER_QUERY);
  }
}
