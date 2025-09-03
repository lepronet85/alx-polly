"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PollWithOptions } from '@/lib/types/poll';

// NOTE: We are not using the repository here because this is a client component.
// We would need to set up a server action or a separate API route to fetch the poll data
// if we wanted to use the repository pattern here.

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

interface PollPageProps {
  params: {
    id: string;
  };
}

export default function PollPage({ params }: PollPageProps) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [poll, setPoll] = useState<PollWithOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPoll() {
      try {
        const response = await fetch(`/api/polls/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch poll');
        }
        const data = await response.json();
        setPoll(data.poll);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchPoll();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        const response = await fetch(`/api/polls/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete poll');
        }

        router.push('/polls');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10 px-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-10 px-4 text-center text-red-500">{error}</div>;
  }

  if (!poll) {
    notFound();
  }
  
  const totalVotes = poll.options.reduce((sum: number, option: any) => sum + (option.votes || 0), 0);
  const isOwner = user?.id === poll.created_by;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/polls"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Polls
        </Link>

        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold mb-6">{poll.title}</h1>
          {isOwner && (
            <div className="flex gap-2">
              <Link href={`/polls/${poll.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
              <button onClick={handleDelete} className="text-red-600 hover:underline">Delete</button>
            </div>
          )}
        </div>
        
        <div className="flex justify-between text-gray-600 mb-6">
          <p>Total Votes: {totalVotes}</p>
          <p>Created: {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</p>
        </div>
        
        <div className="space-y-4">
          {poll.options.map((option: any) => {
            const percentage = totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
            
            return (
              <div key={option.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-gray-600">{option.votes || 0} votes ({percentage}%)</span>
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
          {poll.end_date && (
            <p className="text-gray-500 mt-2">
              This poll ends {formatDistanceToNow(new Date(poll.end_date), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}