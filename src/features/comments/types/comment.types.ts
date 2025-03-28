// src/features/comments/types/comment.types.ts

import { User } from '../../users/types/user.types.js';
import { Issue } from '../../issues/types/issue.types.js';
import { PageInfo, Connection } from '@linear/sdk';

// Basic Comment Structure
export interface Comment {
  id: string;
  body: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  editedAt?: string; // ISO 8601 date string, optional
  user: Pick<User, 'id' | 'name' | 'email'>; // Reference to the user who created the comment
  issue: Pick<Issue, 'id' | 'identifier'>; // Reference to the associated issue
  parent?: Pick<Comment, 'id'>; // Optional reference to parent comment for threading
  children?: Connection<Pick<Comment, 'id'>>; // Optional reference to child comments
}

// Input for creating a comment
export interface CommentCreateInput {
  issueId: string; // ID of the issue to comment on
  body: string; // The content of the comment
  id?: string; // Optional: Client-generated ID for idempotency
  parentId?: string; // Optional: ID of the parent comment to reply to
  createAsUser?: string; // Optional: Create comment as a different user (if permissions allow)
}

// Response for creating a comment
export interface CommentCreateResponse {
  commentCreate: {
    success: boolean;
    comment: Comment;
    lastSyncId: string;
  };
}

// Input for updating a comment
export interface CommentUpdateInput {
  body?: string; // The updated content of the comment
}

// Response for updating a comment
export interface CommentUpdateResponse {
  commentUpdate: {
    success: boolean;
    comment: Pick<Comment, 'id' | 'body' | 'editedAt' | 'user'>; // Return relevant updated fields
    lastSyncId: string;
  };
}

// Response for deleting a comment
export interface CommentDeleteResponse {
  commentDelete: {
    success: boolean;
    lastSyncId: string;
  };
}

// Filter for querying comments (example structure)
export interface CommentFilter {
  id?: { eq?: string; in?: string[] };
  issue?: { id?: { eq?: string; in?: string[] } };
  user?: { id?: { eq?: string; in?: string[] } };
  createdAt?: { gt?: string; lt?: string };
  // Add other potential filter fields based on API capabilities
}

// Input arguments for the get_comments tool/query
export interface GetCommentsArgs {
  filter?: CommentFilter;
  first?: number;
  after?: string;
  orderBy?: string; // e.g., "createdAt", "updatedAt"
}

// Response for querying comments
export interface GetCommentsResponse {
  comments: {
    pageInfo: PageInfo;
    nodes: Comment[];
  };
}