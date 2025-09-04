import { PollRepository } from "./poll-repository";
import { createClient } from "@/lib/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

jest.mock("@/lib/supabase/client");

describe("PollRepository", () => {
  let supabase: jest.Mocked<SupabaseClient>;
  let pollRepository: PollRepository;

  beforeEach(() => {
    // A flexible mock that can be configured in each test
    supabase = {
      from: jest.fn(),
    } as unknown as jest.Mocked<SupabaseClient>;

    (createClient as jest.Mock).mockReturnValue(supabase);
    pollRepository = new PollRepository(supabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPoll", () => {
    it("should create a poll and return it", async () => {
      const pollData = {
        title: "Test Poll",
        options: ["Option 1", "Option 2"],
        end_date: new Date().toISOString(),
      };
      const userId = "user-id";
      const createdPoll = { id: "poll-id", title: "Test Poll", created_by: userId, end_date: pollData.end_date };
      const createdOptions = [
        { id: "opt-1", text: "Option 1" },
        { id: "opt-2", text: "Option 2" },
      ];

      const fromMock = jest.fn((table: string) => {
        if (table === "polls") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: createdPoll, error: null }),
              }),
            }),
          };
        }
        if (table === "poll_options") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: createdOptions, error: null }),
            }),
          };
        }
        if (table === "poll_analytics") {
          return {
            insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: new Error('Unexpected table')}),
        }
      });
      supabase.from = fromMock;


      const result = await pollRepository.createPoll(pollData, userId);

      expect(result).toEqual({ ...createdPoll, options: createdOptions });
      expect(fromMock).toHaveBeenCalledWith("polls");
      expect(fromMock).toHaveBeenCalledWith("poll_options");
      expect(fromMock).toHaveBeenCalledWith("poll_analytics");
    });
  });

  describe("getPollById", () => {
    it("should return a poll by id with options and vote count", async () => {
      const pollId = "poll-id";
      const dbResult = {
        id: pollId,
        title: "Test Poll",
        poll_options: [{ id: "opt-1", text: "Option 1", poll_id: pollId }],
        votes: [{ count: 10 }],
      };
      
      const singleMock = jest.fn().mockResolvedValue({ data: dbResult, error: null });
      const eqMock = jest.fn().mockReturnValue({ single: singleMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const result = await pollRepository.getPollById(pollId);

      expect(supabase.from).toHaveBeenCalledWith("polls");
      expect(selectMock).toHaveBeenCalledWith("*, poll_options(*), votes(count)");
      expect(eqMock).toHaveBeenCalledWith("id", pollId);
      
      const { poll_options, votes, ...poll } = dbResult;
      expect(result).toEqual({
        ...poll,
        options: poll_options,
        _count: { votes: 10 },
      });
    });
  });

  describe("getAllPolls", () => {
    it("should return all polls with options and vote counts", async () => {
      const dbResult = [
        {
          id: "poll-1",
          title: "Poll 1",
          poll_options: [{ id: "opt-1", text: "Option 1", poll_id: "poll-1" }],
          votes: [{ count: 5 }],
        },
        {
          id: "poll-2",
          title: "Poll 2",
          poll_options: [],
          votes: [],
        },
      ];

      const orderMock = jest.fn().mockResolvedValue({ data: dbResult, error: null });
      const selectMock = jest.fn().mockReturnValue({ order: orderMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const result = await pollRepository.getAllPolls();

      expect(supabase.from).toHaveBeenCalledWith("polls");
      expect(selectMock).toHaveBeenCalledWith("*, poll_options(*), votes(count)");
      expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });

      expect(result).toEqual([
        {
          id: "poll-1",
          title: "Poll 1",
          options: [{ id: "opt-1", text: "Option 1", poll_id: "poll-1" }],
          _count: { votes: 5 },
        },
        {
          id: "poll-2",
          title: "Poll 2",
          options: [],
          _count: { votes: 0 },
        },
      ]);
    });
  });

  describe("deletePoll", () => {
    it("should delete a poll", async () => {
      const pollId = "poll-id";
      const eqMock = jest.fn().mockResolvedValue({ error: null });
      const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
      supabase.from.mockReturnValue({ delete: deleteMock });

      await pollRepository.deletePoll(pollId);

      expect(supabase.from).toHaveBeenCalledWith("polls");
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith("id", pollId);
    });
  });

  describe("updatePoll", () => {
    it("should update a poll", async () => {
      const pollId = "poll-id";
      const pollData = { title: "Updated Poll", options: ["New Option"], end_date: new Date().toISOString() };
      const updatedPoll = { id: pollId, title: "Updated Poll", end_date: pollData.end_date };
      const newOptions = [{ id: "new-opt-1", text: "New Option" }];

      const fromMock = jest.fn((table: string) => {
        if (table === "polls") {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: updatedPoll, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === "poll_options") {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: newOptions, error: null }),
            }),
          };
        }
        return {};
      });
      supabase.from = fromMock;

      const result = await pollRepository.updatePoll(pollId, pollData);

      expect(result).toEqual({ ...updatedPoll, options: newOptions });
      expect(fromMock).toHaveBeenCalledWith("polls");
      expect(fromMock).toHaveBeenCalledWith("poll_options");
    });
  });
});