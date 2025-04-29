import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export const auth = {
  // Sign in with GitHub
  signInWithGithub: async () => {
    // Record current login provider
    localStorage.setItem('auth_provider', 'github');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?provider=github`,
        skipBrowserRedirect: false,
      },
    });
    return { data, error };
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    // Record current login provider
    localStorage.setItem('auth_provider', 'google');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?provider=google`,
        skipBrowserRedirect: false,
      },
    });
    return { data, error };
  },

  // Sign in with Discord
  signInWithDiscord: async () => {
    // Record current login provider
    localStorage.setItem('auth_provider', 'discord');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?provider=discord`,
        skipBrowserRedirect: false,
      },
    });
    return { data, error };
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Get current user
  getUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
};

export default supabase;
