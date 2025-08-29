import React from 'react';
import Link from 'next/link';

export default function CreatePollPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/polls"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Polls
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Create a New Poll</h1>
        
        <form className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">Poll Question</label>
            <input
              id="title"
              type="text"
              placeholder="Enter your question"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Poll Options</label>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Option ${index}`}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  {index > 2 && (
                    <button 
                      type="button"
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              + Add Another Option
            </button>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-medium">End Date (Optional)</label>
            <input
              id="endDate"
              type="date"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}