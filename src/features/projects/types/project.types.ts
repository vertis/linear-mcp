/**
 * Project operation types
 */

export interface ProjectInput {
  name: string;
  description?: string;
  teamId: string;
  state?: string;
}

export interface ProjectResponse {
  projectCreate: {
    success: boolean;
    project: {
      id: string;
      name: string;
      url: string;
    };
  };
}

export interface SearchProjectsResponse {
  projects: {
    nodes: Array<ProjectResponse['projectCreate']['project']>;
  };
}
