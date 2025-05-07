import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client instance
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    autoRefreshToken: true,
    debug: false, // 关闭调试模式
  },
});

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

// Repository submission functions
export const repositories = {
  // Submit a new repository for audit
  submitRepository: async (repositoryUrl) => {
    try {
      // Validate URL format first
      if (typeof repositoryUrl !== 'string') {
        throw new Error('Repository URL must be a string');
      }

      // Sanitize input by ensuring it's a valid GitHub URL
      // Only allow alphanumeric characters, hyphens, and underscores in username and repo name
      const urlPattern = /^https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)$/;
      const match = repositoryUrl.match(urlPattern);

      if (!match || match.length < 3) {
        throw new Error('Invalid GitHub repository URL format');
      }

      const repositoryOwner = match[1];
      const repositoryName = match[2];

      // Get current user
      const user = await auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insert repository submission
      const { data, error } = await supabase
        .from('repository_submissions')
        .insert({
          user_id: user.id,
          repository_url: repositoryUrl,
          repository_name: repositoryName,
          repository_owner: repositoryOwner,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting repository:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in submitRepository:', error);
      return { data: null, error };
    }
  },

  // Get all repositories submitted by the current user
  getUserRepositories: async () => {
    try {
      // Get current user
      const user = await auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get repositories
      const { data, error } = await supabase
        .from('repository_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user repositories:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getUserRepositories:', error);
      return { data: null, error };
    }
  },

  // Get a specific repository submission by ID
  getRepositoryById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('repository_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error getting repository by ID:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getRepositoryById:', error);
      return { data: null, error };
    }
  },

  // Submit multiple repositories at once
  submitMultipleRepositories: async (repositoryUrls) => {
    try {
      // Validate input
      if (!Array.isArray(repositoryUrls)) {
        throw new Error('Repository URLs must be an array');
      }

      // Get current user
      const user = await auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare repository data
      const repositories = repositoryUrls.map(url => {
        // Validate URL type
        if (typeof url !== 'string') {
          throw new Error('Repository URL must be a string');
        }

        // Sanitize input by ensuring it's a valid GitHub URL
        // Only allow alphanumeric characters, hyphens, and underscores in username and repo name
        const urlPattern = /^https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)$/;
        const match = url.match(urlPattern);

        if (!match || match.length < 3) {
          throw new Error(`Invalid GitHub repository URL format: ${url}`);
        }

        const repositoryOwner = match[1];
        const repositoryName = match[2];

        return {
          user_id: user.id,
          repository_url: url,
          repository_name: repositoryName,
          repository_owner: repositoryOwner,
          status: 'pending'
        };
      });

      // Insert all repositories
      const { data, error } = await supabase
        .from('repository_submissions')
        .insert(repositories)
        .select();

      if (error) {
        console.error('Error submitting multiple repositories:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in submitMultipleRepositories:', error);
      return { data: null, error };
    }
  }
};

// Web3 authentication has been completely removed

export default supabase;
