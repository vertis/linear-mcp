// src/features/comments/handlers/comment.handler.ts
import { LinearGraphQLClient } from '../../../graphql/client.js';
import { BaseToolResponse } from '../../../core/interfaces/tool-handler.interface.js'; // 1. Import BaseToolResponse
import {
  CommentCreateInput,
  CommentCreateResponse,
  CommentUpdateInput,
  CommentUpdateResponse,
  CommentDeleteResponse,
  GetCommentsArgs,
  GetCommentsResponse,
  CommentFilter
} from '../types/comment.types.js';
import {
  CREATE_COMMENT_MUTATION,
  UPDATE_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION
} from '../../../graphql/mutations.js';
import { GET_COMMENTS_QUERY } from '../../../graphql/queries.js';

export interface CreateCommentToolArgs {
  issueId: string;
  body: string;
  parentId?: string;
}

export interface UpdateCommentToolArgs {
  commentId: string;
  body: string;
}

export interface DeleteCommentToolArgs {
  commentId: string;
}

export class CommentHandler {
  private client: LinearGraphQLClient;

  constructor(linearClient: LinearGraphQLClient) {
    this.client = linearClient;
  }

  /**
   * Fetches comments based on provided arguments.
   */
  public async getComments(args: GetCommentsArgs): Promise<BaseToolResponse> {
    const variables: GetCommentsArgs = {
      filter: args.filter,
      first: args.first,
      after: args.after,
      orderBy: args.orderBy,
    };

    try {
      const response = await this.client.execute<GetCommentsResponse, Record<string, unknown>>(
        GET_COMMENTS_QUERY,
        variables as Record<string, unknown>
      );
      // Wrap response with type: 'text'
      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Rethrow for the main MCP handler to catch and format as ErrorToolResponse
      throw new Error(`Failed to fetch comments via Linear API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a new comment.
   */
  public async createComment(args: CreateCommentToolArgs): Promise<BaseToolResponse> {
    const input: CommentCreateInput = {
      issueId: args.issueId,
      body: args.body,
      parentId: args.parentId,
    };

    try {
      const response = await this.client.execute<CommentCreateResponse, { input: CommentCreateInput }>(
        CREATE_COMMENT_MUTATION,
        { input }
      );
      if (!response?.commentCreate?.success) {
        // Throw an error which will be caught and formatted by the caller
        throw new Error('Linear API reported failure in comment creation (success flag false).');
      }
      // Wrap response with type: 'text'
      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      throw new Error(`Failed to create comment via Linear API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Updates an existing comment.
   */
  public async updateComment(args: UpdateCommentToolArgs): Promise<BaseToolResponse> {
    const input: CommentUpdateInput = {
      body: args.body,
    };

    try {
      const response = await this.client.execute<CommentUpdateResponse, { id: string; input: CommentUpdateInput }>(
        UPDATE_COMMENT_MUTATION,
        { id: args.commentId, input }
      );
      if (!response?.commentUpdate?.success) {
        throw new Error('Linear API reported failure in comment update (success flag false).');
      }
      // Wrap response with type: 'text'
      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };
    } catch (error) {
      console.error('Error updating comment:', error);
      throw new Error(`Failed to update comment via Linear API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Deletes a comment.
   */
  public async deleteComment(args: DeleteCommentToolArgs): Promise<BaseToolResponse> {
    try {
      const response = await this.client.execute<CommentDeleteResponse, { id: string }>(
        DELETE_COMMENT_MUTATION,
        { id: args.commentId }
      );
      if (!response?.commentDelete?.success) {
        throw new Error('Linear API reported failure in comment deletion (success flag false).');
      }
       // Wrap response with type: 'text'
      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error(`Failed to delete comment via Linear API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}