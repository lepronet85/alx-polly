/**
 * Poll Types Module
 * 
 * This module defines TypeScript types for polls, options, and votes based on the
 * Supabase database schema. These types ensure type safety when working with
 * poll-related data throughout the application.
 */

import { Database } from '@/lib/types/supabase';

/**
 * Represents a poll record from the database
 * Maps directly to the 'polls' table schema
 */
export type Poll = Database['public']['Tables']['polls']['Row'];

/**
 * Type for inserting a new poll into the database
 * Used when creating new poll records
 */
export type PollInsert = Database['public']['Tables']['polls']['Insert'];

/**
 * Represents a poll option record from the database
 * Maps directly to the 'poll_options' table schema
 */
export type PollOption = Database['public']['Tables']['poll_options']['Row'];

/**
 * Type for inserting a new poll option into the database
 * Used when creating new poll option records
 */
export type PollOptionInsert = Database['public']['Tables']['poll_options']['Insert'];

/**
 * Represents a vote record from the database
 * Maps directly to the 'votes' table schema
 */
export type Vote = Database['public']['Tables']['votes']['Row'];

/**
 * Type for inserting a new vote into the database
 * Used when recording user votes
 */
export type VoteInsert = Database['public']['Tables']['votes']['Insert'];

/**
 * Extended poll type that includes its options and vote count
 * Used for displaying polls with their complete information
 */
export type PollWithOptions = Poll & {
  options: PollOption[];  // Array of options associated with this poll
  _count?: {              // Optional vote count information
    votes: number;        // Total number of votes across all options
  };
};

/**
 * Input type for creating or updating a poll
 * Used in API requests and form submissions
 */
export type CreatePollInput = {
  title: string;           // The poll question or title
  options: string[];       // Array of option text strings
  end_date?: string | null; // Optional end date in ISO string format
};