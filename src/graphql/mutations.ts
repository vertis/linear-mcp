import { gql } from 'graphql-tag';

export const CREATE_ISSUES_MUTATION = gql`
  mutation CreateIssues($issues: [IssueCreateInput!]!) {
    issueCreate(input: $issues) {
      success
      issues {
        id
        identifier
        title
        url
        team {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_PROJECT_WITH_ISSUES = gql`
  mutation CreateProjectWithIssues(
    $projectInput: ProjectCreateInput!
    $issues: [IssueCreateInput!]!
  ) {
    projectCreate(input: $projectInput) {
      success
      project {
        id
        name
        url
      }
    }
    issueCreate(input: $issues) {
      success
      issues {
        id
        identifier
        title
        url
      }
    }
  }
`;

export const UPDATE_ISSUES_MUTATION = gql`
  mutation UpdateIssues($ids: [String!]!, $input: IssueUpdateInput!) {
    issueUpdate(id: $ids, input: $input) {
      success
      issues {
        id
        identifier
        title
        url
        state {
          name
        }
      }
    }
  }
`;

export const CREATE_ISSUE_LABELS = gql`
  mutation CreateIssueLabels($labels: [IssueLabelCreateInput!]!) {
    issueLabelCreate(input: $labels) {
      success
      issueLabels {
        id
        name
        color
      }
    }
  }
`;
