import { Database } from '@/lib/types/supabase';

export type Poll = Database['public']['Tables']['polls']['Row'];
export type PollInsert = Database['public']['Tables']['polls']['Insert'];

export type PollOption = Database['public']['Tables']['poll_options']['Row'];
export type PollOptionInsert = Database['public']['Tables']['poll_options']['Insert'];

export type Vote = Database['public']['Tables']['votes']['Row'];
export type VoteInsert = Database['public']['Tables']['votes']['Insert'];

export type PollWithOptions = Poll & {
  options: PollOption[];
  _count?: {
    votes: number;
  };
};

export type CreatePollInput = {
  title: string;
  options: string[];
  end_date?: string | null;
};