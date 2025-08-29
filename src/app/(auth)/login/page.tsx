import React from 'react';

export default function LoginPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <form className="space-y-4">
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
              placeholder="Enter your password"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <a href="/register" className="text-blue-600 hover:underline">Don&apos;t have an account? Register</a>
        </div>
        <div className="mt-2 text-center text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}