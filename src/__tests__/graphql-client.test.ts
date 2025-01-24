import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { LinearGraphQLClient } from '../graphql/client';
import { LinearClient } from '@linear/sdk';

jest.mock('@linear/sdk');

// Define type for GraphQL response
type GraphQLResponse<T> = {
  data: T;
};

describe('LinearGraphQLClient', () => {
  let graphqlClient: LinearGraphQLClient;
  let linearClient: LinearClient;
  let mockRawRequest: jest.MockedFunction<(query: string, variables?: Record<string, unknown>) => Promise<GraphQLResponse<any>>>;

  beforeEach(() => {
    mockRawRequest = jest.fn();
    // Mock the Linear client's GraphQL client
    linearClient = {
      client: {
        rawRequest: mockRawRequest
      }
    } as unknown as LinearClient;

    // Clear mocks
    mockRawRequest.mockReset();

    graphqlClient = new LinearGraphQLClient(linearClient);
  });

  describe('searchIssues', () => {
    it('should successfully search issues', async () => {
      const mockResponse = {
        data: {
          issues: {
            pageInfo: {
              hasNextPage: false,
              endCursor: null
            },
            nodes: [
              {
                id: 'issue-1',
                identifier: 'TEST-1',
                title: 'Test Issue 1',
                description: 'Description 1',
                state: { name: 'Todo' },
                assignee: { name: 'User 1' }
              }
            ]
          }
        }
      };

      mockRawRequest.mockResolvedValueOnce(mockResponse);

      const result = await graphqlClient.searchIssues(
        { state: { name: { in: ['Todo'] } } },
        1
      );

      expect(result).toEqual(mockResponse.data);
      expect(mockRawRequest).toHaveBeenCalled();
    });

    it('should handle search errors', async () => {
      mockRawRequest.mockRejectedValueOnce(new Error('Search failed'));

      await expect(
        graphqlClient.searchIssues({ state: { name: { in: ['Todo'] } } })
      ).rejects.toThrow('GraphQL operation failed: Search failed');
    });
  });

  describe('createIssues', () => {
    it('should successfully create issues', async () => {
      const mockResponse = {
        data: {
          issueCreate: {
            success: true,
            issues: [
              {
                id: 'issue-1',
                identifier: 'TEST-1',
                title: 'New Issue',
                url: 'https://linear.app/test/issue/TEST-1'
              }
            ]
          }
        }
      };

      mockRawRequest.mockResolvedValueOnce(mockResponse);

      const result = await graphqlClient.createIssues([
        {
          title: 'New Issue',
          description: 'Description',
          teamId: 'team-1'
        }
      ]);

      expect(result).toEqual(mockResponse.data);
      expect(mockRawRequest).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      mockRawRequest.mockRejectedValueOnce(new Error('Creation failed'));

      await expect(
        graphqlClient.createIssues([
          {
            title: 'New Issue',
            description: 'Description',
            teamId: 'team-1'
          }
        ])
      ).rejects.toThrow('GraphQL operation failed: Creation failed');
    });
  });

  describe('createProjectWithIssues', () => {
    it('should successfully create project with issues', async () => {
      const mockResponse = {
        data: {
          projectCreate: {
            success: true,
            project: {
              id: 'project-1',
              name: 'New Project',
              url: 'https://linear.app/test/project/1'
            }
          },
          issueCreate: {
            success: true,
            issues: [
              {
                id: 'issue-1',
                identifier: 'TEST-1',
                title: 'Project Issue 1'
              }
            ]
          }
        }
      };

      mockRawRequest.mockResolvedValueOnce(mockResponse);

      const result = await graphqlClient.createProjectWithIssues(
        {
          name: 'New Project',
          teamIds: ['team-1']
        },
        [
          {
            title: 'Project Issue 1',
            description: 'Description 1',
            teamId: 'team-1'
          }
        ]
      );

      expect(result).toEqual(mockResponse.data);
      expect(mockRawRequest).toHaveBeenCalled();
    });

    it('should handle project creation errors', async () => {
      mockRawRequest.mockRejectedValueOnce(new Error('Project creation failed'));

      await expect(
        graphqlClient.createProjectWithIssues(
          {
            name: 'New Project',
            teamIds: ['team-1']
          },
          [
            {
              title: 'Project Issue 1',
              description: 'Description 1',
              teamId: 'team-1'
            }
          ]
        )
      ).rejects.toThrow('GraphQL operation failed: Project creation failed');
    });
  });

  describe('updateIssues', () => {
    it('should successfully update issues', async () => {
      const mockResponse = {
        data: {
          issueUpdate: {
            success: true,
            issues: [
              {
                id: 'issue-1',
                identifier: 'TEST-1',
                title: 'Updated Issue',
                state: { name: 'In Progress' }
              }
            ]
          }
        }
      };

      mockRawRequest.mockResolvedValueOnce(mockResponse);

      const result = await graphqlClient.updateIssues(
        ['issue-1'],
        { stateId: 'state-2' }
      );

      expect(result).toEqual(mockResponse.data);
      expect(mockRawRequest).toHaveBeenCalled();
    });

    it('should handle update errors', async () => {
      mockRawRequest.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        graphqlClient.updateIssues(['issue-1'], { stateId: 'state-2' })
      ).rejects.toThrow('GraphQL operation failed: Update failed');
    });
  });

  describe('getTeams', () => {
    it('should successfully fetch teams', async () => {
      const mockResponse = {
        data: {
          teams: {
            nodes: [
              {
                id: 'team-1',
                name: 'Team 1',
                key: 'TEAM1',
                states: {
                  nodes: [
                    {
                      id: 'state-1',
                      name: 'Todo',
                      type: 'unstarted'
                    }
                  ]
                },
                labels: {
                  nodes: [
                    {
                      id: 'label-1',
                      name: 'bug',
                      color: '#FF0000'
                    }
                  ]
                }
              }
            ]
          }
        }
      };

      mockRawRequest.mockResolvedValueOnce(mockResponse);

      const result = await graphqlClient.getTeams();

      expect(result).toEqual(mockResponse.data);
      expect(mockRawRequest).toHaveBeenCalled();
    });

    it('should handle team fetch errors', async () => {
      mockRawRequest.mockRejectedValueOnce(new Error('Team fetch failed'));

      await expect(graphqlClient.getTeams()).rejects.toThrow(
        'GraphQL operation failed: Team fetch failed'
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should successfully fetch current user', async () => {
      const mockResponse = {
        data: {
          viewer: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            teams: {
              nodes: [
                {
                  id: 'team-1',
                  name: 'Team 1',
                  key: 'TEAM1'
                }
              ]
            }
          }
        }
      };

      mockRawRequest.mockResolvedValueOnce(mockResponse);

      const result = await graphqlClient.getCurrentUser();

      expect(result).toEqual(mockResponse.data);
      expect(mockRawRequest).toHaveBeenCalled();
    });

    it('should handle user fetch errors', async () => {
      mockRawRequest.mockRejectedValueOnce(new Error('User fetch failed'));

      await expect(graphqlClient.getCurrentUser()).rejects.toThrow(
        'GraphQL operation failed: User fetch failed'
      );
    });
  });
});
