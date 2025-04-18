import { gql } from 'graphql-tag';

export const SEARCH_ISSUES_QUERY = gql`
  query SearchIssues(
    $filter: IssueFilter
    $first: Int
    $after: String
    $orderBy: PaginationOrderBy
  ) {
    issues(
      filter: $filter
      first: $first
      after: $after
      orderBy: $orderBy
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        identifier
        title
        description
        url
        state {
          id
          name
          type
          color
        }
        assignee {
          id
          name
          email
        }
        team {
          id
          name
          key
        },
        project {
          id
          name
        },
        priority
        labels {
          nodes {
            id
            name
            color
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_TEAMS_QUERY = gql`
  query GetTeams {
    teams {
      nodes {
        id
        name
        key
        description
        states {
          nodes {
            id
            name
            type
            color
          }
        }
        labels {
          nodes {
            id
            name
            color
          }
        }
      }
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser {
    viewer {
      id
      name
      email
      teams {
        nodes {
          id
          name
          key
        }
      }
    }
  }
`;

export const SEARCH_PROJECTS_QUERY = gql`
  query SearchProjects($filter: ProjectFilter) {
    projects(filter: $filter) {
      nodes {
        id
        name
        description
        url
        teams {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_PROJECT_QUERY = gql`
  query GetProject($id: String!) {
    project(id: $id) {
      id
      name
      description
      url
      teams {
        nodes {
          id
          name
        }
      }
    }
  }
`;

export const GET_PROJECT_MILESTONES_QUERY = gql`
  query GetProjectMilestones(
    $filter: ProjectMilestoneFilter
    $before: String
    $after: String
    $first: Int
    $last: Int
    $includeArchived: Boolean
    $orderBy: PaginationOrderBy
  ) {
    projectMilestones(
      filter: $filter
      before: $before
      after: $after
      first: $first
      last: $last
      includeArchived: $includeArchived
      orderBy: $orderBy
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        name
        description
        targetDate
        status
        url
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_ISSUE_QUERY = gql`
  query GetIssue($id: String!) {
    issue(id: $id) {
      id
      identifier
      title
      description
      url
      state {
        id
        name
        type
        color
      }
      assignee {
        id
        name
        email
      }
      team {
        id
        name
        key
      }
      project {
        id
        name
      }
      priority
      labels {
        nodes {
          id
          name
          color
        }
      }
      comments {
        nodes {
          id
          body
          user {
            id
            name
            email
          }
          createdAt
          updatedAt
        }
      }
      createdAt
      updatedAt
    }
  }
`;
