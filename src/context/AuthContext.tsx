"use client";

/**
 * Authentication Context Module
 * 
 * This module provides authentication state management for the entire application.
 * It uses Supabase Auth to handle user sessions and provides a React context
 * that makes authentication state available throughout the component tree.
 * 
 * The context includes:
 * - Current user information
 * - Session data
 * - Loading state to handle initial authentication check
 */

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";

/**
 * Type definition for the authentication context
 * Contains user information, session data, and loading state
 */
type AuthContextType = {
  user: User | null;      // Current authenticated user or null if not authenticated
  session: Session | null; // Current session data or null if no active session
  loading: boolean;       // Indicates if authentication state is still being determined
};

// Create the authentication context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true, // Start with loading state true until we check auth status
});

/**
 * AuthProvider Component
 * 
 * Provides authentication state to the application by wrapping components
 * with the AuthContext.Provider. Handles session retrieval and listens for
 * authentication state changes using Supabase Auth.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 * @returns {JSX.Element} AuthContext Provider with children
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  // State for current user, session, and loading status
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Retrieves the current session from Supabase Auth
     * Updates the user and session state based on the result
     */
    const getSession = async () => {
      try {
        console.log("Getting session...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }

        console.log("Session data:", data);
        // Update state with session data
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error("Exception getting session:", err);
        setLoading(false);
      }
    };

    // Get initial session when component mounts
    getSession();

    // Set up listener for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        // Update state when auth changes (login, logout, etc.)
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup subscription when component unmounts to prevent memory leaks
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]); // Re-run effect if supabase client changes

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * 
 * Provides easy access to the current authentication state throughout the application.
 * Must be used within components that are descendants of AuthProvider.
 * 
 * @returns {AuthContextType} The current authentication context with user, session, and loading state
 */
export const useAuth = () => useContext(AuthContext);
