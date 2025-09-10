/**
 * Poll Repository Module
 * 
 * This module provides a repository pattern implementation for poll-related database operations.
 * It encapsulates all Supabase database interactions for polls, poll options, and votes,
 * providing a clean API for the rest of the application to use.
 */

import { createClient } from '@/lib/supabase/client';
import { CreatePollInput, Poll, PollOption, PollWithOptions } from '@/lib/types/poll';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * PollRepository Class
 * 
 * Handles all database operations related to polls using the repository pattern.
 * Provides methods for creating, reading, updating, and deleting polls and their options.
 */
export class PollRepository {
  private supabase: SupabaseClient;

  /**
   * Creates a new PollRepository instance
   * 
   * @param supabaseClient - The Supabase client instance to use for database operations
   */
  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Creates a new poll with options
   * 
   * This method creates a poll record, its associated options, and initializes an analytics entry.
   * Note that this operation is not fully transactional in Supabase - if creating options or analytics fails,
   * the poll will still exist in the database.
   * 
   * @param data - The poll data including title, end date, and options
   * @param userId - The ID of the user creating the poll
   * @returns The created poll with its options, or null if creation failed
   */
  async createPoll(data: CreatePollInput, userId: string): Promise<PollWithOptions | null> {
    const { title, end_date, options: optionTexts } = data;

    // This operation is not transactional. If creating poll options or analytics fails,
    // the poll will still be created. For robust applications, consider using a database transaction
    // (e.g., via an RPC function) to ensure atomicity.
    const { data: poll, error: pollError } = await this.supabase
      .from('polls')
      .insert({
        title,
        created_by: userId,
        end_date,
      })
      .select()
      .single();

    if (pollError || !poll) {
      console.error('Error creating poll:', pollError);
      return null;
    }

    // Create poll options from the provided option texts
    const pollOptionsData = optionTexts.map((option) => ({
      poll_id: poll.id,
      text: option,
    }));

    const { data: options, error: optionsError } = await this.supabase
      .from('poll_options')
      .insert(pollOptionsData)
      .select();

    if (optionsError) {
      console.error('Error creating poll options:', optionsError);
      // In a real app, you might want to delete the poll if options creation fails
      return null;
    }

    // Initialize analytics tracking for this poll
    await this.supabase.from('poll_analytics').insert({
      poll_id: poll.id,
      views: 0,
      shares: 0,
    });

    // Return the complete poll with its options
    return {
      ...poll,
      options: options || [],
    };
  }

  /**
   * Retrieves a poll by its ID with all associated options and vote count
   * 
   * @param id - The unique identifier of the poll to retrieve
   * @returns The poll with its options and vote count, or null if not found
   */
  async getPollById(id: string): Promise<PollWithOptions | null> {
    // Fetch poll with its options and vote count in a single query
    const { data, error } = await this.supabase
      .from('polls')
      .select('*, poll_options(*), votes(count)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching poll:', error);
      return null;
    }

    // Destructure the nested data from the response
    const { poll_options, votes, ...poll } = data;

    // Format the response to match the PollWithOptions type
    return {
      ...poll,
      options: poll_options || [],
      _count: {
        votes: votes[0]?.count || 0,
      },
    };
  }

  /**
   * Retrieves all polls with their options and vote counts
   * 
   * Returns polls sorted by creation date (newest first)
   * 
   * @returns Array of polls with their options and vote counts
   */
  async getAllPolls(): Promise<PollWithOptions[]> {
    // Fetch all polls with their options and vote counts
    const { data, error } = await this.supabase
      .from('polls')
      .select('*, poll_options(*), votes(count)')
      .order('created_at', { ascending: false }); // Sort by newest first

    if (error || !data) {
      console.error('Error fetching polls:', error);
      return [];
    }

    // Transform the data to match the PollWithOptions type
    return data.map((p) => {
      const { poll_options, votes, ...poll } = p;
      return {
        ...poll,
        options: poll_options || [],
        _count: {
          votes: votes[0]?.count || 0,
        },
      };
    });
  }

  /**
   * Retrieves all polls created by a specific user
   * 
   * Returns polls sorted by creation date (newest first)
   * 
   * @param userId - The ID of the user whose polls to retrieve
   * @returns Array of polls with their options and vote counts
   */
  async getUserPolls(userId: string): Promise<PollWithOptions[]> {
    // Fetch all polls created by the specified user
    const { data, error } = await this.supabase
      .from('polls')
      .select('*, poll_options(*), votes(count)')
      .eq('created_by', userId) // Filter by user ID
      .order('created_at', { ascending: false }); // Sort by newest first

    if (error || !data) {
      console.error('Error fetching user polls:', error);
      return [];
    }

    // Transform the data to match the PollWithOptions type
    return data.map((p) => {
      const { poll_options, votes, ...poll } = p;
      return {
        ...poll,
        options: poll_options || [],
        _count: {
          votes: votes[0]?.count || 0,
        },
      };
    });
  }

  /**
   * Deletes a poll and all its associated data
   * 
   * Thanks to Supabase's cascading deletes, this will also delete all options,
   * votes, and analytics data associated with the poll.
   * 
   * @param id - The ID of the poll to delete
   * @throws Error if deletion fails
   */
  async deletePoll(id: string): Promise<void> {
    const { error } = await this.supabase.from('polls').delete().eq('id', id);

    if (error) {
      console.error('Error deleting poll:', error);
      throw new Error('Failed to delete poll');
    }
    // No return value needed for successful deletion
  }

  /**
   * Updates an existing poll and its options
   * 
   * This method updates the poll details and replaces all existing options with new ones.
   * Note that this is not a transactional operation - if any step fails, the poll may be left
   * in an inconsistent state.
   * 
   * @param id - The ID of the poll to update
   * @param data - The updated poll data including title, end date, and options
   * @returns The updated poll with its new options, or null if update failed
   */
  async updatePoll(id: string, data: CreatePollInput): Promise<PollWithOptions | null> {
    const { title, end_date, options: optionTexts } = data;
    
    // This operation is not transactional. If deleting old options or creating new ones fails,
    // the poll update might be partial. For robust applications, consider a database transaction.
    const { data: poll, error: pollError } = await this.supabase
      .from('polls')
      .update({
        title,
        end_date,
      })
      .eq('id', id)
      .select()
      .single();

    if (pollError || !poll) {
      console.error('Error updating poll:', pollError);
      return null;
    }

    // Delete all existing options for this poll
    const { error: deleteError } = await this.supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', id);

    if (deleteError) {
      console.error('Error deleting old options:', deleteError);
      return null;
    }

    // Create new options with position information
    const pollOptionsData = optionTexts.map((option, index) => ({
      poll_id: id,
      text: option,
      position: index, // Store the order of options
    }));

    const { data: options, error: optionsError } = await this.supabase
      .from('poll_options')
      .insert(pollOptionsData)
      .select();

    if (optionsError) {
      console.error('Error creating new options:', optionsError);
      return null;
    }

    // Return the updated poll with its new options
    return {
      ...poll,
      options: options || [],
    };
  }
}
