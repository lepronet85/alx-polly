import React from 'react';

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
        <p className="mb-4 text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
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
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline">Back to Login</a>
        </div>
      </div>
    </div>
  );
}