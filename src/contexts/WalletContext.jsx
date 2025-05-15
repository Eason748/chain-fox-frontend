import React, { createContext, useContext, useEffect, useState } from 'react';
import { solanaWalletService } from '../services/solanaWalletService';
import { useAuth } from './AuthContext';

// Create wallet context
const WalletContext = createContext(null);

/**
 * Wallet provider component
 * Manages wallet connection state and provides wallet-related functions
 */
export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: null,
    loading: false,
    error: null,
    signature: null,
    signedMessage: null,
    signatureWarning: null,
    balance: null,
    balanceLoading: false,
    balanceError: null,
    cfxBalance: null,
    cfxBalanceLoading: false,
    cfxBalanceError: null
  });

  // 跟踪钱包服务初始化状态
  const [walletServiceInitialized, setWalletServiceInitialized] = useState(false);

  // Initialize wallet service and check for existing connections
  useEffect(() => {
    // 防止重复初始化
    if (walletServiceInitialized) return;

    const initWallet = async () => {
      try {
        // Initialize wallet service
        await solanaWalletService.initialize();
        setWalletServiceInitialized(true);

        // Check for stored connection and signature
        const storedConnection = solanaWalletService.checkStoredConnection();

        // Update state if wallet is already connected
        if (solanaWalletService.isWalletConnected()) {
          const walletAddress = solanaWalletService.getWalletAddress();

          setWalletState(prev => ({
            ...prev,
            isConnected: true,
            address: walletAddress,
            loading: false,
            error: null,
            // Use stored signature if available
            signature: storedConnection?.signature || null,
            signedMessage: storedConnection?.signedMessage || null,
            signatureWarning: null
          }));

          // 使用缓存机制获取余额，而不是直接请求
          // 设置一个较短的延迟，避免阻塞UI渲染
          setTimeout(async () => {
            try {
              // 直接获取余额，稍后会通过 useEffect 处理缓存逻辑
              const result = await solanaWalletService.getBalance();
              if (result.success && result.balance !== undefined && !isNaN(result.balance)) {
                setWalletState(prev => ({
                  ...prev,
                  balance: result.balance
                }));

                // 更新缓存
                setBalanceCache({
                  timestamp: Date.now(),
                  address: walletAddress,
                  balance: result.balance
                });
              }
            } catch (error) {
              if (import.meta.env.DEV) {
                console.error('Error in delayed balance refresh:', error);
              }
            }
          }, 500);
        }
      } catch (error) {
        // 只在开发环境中输出详细错误
        if (import.meta.env.DEV) {
          console.error('Error initializing wallet:', error);
        }
        setWalletState(prev => ({
          ...prev,
          error: 'Failed to initialize wallet service',
          loading: false
        }));
      }
    };

    initWallet();

    // Add wallet connection listener - 使用 useCallback 包装以避免不必要的重新创建
    const handleConnectionChange = (state) => {
      setWalletState(prev => ({
        ...prev,
        isConnected: state.connected,
        address: state.address,
        loading: false,
        error: null
      }));
    };

    // 只有在初始化后才添加监听器
    if (!walletServiceInitialized) {
      solanaWalletService.addConnectionListener(handleConnectionChange);
    }

    // Clean up listener
    return () => {
      solanaWalletService.removeConnectionListener(handleConnectionChange);
    };
  }, [walletServiceInitialized]);

  // Check user metadata for wallet connection when user changes
  useEffect(() => {
    if (user && user.user_metadata?.wallet?.address) {
      // If user has wallet in metadata but wallet is not connected, try to connect
      if (!walletState.isConnected) {
        // 移除日志输出
        // We don't auto-connect here, just show the UI to let the user connect
      }
    }
  }, [user, walletState.isConnected]);

  // 添加余额缓存机制
  const [balanceCache, setBalanceCache] = useState({
    timestamp: 0,
    address: null,
    balance: null
  });

  // 缓存有效期（毫秒）
  const BALANCE_CACHE_TTL = 60000; // 1分钟

  // 只在钱包初次连接时获取余额，避免频繁请求
  useEffect(() => {
    // 只有当钱包连接状态从未连接变为已连接时才获取余额
    const isNewConnection = walletState.isConnected && walletState.address && walletState.balance === null;

    // 检查缓存是否有效
    const isCacheValid =
      balanceCache.address === walletState.address &&
      balanceCache.balance !== null &&
      Date.now() - balanceCache.timestamp < BALANCE_CACHE_TTL;

    if (isNewConnection) {
      // 如果缓存有效，直接使用缓存的余额
      if (isCacheValid) {
        setWalletState(prev => ({
          ...prev,
          balance: balanceCache.balance,
          balanceLoading: false,
          balanceError: null
        }));
        return;
      }

      const fetchBalance = async () => {
        try {
          setWalletState(prev => ({ ...prev, balanceLoading: true, balanceError: null }));

          // 添加短暂延迟确保钱包服务完全初始化，但减少延迟时间
          await new Promise(resolve => setTimeout(resolve, 300));

          const result = await solanaWalletService.getBalance();

          if (result.success && result.balance !== undefined && !isNaN(result.balance)) {
            // 更新状态
            setWalletState(prev => ({
              ...prev,
              balance: result.balance,
              balanceLoading: false,
              balanceError: null
            }));

            // 更新缓存
            setBalanceCache({
              timestamp: Date.now(),
              address: walletState.address,
              balance: result.balance
            });
          } else if (result.success && (result.balance === undefined || isNaN(result.balance))) {
            // 处理成功但余额无效的情况
            // 只在开发环境中输出详细错误
            if (import.meta.env.DEV) {
              console.error('WalletContext: Initial balance is invalid:', result.balance);
            }
            setWalletState(prev => ({
              ...prev,
              balanceLoading: false,
              balanceError: 'Invalid balance value'
            }));
          } else {
            // 只在开发环境中输出详细错误
            if (import.meta.env.DEV) {
              console.error('WalletContext: Failed to fetch initial balance:', result.message);
            }
            setWalletState(prev => ({
              ...prev,
              balanceLoading: false,
              balanceError: result.message || 'Failed to fetch balance'
            }));
          }
        } catch (error) {
          // 只在开发环境中输出详细错误
          if (import.meta.env.DEV) {
            console.error('WalletContext: Error fetching initial wallet balance:', error);
          }
          setWalletState(prev => ({
            ...prev,
            balanceLoading: false,
            balanceError: error.message || 'Failed to fetch balance'
          }));
        }
      };

      fetchBalance();
    }
  }, [walletState.isConnected, walletState.address, walletState.balance, balanceCache]);

  /**
   * Connect wallet and request signature
   * @returns {Promise<{success: boolean, address?: string, signature?: string, error?: Error}>}
   */
  const connectWallet = async () => {
    try {
      setWalletState(prev => ({
        ...prev,
        loading: true,
        error: null,
        signature: null,
        signedMessage: null,
        signatureWarning: null
      }));

      const result = await solanaWalletService.connect();

      if (result.success) {
        setWalletState({
          isConnected: true,
          address: result.address,
          loading: false,
          error: null,
          signature: result.signature || null,
          signedMessage: result.signedMessage || null,
          signatureWarning: null,
          balance: null,  // 确保设置为 null，以触发余额获取
          cfxBalance: null  // 确保设置为 null，以触发 CFX 余额获取
        });

        // Log signature information for debugging
        if (result.signature) {
          // 移除日志输出
        }

        // 立即获取余额，不等待 useEffect
        setTimeout(async () => {
          try {
            await refreshBalance(true);
            await refreshCfxBalance(true);
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error('Error fetching balances after wallet connection:', error);
            }
          }
        }, 500);

        return result;
      } else {
        // If connection failed (including signature rejection)
        setWalletState({
          isConnected: false,
          address: null,
          loading: false,
          error: result.message || 'Failed to connect wallet',
          signature: null,
          signedMessage: null,
          signatureWarning: null,
          balance: null,
          balanceLoading: false,
          balanceError: null,
          cfxBalance: null,
          cfxBalanceLoading: false,
          cfxBalanceError: null
        });
        return result;
      }
    } catch (error) {
      // 只在开发环境中输出详细错误
      if (import.meta.env.DEV) {
        console.error('Error connecting wallet:', error);
      }
      setWalletState({
        isConnected: false,
        address: null,
        loading: false,
        error: error.message || 'Failed to connect wallet',
        signature: null,
        signedMessage: null,
        signatureWarning: null,
        balance: null,
        balanceLoading: false,
        balanceError: null,
        cfxBalance: null,
        cfxBalanceLoading: false,
        cfxBalanceError: null
      });
      return { success: false, error };
    }
  };

  /**
   * Disconnect wallet
   * @returns {Promise<{success: boolean, error?: Error}>}
   */
  const disconnectWallet = async () => {
    try {
      setWalletState(prev => ({ ...prev, loading: true, error: null }));

      const result = await solanaWalletService.disconnect();

      if (result.success) {
        setWalletState({
          isConnected: false,
          address: null,
          loading: false,
          error: null,
          signature: null,
          signedMessage: null,
          signatureWarning: null,
          balance: null,
          balanceLoading: false,
          balanceError: null,
          cfxBalance: null,
          cfxBalanceLoading: false,
          cfxBalanceError: null
        });
        return result;
      } else {
        setWalletState(prev => ({
          ...prev,
          loading: false,
          error: result.message || 'Failed to disconnect wallet'
        }));
        return result;
      }
    } catch (error) {
      // 只在开发环境中输出详细错误
      if (import.meta.env.DEV) {
        console.error('Error disconnecting wallet:', error);
      }
      setWalletState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to disconnect wallet'
      }));
      return { success: false, error };
    }
  };

  // Format wallet address for display (first 4 and last 4 characters)
  const formatWalletAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  /**
   * Refresh wallet balance
   * @param {boolean} [forceRefresh=false] - 是否强制刷新，忽略缓存
   * @returns {Promise<{success: boolean, balance?: number, error?: Error}>}
   */
  const refreshBalance = async (forceRefresh = false) => {
    if (!walletState.isConnected) {
      return { success: false, message: 'Wallet not connected' };
    }

    try {
      // 检查缓存是否有效（除非强制刷新）
      const isCacheValid =
        !forceRefresh &&
        balanceCache.address === walletState.address &&
        balanceCache.balance !== null &&
        Date.now() - balanceCache.timestamp < BALANCE_CACHE_TTL;

      // 如果缓存有效，直接使用缓存的余额
      if (isCacheValid) {
        // 如果当前状态中的余额与缓存不同，则更新状态
        if (walletState.balance !== balanceCache.balance) {
          setWalletState(prev => ({
            ...prev,
            balance: balanceCache.balance,
            balanceLoading: false,
            balanceError: null
          }));
        }

        return {
          success: true,
          balance: balanceCache.balance,
          cached: true
        };
      }

      // 缓存无效或强制刷新，获取新数据
      setWalletState(prev => ({ ...prev, balanceLoading: true, balanceError: null }));

      // 添加短暂延迟确保钱包服务完全初始化
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = await solanaWalletService.getBalance();

      if (result.success && result.balance !== undefined && !isNaN(result.balance)) {
        // 更新状态
        setWalletState(prev => ({
          ...prev,
          balance: result.balance,
          balanceLoading: false,
          balanceError: null
        }));

        // 更新缓存
        setBalanceCache({
          timestamp: Date.now(),
          address: walletState.address,
          balance: result.balance
        });

        return result;
      } else if (result.success && (result.balance === undefined || isNaN(result.balance))) {
        // 处理成功但余额无效的情况
        // 只在开发环境中输出详细错误
        if (import.meta.env.DEV) {
          console.error('WalletContext: Balance is invalid:', result.balance);
        }
        setWalletState(prev => ({
          ...prev,
          balanceLoading: false,
          balanceError: 'Invalid balance value'
        }));
        return {
          success: false,
          message: 'Invalid balance value'
        };
      } else {
        // 只在开发环境中输出详细错误
        if (import.meta.env.DEV) {
          console.error('WalletContext: Failed to refresh balance:', result.message);
        }
        setWalletState(prev => ({
          ...prev,
          balanceLoading: false,
          balanceError: result.message || 'Failed to fetch balance'
        }));
        return result;
      }
    } catch (error) {
      // 只在开发环境中输出详细错误
      if (import.meta.env.DEV) {
        console.error('WalletContext: Error refreshing wallet balance:', error);
      }
      setWalletState(prev => ({
        ...prev,
        balanceLoading: false,
        balanceError: error.message || 'Failed to refresh balance'
      }));
      return { success: false, error, message: error.message || 'Failed to refresh balance' };
    }
  };

  /**
   * 获取 CFX 代币余额
   * @param {boolean} [forceRefresh=false] - 是否强制刷新，忽略缓存
   * @returns {Promise<{success: boolean, balance?: number, error?: Error}>}
   */
  const refreshCfxBalance = async (forceRefresh = false) => {
    if (!walletState.isConnected) {
      return { success: false, message: 'Wallet not connected' };
    }

    try {
      // 设置加载状态
      setWalletState(prev => ({
        ...prev,
        cfxBalanceLoading: true,
        cfxBalanceError: null
      }));

      // 添加短暂延迟确保钱包服务完全初始化
      await new Promise(resolve => setTimeout(resolve, 300));

      // 调用 RPC 服务获取 CFX 代币余额
      const result = await solanaWalletService.getCfxTokenBalance(walletState.address);

      if (result.success) {
        // 更新状态
        setWalletState(prev => ({
          ...prev,
          cfxBalance: result.balance,
          cfxBalanceLoading: false,
          cfxBalanceError: null
        }));

        return result;
      } else {
        // 只在开发环境中输出详细错误
        if (import.meta.env.DEV) {
          console.error('WalletContext: Failed to refresh CFX balance:', result.message);
        }

        setWalletState(prev => ({
          ...prev,
          cfxBalanceLoading: false,
          cfxBalanceError: result.message || 'Failed to fetch CFX balance'
        }));

        return result;
      }
    } catch (error) {
      // 只在开发环境中输出详细错误
      if (import.meta.env.DEV) {
        console.error('WalletContext: Error refreshing CFX balance:', error);
      }

      setWalletState(prev => ({
        ...prev,
        cfxBalanceLoading: false,
        cfxBalanceError: error.message || 'Failed to refresh CFX balance'
      }));

      return {
        success: false,
        error,
        message: error.message || 'Failed to refresh CFX balance'
      };
    }
  };

  // 在钱包连接状态变化时获取 CFX 代币余额，但只在初始连接时获取一次
  useEffect(() => {
    // 只有当钱包连接且余额为 null 时才获取余额（初次连接）
    if (walletState.isConnected && walletState.address && walletState.cfxBalance === null && !walletState.cfxBalanceLoading) {
      // 延迟获取 CFX 余额，避免与 SOL 余额请求同时发送
      setTimeout(() => {
        refreshCfxBalance().catch(error => {
          if (import.meta.env.DEV) {
            console.error('Error in delayed CFX balance refresh:', error);
          }
        });
      }, 1000);
    }
  }, [walletState.isConnected, walletState.address]);

  // Values provided to the context
  const value = {
    ...walletState,
    connectWallet,
    disconnectWallet,
    formatWalletAddress,
    refreshBalance,
    refreshCfxBalance,
    walletService: solanaWalletService
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === null) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default WalletContext;
