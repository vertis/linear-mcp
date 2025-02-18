import { gql } from 'graphql-tag';

export const CREATE_ISSUES_MUTATION = gql`
  mutation CreateIssues($input: [IssueCreateInput!]!) {
    issueCreate(input: $input) {
      success
      issue {
        id
        identifier
        title
        url
        team {
          id
          name
        }
        project {
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
      issue {
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
    issueUpdate(ids: $ids, input: $input) {
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

export const DELETE_ISSUES_MUTATION = gql`
  mutation DeleteIssues($ids: [String!]!) {
    issueDelete(ids: $ids) {
      success
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
