import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { auth, supabase } from '../services/supabase';
import { web3AuthService, getStoredUser, getWalletBalance } from '../services/web3Auth';

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

        // First check for web3 wallet user
        const web3User = getStoredUser();
        if (web3User) {
          console.log("AuthContext: Web3 user found", web3User);
          setUser(web3User);
          setLoading(false);
          return;
        }

        // If no web3 user, check Supabase session
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

        // Only update if there's no web3 user
        const web3User = getStoredUser();
        if (!web3User) {
          setUser(session?.user || null);
        }
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

  // Sign in with Solana wallet
  const signInWithSolana = async () => {
    try {
      console.log("AuthContext: Starting Solana wallet login flow");

      // Record current login provider
      localStorage.setItem('auth_provider', 'solana');

      setLoading(true);
      setError(null); // Clear previous errors

      // Check if Solana wallet is available
      if (!web3AuthService.hasSolanaWallet()) {
        console.error("AuthContext: No Solana wallet detected");
        setError(new Error("No Solana wallet detected. Please install a Solana wallet extension like Phantom."));
        return;
      }

      // Connect to Solana wallet
      const { publicKey } = await web3AuthService.connectSolanaWallet();

      if (!publicKey) {
        console.error("AuthContext: Failed to connect to Solana wallet");
        setError(new Error("Failed to connect to Solana wallet. Please try again."));
        return;
      }

      console.log("AuthContext: Connected to Solana wallet", publicKey.toString());

      // Sign in with Solana wallet
      const userProfile = await web3AuthService.signInWithSolana(publicKey);

      console.log("AuthContext: Solana login successful", userProfile);

      // Set user in context
      setUser(userProfile);

      return userProfile;
    } catch (err) {
      console.error('Error signing in with Solana wallet:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Update wallet balance
  const updateWalletBalance = async () => {
    try {
      // Only update if user is a web3 user
      if (user && user.type === 'solana' && user.address) {
        setLoading(true);

        // Get updated balance
        const balance = await getWalletBalance(user.address);

        // Update user state with new balance
        setUser(prevUser => ({
          ...prevUser,
          balance,
          updatedAt: new Date()
        }));

        return balance;
      }
      return null;
    } catch (err) {
      console.error('Error updating wallet balance:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);

      // Check if user is a web3 user
      const web3User = getStoredUser();
      if (web3User) {
        // Disconnect web3 wallet
        await web3AuthService.disconnectWallet();
        setUser(null);
      } else {
        // Sign out from Supabase
        const { error } = await auth.signOut();
        if (error) setError(error);
      }
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Extract wallet information using useMemo
  const walletInfo = useMemo(() => {
    if (user && user.type === 'solana') {
      return {
        address: user.address || null,
        balance: user.balance || 0,
        isWeb3User: true
      };
    }
    return {
      address: null,
      balance: 0,
      isWeb3User: false
    };
  }, [user]);

  // Values provided to the context
  const value = {
    user,
    loading,
    error,
    // Wallet specific information
    address: walletInfo.address,
    balance: walletInfo.balance,
    isWeb3User: walletInfo.isWeb3User,
    updateWalletBalance,
    // Auth methods
    signInWithGithub,
    signInWithGoogle,
    signInWithDiscord,
    signInWithSolana,
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
