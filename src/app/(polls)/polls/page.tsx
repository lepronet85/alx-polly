import React from 'react';
import Link from 'next/link';
import { PollRepository } from '@/lib/repositories/poll-repository';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Format date helper function
const formatDistanceToNow = (date: Date, options: { addSuffix: boolean }) => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return options.addSuffix ? 'today' : 'Today';
  } else if (diffInDays === 1) {
    return options.addSuffix ? 'yesterday' : 'Yesterday';
  } else {
    return options.addSuffix ? `${diffInDays} days ago` : `${diffInDays} days`;
  }
};

async function getPolls() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const pollRepository = new PollRepository(supabase);
    const pollsWithOptions = await pollRepository.getAllPolls();
    return pollsWithOptions || [];
  } catch (error) {
    console.error('Error fetching polls:', error);
    return [];
  }
}

export default async function PollsPage() {
  const polls = await getPolls();
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Polls</h1>
        <Link 
          href="/create-poll"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Create New Poll
        </Link>
      </div>
      
      {polls.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No polls have been created yet.</p>
          <Link 
            href="/create-poll"
            className="text-blue-600 hover:underline"
          >
            Create the first poll
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll: any) => (
            <Link key={poll.id} href={`/polls/${poll.id}`}>
              <div className="border rounded-lg p-6 hover:shadow-md transition cursor-pointer bg-white">
                <h2 className="text-xl font-semibold mb-2">{poll.title}</h2>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{poll.total_votes || 0} votes</span>
                  <span>Created: {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}