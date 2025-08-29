import React from 'react';
import Link from 'next/link';

// Mock data for polls
const mockPolls = [
  { id: '1', title: 'Favorite Programming Language', votes: 145, createdAt: '2023-10-15' },
  { id: '2', title: 'Best Frontend Framework', votes: 89, createdAt: '2023-10-12' },
  { id: '3', title: 'Most Important Developer Skill', votes: 217, createdAt: '2023-10-10' },
  { id: '4', title: 'Preferred Database', votes: 76, createdAt: '2023-10-08' },
];

export default function PollsPage() {
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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockPolls.map((poll) => (
          <Link key={poll.id} href={`/polls/${poll.id}`}>
            <div className="border rounded-lg p-6 hover:shadow-md transition cursor-pointer bg-white">
              <h2 className="text-xl font-semibold mb-2">{poll.title}</h2>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{poll.votes} votes</span>
                <span>Created: {poll.createdAt}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}