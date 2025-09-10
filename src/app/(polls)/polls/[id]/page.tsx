"use client";

/**
 * Poll Detail Page Component
 * 
 * This component displays a single poll with its options and voting results.
 * It allows users to view poll details, vote on polls, and for poll owners,
 * provides options to edit or delete their polls.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PollWithOptions } from '@/lib/types/poll';

// NOTE: We are not using the repository here because this is a client component.
// We would need to set up a server action or a separate API route to fetch the poll data
// if we wanted to use the repository pattern here.

/**
 * Helper function to format dates in a human-readable format
 * Calculates the difference between the current date and the provided date
 * 
 * @param date - The date to format
 * @param options - Formatting options (addSuffix determines if "ago" or similar text is added)
 * @returns A human-readable string representing the time difference
 */
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

/**
 * Props interface for the PollPage component
 */
interface PollPageProps {
  params: {
    id: string; // Poll ID from the URL parameter
  };
}

/**
 * Poll detail page component
 * Displays a single poll with its options and voting results
 * 
 * @param params - Object containing the poll ID from the URL
 */
export default function PollPage({ params }: PollPageProps) {
  const { id } = params;
  const { user } = useAuth(); // Get current user for ownership checks
  const router = useRouter();
  // State for poll data, loading status, and error handling
  const [poll, setPoll] = useState<PollWithOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch poll data when component mounts or ID changes
   * Retrieves poll details from the API
   */
  useEffect(() => {
    async function fetchPoll() {
      try {
        // Fetch poll data from the API
        const response = await fetch(`/api/polls/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch poll');
        }
        const data = await response.json();
        setPoll(data.poll);
      } catch (err) {
        // Handle and display any errors
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        // Update loading state regardless of outcome
        setLoading(false);
      }
    }
    fetchPoll();
  }, [id]); // Re-fetch when poll ID changes

  /**
   * Handle poll deletion
   * Confirms with user before deleting and redirects on success
   */
  const handleDelete = async () => {
    // Confirm deletion with the user before proceeding
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        // Send delete request to the API
        const response = await fetch(`/api/polls/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete poll');
        }

        // Redirect to polls list on successful deletion
        router.push('/polls');
      } catch (err) {
        // Handle and display any errors
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };

  // Display loading state while fetching poll data
  if (loading) {
    return <div className="container mx-auto py-10 px-4 text-center">Loading...</div>;
  }

  // Display error message if fetch failed
  if (error) {
    return <div className="container mx-auto py-10 px-4 text-center text-red-500">{error}</div>;
  }

  // Show 404 page if poll doesn't exist
  if (!poll) {
    notFound();
  }
  
  // Calculate total votes across all options for percentage calculations
  const totalVotes = poll.options.reduce((sum: number, option: any) => sum + (option.votes || 0), 0);
  
  // Check if current user is the poll creator to show edit/delete options
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
        
        {/* Poll options with vote counts and percentage bars */}
        <div className="space-y-4">
          {poll.options.map((option: any) => {
            // Calculate percentage of votes for this option
            const percentage = totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
            
            return (
              <div key={option.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{option.text}</span>
                  {/* Display vote count and percentage */}
                  <span className="text-gray-600">{option.votes || 0} votes ({percentage}%)</span>
                </div>
                {/* Visual progress bar representing vote percentage */}
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
        
        {/* Voting button and poll end date information */}
        <div className="mt-8">
          {/* Primary action button for voting */}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Vote Now
          </button>
          
          {/* Display poll end date if available */}
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