import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Polly
            </Link>
            <p className="text-gray-600 mt-2">Create and share polls with ease.</p>
          </div>
          
          <div className="flex space-x-6">
            <Link href="/about" className="text-gray-600 hover:text-blue-600">
              About
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-600">
              Terms
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Polly. All rights reserved.
        </div>
      </div>
    </footer>
  );
}