'use client'

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, loading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Polly
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/polls" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Polls
            </Link>
            <Link href="/create-poll" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Create Poll
            </Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <span className="text-gray-700">{user.email}</span>
                    <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                      Login
                    </Link>
                    <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
          
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
