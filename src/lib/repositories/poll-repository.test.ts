
import { PollRepository } from './poll-repository';
import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

jest.mock('@/lib/supabase/client');

describe('PollRepository', () => {
  let supabase: jest.Mocked<SupabaseClient>;
  let pollRepository: PollRepository;

  beforeEach(() => {
    supabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<SupabaseClient>;

    (createClient as jest.Mock).mockReturnValue(supabase);
    pollRepository = new PollRepository(supabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPoll', () => {
    it('should create a poll and return it', async () => {
      const pollData = { title: 'Test Poll', options: ['Option 1', 'Option 2'] };
      const userId = 'user-id';
      const createdPoll = { id: 'poll-id', ...pollData, created_by: userId };
      const createdOptions = [{ id: 'opt-1', text: 'Option 1' }, { id: 'opt-2', text: 'Option 2' }];

      // @ts-ignore
      supabase.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: createdPoll, error: null }),
              }),
            }),
          };
        } else if (table === 'poll_options') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: createdOptions, error: null }),
            }),
          };
        } else if (table === 'poll_analytics') {
            return {
              insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
            };
        }
      });

      const result = await pollRepository.createPoll(pollData, userId);

      expect(result).toEqual({ ...createdPoll, options: createdOptions });
    });
  });

  describe('getPollById', () => {
    it('should return a poll by id', async () => {
        const pollId = 'poll-id';
        const poll = { id: pollId, title: 'Test Poll' };
        const options = [{ id: 'opt-1', text: 'Option 1' }];
        const votes = { count: 10 };
  
        // @ts-ignore
        supabase.from.mockImplementation((table: string) => {
          if (table === 'polls') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: poll, error: null }),
              }),
            };
          } else if (table === 'poll_options') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({ data: options, error: null }),
            };
          } else if (table === 'votes') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ count: votes.count, error: null }),
              }),
            };
          }
        });
  
        const result = await pollRepository.getPollById(pollId);
  
        expect(result).toEqual({ ...poll, options, _count: { votes: votes.count } });
      });
  });

  describe('getAllPolls', () => {
    it('should return all polls', async () => {
        const polls = [{ id: 'poll-1', title: 'Poll 1' }];
        const options = [{ id: 'opt-1', text: 'Option 1' }];
        const votes = { count: 5 };
  
        // @ts-ignore
        supabase.from.mockImplementation((table: string) => {
          if (table === 'polls') {
            return {
              select: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: polls, error: null }),
              }),
            };
          } else if (table === 'poll_options') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({ data: options, error: null }),
            };
          } else if (table === 'votes') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ count: votes.count, error: null }),
              }),
            };
          }
        });
  
        const result = await pollRepository.getAllPolls();
  
        expect(result).toEqual([{ ...polls[0], options, _count: { votes: votes.count } }]);
      });
  });

  describe('deletePoll', () => {
    it('should delete a poll', async () => {
        const pollId = 'poll-id';

        // @ts-ignore
        supabase.from.mockReturnValue({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        });
  
        await pollRepository.deletePoll(pollId);
  
        expect(supabase.from).toHaveBeenCalledWith('polls');
      });
  });

  describe('updatePoll', () => {
    it('should update a poll', async () => {
        const pollId = 'poll-id';
        const pollData = { title: 'Updated Poll', options: ['New Option'] };
        const updatedPoll = { id: pollId, ...pollData };
        const newOptions = [{ id: 'new-opt-1', text: 'New Option' }];
  
        // @ts-ignore
        supabase.from.mockImplementation((table: string) => {
          if (table === 'polls') {
            return {
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: updatedPoll, error: null }),
                  }),
                }),
              }),
            };
          } else if (table === 'poll_options') {
            return {
              delete: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
              }),
              insert: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({ data: newOptions, error: null }),
              }),
            };
          }
        });
  
        const result = await pollRepository.updatePoll(pollId, pollData);
  
        expect(result).toEqual({ ...updatedPoll, options: newOptions });
      });
  });
});
