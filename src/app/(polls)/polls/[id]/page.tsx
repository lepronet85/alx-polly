import React from 'react';
import Link from 'next/link';

// Mock data for a single poll
const mockPollOptions = [
  { id: '1', text: 'JavaScript', votes: 78 },
  { id: '2', text: 'Python', votes: 45 },
  { id: '3', text: 'Java', votes: 12 },
  { id: '4', text: 'C#', votes: 10 },
];

interface PollPageProps {
  params: {
    id: string;
  };
}

export default function PollPage({ params }: PollPageProps) {
  const { id } = params;
  
  // In a real app, you would fetch the poll data based on the ID
  const pollTitle = 'Favorite Programming Language';
  const totalVotes = mockPollOptions.reduce((sum, option) => sum + option.votes, 0);
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/polls"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Polls
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">{pollTitle}</h1>
        <p className="text-gray-600 mb-6">Poll ID: {id} • Total Votes: {totalVotes}</p>
        
        <div className="space-y-4">
          {mockPollOptions.map((option) => {
            const percentage = Math.round((option.votes / totalVotes) * 100) || 0;
            
            return (
              <div key={option.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-gray-600">{option.votes} votes ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Vote Now
          </button>
        </div>
      </div>
    </div>
  );
}