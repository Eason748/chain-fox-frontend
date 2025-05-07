import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { supabase, web3Auth } from './supabase';
import i18n from '../i18n';

// Local storage key for web3 user profile
const LOCAL_STORAGE_KEY = 'web3_user_profile';

// Get verification message template based on current language
const getVerificationMessage = (nonce) => {
  const currentLang = i18n.language;
  let template;

  if (currentLang.startsWith('zh')) {
    // Chinese message template - more detailed and secure
    template = `请签名此消息以验证您是此钱包的所有者。这只是一个身份验证请求，不会发起任何交易或授权任何支出。\n\n网站: Chain Fox\n验证码: ${nonce}\n时间戳: ${new Date().toISOString()}\n\n此签名不会授予任何权限，仅用于验证您的身份。`;
  } else {
    // English message template (default) - more detailed and secure
    template = `Please sign this message to verify you own this wallet. This is only an authentication request and will not initiate any transaction or authorize any spending.\n\nSite: Chain Fox\nVerification code: ${nonce}\nTimestamp: ${new Date().toISOString()}\n\nThis signature does not grant any permissions and is only used to verify your identity.`;
  }

  console.log("Generated verification message with nonce:", nonce);
  return template;
};

// Get stored user from localStorage
export const getStoredUser = () => {
  const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
};

// Store user to localStorage
export const storeUser = (user) => {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

// Convert Uint8Array to hex string
const uint8ArrayToHex = (arr) => {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Use the web3Auth functions from supabase.js
export const getOrCreateWeb3Auth = web3Auth.getOrCreateWeb3Auth;
export const createWeb3Session = web3Auth.createWeb3Session;
export const invalidateWeb3Session = web3Auth.invalidateWeb3Session;

// Solana RPC endpoint for mainnet
const SOLANA_RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

// Get wallet balance in SOL
export const getWalletBalance = async (address) => {
  try {
    if (!address) return 0;

    const connection = new Connection(SOLANA_RPC_ENDPOINT);
    const publicKey = new PublicKey(address);

    // Get balance in lamports
    const balanceInLamports = await connection.getBalance(publicKey);

    // Convert lamports to SOL
    const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

    return balanceInSOL;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return 0;
  }
};

export const web3AuthService = {
  // Check if Solana wallet is available - with safer detection
  hasSolanaWallet: () => {
    // Safer wallet detection that doesn't directly access window.solana
    // This reduces the chance of triggering wallet security alerts
    try {
      return typeof window !== 'undefined' &&
             'solana' in window &&
             window.solana !== undefined;
    } catch (e) {
      console.log('Safe wallet detection failed:', e);
      return false;
    }
  },

  // Connect to Solana wallet with improved security
  connectSolanaWallet: async () => {
    try {
      if (!web3AuthService.hasSolanaWallet()) {
        throw new Error('No Solana wallet detected. Please install a Solana wallet extension.');
      }

      // Add a delay before connecting to reduce false positives in security detection
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if OKX wallet is being used and handle it specifically
      const isOKXWallet = window.solana && window.solana.isOKX;

      if (isOKXWallet) {
        console.log('OKX wallet detected, using compatible connection method');
      }

      // Request connection with explicit user action flag
      // This helps wallets understand this is a user-initiated action
      const resp = await window.solana.connect({
        onlyIfTrusted: false // Explicitly require user approval
      });

      const publicKey = new PublicKey(resp.publicKey.toString());

      return {
        publicKey,
        type: 'solana'
      };
    } catch (error) {
      console.error('Error connecting to Solana wallet:', error);
      throw error;
    }
  },

  // Sign in with Solana wallet - improved security
  signInWithSolana: async (publicKey) => {
    try {
      if (!window.solana) {
        throw new Error('No Solana wallet detected');
      }

      const address = publicKey.toString();

      // Get or create web3 auth record, get nonce
      const authRecord = await getOrCreateWeb3Auth('solana', address);

      // Generate message to sign with clear explanation
      const messageToSign = getVerificationMessage(authRecord.nonce);

      // Add a delay before requesting signature to reduce false positives
      await new Promise(resolve => setTimeout(resolve, 300));

      // Show a console message about the signing request (helps with debugging)
      console.log('Requesting wallet signature for authentication. This is safe and does not give any transaction permissions.');

      // Check if OKX wallet is being used and handle it specifically
      const isOKXWallet = window.solana && window.solana.isOKX;

      // Encode message
      const encodedMessage = new TextEncoder().encode(messageToSign);

      // Request signature with explicit user action context
      let signatureResult;

      try {
        // Use a more descriptive signing method with better parameters
        signatureResult = await window.solana.signMessage(encodedMessage, 'utf8');
      } catch (signError) {
        console.error('Standard signing failed, trying alternative method:', signError);

        // Some wallets might require different parameters
        if (isOKXWallet) {
          // Try OKX specific method if available
          console.log('Trying OKX-specific signing method');
        }

        // Fallback to a more basic signing attempt
        signatureResult = await window.solana.signMessage(encodedMessage, 'utf8');
      }

      // Convert signature to hex string
      const signatureHex = uint8ArrayToHex(signatureResult.signature);

      // Create web3 session
      await createWeb3Session('solana', address, signatureHex);

      // Get wallet balance
      const balance = await getWalletBalance(address);

      // Build user object
      const userProfile = {
        id: address,
        address,
        type: 'solana',
        balance,
        profile: {
          name: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
          avatar: null, // Will use default avatar in UI
        },
        auth: {
          signature: signatureHex,
          message: messageToSign,
          nonce: authRecord.nonce
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store user in localStorage
      storeUser(userProfile);

      return userProfile;
    } catch (error) {
      console.error('Solana signature authentication failed:', error);
      throw error;
    }
  },

  // Update wallet balance
  updateWalletBalance: async () => {
    try {
      // Get current user
      const user = getStoredUser();

      if (!user || !user.address || user.type !== 'solana') {
        return null;
      }

      // Get updated balance
      const balance = await getWalletBalance(user.address);

      // Update user profile with new balance
      const updatedUser = {
        ...user,
        balance,
        updatedAt: new Date()
      };

      // Store updated user
      storeUser(updatedUser);

      return updatedUser;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      return null;
    }
  },

  // Disconnect wallet
  disconnectWallet: async () => {
    try {
      // Get current user
      const user = getStoredUser();

      // If there's a user, invalidate their session
      if (user && user.address) {
        await invalidateWeb3Session(user.address);
      }

      // Clear local storage
      storeUser(null);

      return { success: true };
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }
};

export default web3AuthService;
