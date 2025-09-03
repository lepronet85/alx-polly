import { createClient } from '@/lib/supabase/client';
import { CreatePollInput, Poll, PollOption, PollWithOptions } from '@/lib/types/poll';
import { SupabaseClient } from '@supabase/supabase-js';

export class PollRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async createPoll(data: CreatePollInput, userId: string): Promise<PollWithOptions | null> {
    // Start a transaction by using a single connection
    const { data: poll, error: pollError } = await this.supabase
      .from('polls')
      .insert({
        title: data.title,
        created_by: userId,
        end_date: data.end_date,
      })
      .select()
      .single();

    if (pollError || !poll) {
      console.error('Error creating poll:', pollError);
      return null;
    }

    // Create poll options
    const pollOptionsData = data.options.map((option) => ({
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

    // Create analytics entry
    await this.supabase
      .from('poll_analytics')
      .insert({
        poll_id: poll.id,
        views: 0,
        shares: 0,
      });

    return {
      ...poll,
      options: options || [],
    };
  }

  async getPollById(id: string): Promise<PollWithOptions | null> {
    const { data: poll, error: pollError } = await this.supabase
      .from('polls')
      .select('*')
      .eq('id', id)
      .single();

    if (pollError || !poll) {
      console.error('Error fetching poll:', pollError);
      return null;
    }

    const { data: options, error: optionsError } = await this.supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', id);

    if (optionsError) {
      console.error('Error fetching poll options:', optionsError);
      return null;
    }

    // Get vote count
    const { count, error: countError } = await this.supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('poll_id', id);

    return {
      ...poll,
      options: options || [],
      _count: {
        votes: count || 0,
      },
    };
  }

  async getAllPolls(): Promise<PollWithOptions[]> {
    const { data: polls, error: pollsError } = await this.supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });

    if (pollsError || !polls) {
      console.error('Error fetching polls:', pollsError);
      return [];
    }

    // For each poll, get its options
    const pollsWithOptions = await Promise.all(
      polls.map(async (poll) => {
        const { data: options } = await this.supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', poll.id);

        // Get vote count
        const { count } = await this.supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('poll_id', poll.id);

        return {
          ...poll,
          options: options || [],
          _count: {
            votes: count || 0,
          },
        };
      })
    );

    return pollsWithOptions;
  }

  async getUserPolls(userId: string): Promise<PollWithOptions[]> {
    const { data: polls, error: pollsError } = await this.supabase
      .from('polls')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (pollsError || !polls) {
      console.error('Error fetching user polls:', pollsError);
      return [];
    }

    // For each poll, get its options
    const pollsWithOptions = await Promise.all(
      polls.map(async (poll) => {
        const { data: options } = await this.supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', poll.id);

        // Get vote count
        const { count } = await this.supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('poll_id', poll.id);

        return {
          ...poll,
          options: options || [],
          _count: {
            votes: count || 0,
          },
        };
      })
    );

    return pollsWithOptions;
  }

  async deletePoll(id: string): Promise<void> {
    const { error } = await this.supabase.from('polls').delete().eq('id', id);

    if (error) {
      console.error('Error deleting poll:', error);
      throw new Error('Failed to delete poll');
    }
  }

  async updatePoll(id: string, data: CreatePollInput): Promise<PollWithOptions | null> {
    const { data: poll, error: pollError } = await this.supabase
      .from('polls')
      .update({
        title: data.title,
        end_date: data.end_date,
      })
      .eq('id', id)
      .select()
      .single();

    if (pollError) {
      console.error('Error updating poll:', pollError);
      return null;
    }

    // Delete old options
    const { error: deleteError } = await this.supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', id);

    if (deleteError) {
      console.error('Error deleting old options:', deleteError);
      return null;
    }

    // Create new options
    const pollOptionsData = data.options.map((option, index) => ({
      poll_id: id,
      text: option,
      position: index,
    }));

    const { data: options, error: optionsError } = await this.supabase
      .from('poll_options')
      .insert(pollOptionsData)
      .select();

    if (optionsError) {
      console.error('Error creating new options:', optionsError);
      return null;
    }

    return {
      ...poll,
      options: options || [],
    };
  }
}