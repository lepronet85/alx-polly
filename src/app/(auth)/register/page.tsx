import React from 'react';

export default function RegisterPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Create an Account</h1>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
}