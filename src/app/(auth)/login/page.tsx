"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/polls");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log("Attempting to sign in with:", { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        return;
      }

      console.log("Login successful:", data);

      // Force refresh the session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Session after login:", sessionData);

      router.push("/polls");
    } catch (err) {
      console.error("Exception during login:", err);
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <a href="/register" className="text-blue-600 hover:underline">
            Don&apos;t have an account? Register
          </a>
        </div>
        <div className="mt-2 text-center text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}
