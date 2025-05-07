import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, supabase } from '../services/supabase';

// Create authentication context
const AuthContext = createContext(null);

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check user session on initialization
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        console.log("AuthContext: Checking current user session");

        // Check Supabase session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setError(error);
          return;
        }

        console.log("AuthContext: Session data", data);

        if (data.session) {
          console.log("AuthContext: User logged in", data.session.user);
          setUser(data.session.user);
        } else {
          console.log("AuthContext: User not logged in");
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // Check current user
    checkUser();

    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // console.log("AuthContext: Authentication state changed", event, session?.user);
        setUser(session?.user || null);
      }
    );

    // Clean up listener
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Sign in with GitHub
  const signInWithGithub = async () => {
    try {
      console.log("AuthContext: Starting GitHub login flow");
      console.log("AuthContext: Current environment variables", {
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? "set" : "not set",
        ORIGIN: window.location.origin,
        REDIRECT_URL: `${window.location.origin}/auth/callback`
      });

      // Record current login provider
      localStorage.setItem('auth_provider', 'github');

      setLoading(true);
      setError(null); // Clear previous errors

      // Directly use supabase client for OAuth login
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?provider=github`,
          skipBrowserRedirect: false, // Ensure browser redirect is not skipped
        },
      });

      console.log("AuthContext: GitHub login response", { data, error });

      if (error) {
        console.error("AuthContext: GitHub login error", error);
        setError(error);
        return;
      }

      // If no error but also no redirect, browser might have blocked the popup
      if (!data?.url) {
        console.error("AuthContext: Failed to get OAuth URL");
        setError(new Error("Login failed: Could not get authorization URL, please check if your browser is blocking popups"));
        return;
      }

      // Normally, supabase will automatically redirect to the OAuth provider
      console.log("AuthContext: Redirecting to OAuth URL", data.url);

      // Force redirect to OAuth URL
      setTimeout(() => {
        console.log("AuthContext: Executing manual redirect");
        window.location.href = data.url;
      }, 500); // Delay 500ms to ensure logs are printed

    } catch (err) {
      console.error('Error signing in with GitHub:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      console.log("AuthContext: Starting Google login flow");

      // Record current login provider
      localStorage.setItem('auth_provider', 'google');

      setLoading(true);
      setError(null); // Clear previous errors

      // Directly use supabase client for OAuth login
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?provider=google`,
          skipBrowserRedirect: false, // Ensure browser redirect is not skipped
        },
      });

      console.log("AuthContext: Google login response", { data, error });

      if (error) {
        console.error("AuthContext: Google login error", error);
        setError(error);
        return;
      }

      // If no error but also no redirect, browser might have blocked the popup
      if (!data?.url) {
        console.error("AuthContext: Failed to get OAuth URL");
        setError(new Error("Login failed: Could not get authorization URL, please check if your browser is blocking popups"));
        return;
      }

      // Normally, supabase will automatically redirect to the OAuth provider
      console.log("AuthContext: Redirecting to OAuth URL", data.url);

      // Force redirect to OAuth URL
      setTimeout(() => {
        console.log("AuthContext: Executing manual redirect");
        window.location.href = data.url;
      }, 500); // Delay 500ms to ensure logs are printed
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Discord
  const signInWithDiscord = async () => {
    try {
      console.log("AuthContext: Starting Discord login flow");

      // Record current login provider
      localStorage.setItem('auth_provider', 'discord');

      setLoading(true);
      setError(null); // Clear previous errors

      // Directly use supabase client for OAuth login
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?provider=discord`,
          skipBrowserRedirect: false, // Ensure browser redirect is not skipped
        },
      });

      console.log("AuthContext: Discord login response", { data, error });

      if (error) {
        console.error("AuthContext: Discord login error", error);
        setError(error);
        return;
      }

      // If no error but also no redirect, browser might have blocked the popup
      if (!data?.url) {
        console.error("AuthContext: Failed to get OAuth URL");
        setError(new Error("Login failed: Could not get authorization URL, please check if your browser is blocking popups"));
        return;
      }

      // Normally, supabase will automatically redirect to the OAuth provider
      console.log("AuthContext: Redirecting to OAuth URL", data.url);

      // Force redirect to OAuth URL
      setTimeout(() => {
        console.log("AuthContext: Executing manual redirect");
        window.location.href = data.url;
      }, 500); // Delay 500ms to ensure logs are printed
    } catch (err) {
      console.error('Error signing in with Discord:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Web3 authentication has been completely removed

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);

      // Web3 authentication is disabled, only sign out from Supabase
      const { error } = await auth.signOut();
      if (error) setError(error);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Values provided to the context
  const value = {
    user,
    loading,
    error,
    // Auth methods
    signInWithGithub,
    signInWithGoogle,
    signInWithDiscord,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for accessing the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
