import { createClient } from '@/lib/supabase/client';
import { CreatePollInput, Poll, PollOption, PollWithOptions } from '@/lib/types/poll';
import { SupabaseClient } from '@supabase/supabase-js';

export class PollRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

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

    // Create poll options
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

    // Create analytics entry
    await this.supabase.from('poll_analytics').insert({
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
    const { data, error } = await this.supabase
      .from('polls')
      .select('*, poll_options(*), votes(count)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching poll:', error);
      return null;
    }

    const { poll_options, votes, ...poll } = data;

    return {
      ...poll,
      options: poll_options || [],
      _count: {
        votes: votes[0]?.count || 0,
      },
    };
  }

  async getAllPolls(): Promise<PollWithOptions[]> {
    const { data, error } = await this.supabase
      .from('polls')
      .select('*, poll_options(*), votes(count)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching polls:', error);
      return [];
    }

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

  async getUserPolls(userId: string): Promise<PollWithOptions[]> {
    const { data, error } = await this.supabase
      .from('polls')
      .select('*, poll_options(*), votes(count)')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching user polls:', error);
      return [];
    }

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

  async deletePoll(id: string): Promise<void> {
    const { error } = await this.supabase.from('polls').delete().eq('id', id);

    if (error) {
      console.error('Error deleting poll:', error);
      throw new Error('Failed to delete poll');
    }
  }

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
    const pollOptionsData = optionTexts.map((option, index) => ({
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
