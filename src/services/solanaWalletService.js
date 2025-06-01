// No longer need direct web3.js imports as we use solanaRpcService
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { supabase } from './supabase';
import solanaRpcService, { getCfxTokenBalance } from './solanaRpcService';

// Constants
const WALLET_CONNECTION_KEY = 'solana_wallet_connection';
const SOLANA_NETWORK = 'mainnet-beta'; // or 'devnet' for testing

// Default signature template if not provided in environment variables
const DEFAULT_SIGNATURE_TEMPLATE =
`# Chain Fox Wallet Connection

I, the owner of wallet address {{address}}, hereby confirm that I am securely connecting to Chain Fox (www.chain-fox.com).

This signature verifies my ownership of this wallet and authorizes this connection.

---
Timestamp: {{timestamp}}
Network: Solana {{network}}
Website: www.chain-fox.com`;

// Get signature template from environment variables or use default
const SIGNATURE_TEMPLATE = import.meta.env.VITE_WALLET_SIGNATURE_TEMPLATE || DEFAULT_SIGNATURE_TEMPLATE;

/**
 * Solana Wallet Service - Handles Solana wallet connection and operations
 */
class SolanaWalletService {
  constructor() {
    this.connection = null;
    this.adapter = null;
    this.walletAddress = null;
    this.isInitialized = false;
    this.isConnected = false;
    this.connectionListeners = [];
    this.availableAdapters = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter()
    ];
  }

  /**
   * Initialize the Solana connection
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      if (this.isInitialized) return true;

      // 初始化 RPC 服务
      const initialized = await solanaRpcService.initialize();
      if (!initialized) {
        throw new Error("Failed to initialize Solana RPC service");
      }

      // 获取连接实例
      this.connection = await solanaRpcService.getConnection();
      if (!this.connection) {
        throw new Error("Failed to get Solana connection");
      }

      // 检查存储的钱包连接
      await this.checkStoredConnection();

      this.isInitialized = true;
      // 移除日志输出
      return true;
    } catch (error) {
      // 只在开发环境中输出详细错误
      if (import.meta.env.DEV) {
        console.error("SolanaWalletService: Failed to initialize", error);
      }
      return false;
    }
  }

  /**
   * Check if there's a stored wallet connection
   * @returns {Promise<Object|null>} Stored connection data including signature if available
   */
  async checkStoredConnection() {
    try {
      const storedConnection = localStorage.getItem(WALLET_CONNECTION_KEY);
      if (storedConnection) {
        const connectionData = JSON.parse(storedConnection);
        const { connected, address, adapter, timestamp } = connectionData;

        // Check if the connection is recent (within 30 days instead of 1 day)
        const isRecent = Date.now() - timestamp < 30 * 24 * 60 * 60 * 1000;

        if (connected && address && isRecent) {
          // 检查钱包适配器是否可用
          const availableAdapter = this.availableAdapters.find(a => a.name === adapter);

          if (availableAdapter) {
            // 检查钱包适配器状态
            if (availableAdapter.readyState === 'Installed') {
              // 尝试自动重连钱包
              try {
                await availableAdapter.connect();

                // 验证连接后的地址是否匹配
                if (availableAdapter.publicKey && availableAdapter.publicKey.toString() === address) {
                  this.walletAddress = address;
                  this.isConnected = true;
                  this.adapter = availableAdapter;

                  // 添加钱包事件监听器
                  this.setupWalletEventListeners();

                  // 移除生产环境日志 - 钱包自动重连成功
                } else {
                  // 地址不匹配，但不立即清除存储状态，可能是临时问题
                  // 移除生产环境日志 - 钱包地址不匹配
                  return { address }; // 返回基本信息，保留存储状态
                }
              } catch (connectError) {
                // 自动连接失败，但不立即清除存储状态
                // 可能是用户拒绝了自动连接或网络问题
                // 移除生产环境日志 - 钱包自动重连失败
                return { address }; // 返回基本信息，保留存储状态
              }
            } else if (availableAdapter.readyState === 'NotDetected') {
              // 钱包未安装，但保留存储状态，用户可能稍后安装
              // 移除生产环境日志 - 钱包未检测到
              return { address };
            } else {
              // 其他状态（如 Loading），保留存储状态
              // 移除生产环境日志 - 钱包状态
              return { address };
            }
          } else {
            // 找不到对应的钱包适配器，但保留存储状态
            // 移除生产环境日志 - 未找到对应的钱包适配器
            return { address };
          }

          // 尝试从服务器获取签名信息
          try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
              // 用户已登录，从服务器获取签名
              const { data: signatureData, error: signatureError } = await supabase
                .from('wallet_signatures')
                .select('signature, signed_message')
                .eq('user_id', user.id)
                .eq('wallet_address', address)
                .eq('is_active', true)
                .or('expires_at.gte.now,expires_at.is.null')  // 过期时间大于当前时间或为空
                .maybeSingle();

              if (!signatureError && signatureData) {
                if (import.meta.env.DEV) {
                  console.log("SolanaWalletService: Signature retrieved from server successfully");
                }

                // 返回从服务器获取的签名信息
                return {
                  address,
                  signature: signatureData.signature,
                  signedMessage: signatureData.signed_message
                };
              } else if (import.meta.env.DEV) {
                console.log("SolanaWalletService: No valid signature found on server");
              }
            }
          } catch (serverError) {
            if (import.meta.env.DEV) {
              console.error("SolanaWalletService: Error retrieving signature from server", serverError);
            }
          }

          // 如果从服务器获取签名失败，返回基本连接信息
          return { address };
        }
      }
      return null;
    } catch (error) {
      // 只在开发环境中输出详细错误
      if (import.meta.env.DEV) {
        console.error("SolanaWalletService: Error checking stored connection", error);
      }
      return null;
    }
  }

  /**
   * Setup wallet event listeners to handle disconnection
   */
  setupWalletEventListeners() {
    if (!this.adapter) return;

    // 移除之前的监听器（如果存在）
    this.removeWalletEventListeners();

    // 监听钱包断开连接事件
    this.adapter.on('disconnect', () => {
      // 移除生产环境日志 - 钱包主动断开连接
      this.handleWalletDisconnect();
    });

    // 监听账户变化事件
    this.adapter.on('accountChanged', (publicKey) => {
      if (!publicKey) {
        // 移除生产环境日志 - 钱包账户已清空
        this.handleWalletDisconnect();
      } else if (this.walletAddress && publicKey.toString() !== this.walletAddress) {
        // 移除生产环境日志 - 钱包账户已切换
        this.handleAccountChange(publicKey.toString());
      }
    });
  }

  /**
   * Remove wallet event listeners
   */
  removeWalletEventListeners() {
    if (!this.adapter) return;

    try {
      this.adapter.removeAllListeners('disconnect');
      this.adapter.removeAllListeners('accountChanged');
    } catch (error) {
      // 某些钱包可能不支持 removeAllListeners
      // 移除生产环境日志 - 移除钱包事件监听器时出错
    }
  }

  /**
   * Handle wallet disconnect event
   */
  handleWalletDisconnect() {
    this.adapter = null;
    this.walletAddress = null;
    this.isConnected = false;

    // 清除本地存储
    localStorage.removeItem(WALLET_CONNECTION_KEY);

    // 通知监听器
    this.notifyConnectionListeners();
  }

  /**
   * Handle account change event
   */
  handleAccountChange(newAddress) {
    this.walletAddress = newAddress;

    // 更新本地存储
    const connectionData = {
      connected: true,
      address: newAddress,
      adapter: this.adapter.name,
      timestamp: Date.now()
    };
    localStorage.setItem(WALLET_CONNECTION_KEY, JSON.stringify(connectionData));

    // 通知监听器
    this.notifyConnectionListeners();
  }

  /**
   * Try to auto-connect to the wallet in the background
   * @param {string} adapterName - Name of the wallet adapter to use
   */
  async tryAutoConnect(adapterName) {
    try {
      // This is a background operation, so we don't want to block the UI
      setTimeout(async () => {
        // Get available wallets
        const availableWallets = this.getAvailableWallets();

        if (availableWallets.length === 0) {
          // 移除日志输出
          return;
        }

        // Select adapter
        let selectedAdapter;
        if (adapterName) {
          selectedAdapter = availableWallets.find(adapter =>
            adapter.name.toLowerCase() === adapterName.toLowerCase()
          );
        }

        // If no adapter name provided or not found, use the first available
        if (!selectedAdapter) {
          selectedAdapter = availableWallets[0];
        }

        this.adapter = selectedAdapter;

        try {
          // Try to connect silently (this may or may not work depending on the wallet)
          await this.adapter.connect();

          // If we get here, the connection was successful
          // 移除日志输出

          // We don't need to request signature again since we already have it stored
        } catch (error) {
          // Silent connection failed, but that's okay
          // 移除日志输出
        }
      }, 500);
    } catch (error) {
      // 只在开发环境中输出详细错误
      if (import.meta.env.DEV) {
        console.error("SolanaWalletService: Error in tryAutoConnect", error);
      }
    }
  }

  /**
   * Get available wallet adapters
   * @returns {Array} List of available wallet adapters
   */
  getAvailableWallets() {
    return this.availableAdapters.filter(adapter => adapter.readyState === 'Installed');
  }

  /**
   * Format a signature message by replacing template variables
   * @param {string} address - Wallet address
   * @returns {string} Formatted message
   */
  formatSignatureMessage(address) {
    const timestamp = new Date().toISOString();

    // Replace template variables
    return SIGNATURE_TEMPLATE
      .replace(/{{address}}/g, address)
      .replace(/{{timestamp}}/g, timestamp)
      .replace(/{{network}}/g, SOLANA_NETWORK);
  }

  /**
   * Sign a message with the connected wallet
   * @param {string} message - Message to sign
   * @returns {Promise<{success: boolean, signature?: string, error?: Error}>} Signing result
   */
  async signMessage(message) {
    try {
      if (!this.isConnected || !this.adapter) {
        // 移除日志输出
        return {
          success: false,
          message: "Wallet not connected"
        };
      }

      // Check if the adapter supports signMessage
      if (!this.adapter.signMessage) {
        // 移除日志输出
        return {
          success: false,
          message: "Current wallet does not support message signing"
        };
      }

      // Convert message to Uint8Array
      const messageBytes = new TextEncoder().encode(message);

      // Sign the message
      const signature = await this.adapter.signMessage(messageBytes);

      // Check if signature is valid
      if (!signature || signature.length === 0) {
        console.error("SolanaWalletService: Received empty signature");
        return {
          success: false,
          message: "Received empty signature"
        };
      }

      // 移除日志输出

      // Convert signature to base64 string (browser-safe way)
      // We use Array.from and map to convert the Uint8Array to a string
      const signatureBase64 = btoa(
        Array.from(signature)
          .map(byte => String.fromCharCode(byte))
          .join('')
      );

      return {
        success: true,
        signature: signatureBase64,
        message
      };
    } catch (error) {
      // 只在开发环境中输出详细错误
      if (import.meta.env.DEV) {
        console.error("SolanaWalletService: Failed to sign message", error);
      }

      // Handle specific error messages
      let errorMessage = "Failed to sign message";

      // Check if error is a ReferenceError for Buffer
      if (error.name === 'ReferenceError' && error.message.includes('Buffer')) {
        if (import.meta.env.DEV) {
          console.error("SolanaWalletService: Buffer is not defined error. This is a browser compatibility issue.");
        }
        errorMessage = "Internal error: Browser compatibility issue";
      } else if (error.message) {
        if (error.message.includes('User rejected')) {
          errorMessage = "User rejected the signature request";
        } else if (error.message.includes('cancelled')) {
          errorMessage = "Signature request was cancelled";
        }
      }

      return {
        success: false,
        error,
        message: errorMessage
      };
    }
  }

  /**
   * Get a wallet wrapper with standardized transaction signing interface
   * @returns {Object|null} Wallet wrapper with unified API
   */
  getWalletWrapper() {
    if (!this.isConnected || !this.adapter || !this.walletAddress) {
      return null;
    }

    return {
      publicKey: this.adapter.publicKey,
      
      /**
       * Sign a single transaction
       * @param {Transaction} transaction - Transaction to sign
       * @returns {Promise<Transaction>} Signed transaction
       */
      signTransaction: async (transaction) => {
        if (!this.adapter.signTransaction) {
          throw new Error(`${this.adapter.name} does not support transaction signing`);
        }
        
        try {
          return await this.adapter.signTransaction(transaction);
        } catch (error) {
          // Handle common error scenarios
          if (error.message?.includes('User rejected')) {
            throw new Error('Transaction signing was rejected by user');
          }
          throw error;
        }
      },

      /**
       * Sign multiple transactions with fallback support
       * @param {Transaction[]} transactions - Array of transactions to sign
       * @returns {Promise<Transaction[]>} Array of signed transactions
       */
      signAllTransactions: async (transactions) => {
        if (!Array.isArray(transactions) || transactions.length === 0) {
          throw new Error('Invalid transactions array');
        }

        try {
          // Try batch signing first (if wallet supports it)
          if (this.adapter.signAllTransactions) {
            if (import.meta.env.DEV) {
              console.log(`${this.adapter.name}: Using batch transaction signing`);
            }
            return await this.adapter.signAllTransactions(transactions);
          }

          // Fallback: Sign transactions one by one
          if (import.meta.env.DEV) {
            console.log(`${this.adapter.name}: Using individual transaction signing (fallback)`);
          }

          if (!this.adapter.signTransaction) {
            throw new Error(`${this.adapter.name} does not support transaction signing`);
          }

          const signedTransactions = [];
          for (let i = 0; i < transactions.length; i++) {
            try {
              const signedTx = await this.adapter.signTransaction(transactions[i]);
              signedTransactions.push(signedTx);
              
              // Optional: Add a small delay between signatures to improve UX
              if (i < transactions.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } catch (error) {
              // If any individual transaction fails, throw with context
              throw new Error(`Failed to sign transaction ${i + 1}/${transactions.length}: ${error.message}`);
            }
          }

          return signedTransactions;
        } catch (error) {
          // Enhanced error handling
          if (error.message?.includes('User rejected')) {
            throw new Error('Transaction signing was rejected by user');
          }
          if (error.message?.includes('Insufficient funds')) {
            throw new Error('Insufficient funds for transaction');
          }
          throw error;
        }
      }
    };
  }

  /**
   * Check if the connected wallet supports specific features
   * @returns {Object} Feature support information
   */
  getWalletCapabilities() {
    if (!this.adapter) {
      return {
        signMessage: false,
        signTransaction: false,
        signAllTransactions: false
      };
    }

    return {
      walletName: this.adapter.name,
      signMessage: typeof this.adapter.signMessage === 'function',
      signTransaction: typeof this.adapter.signTransaction === 'function',
      signAllTransactions: typeof this.adapter.signAllTransactions === 'function'
    };
  }

  /**
   * Enhanced transaction signing with automatic retry and better error handling
   * @param {Transaction|Transaction[]} transactions - Single transaction or array of transactions
   * @param {Object} options - Signing options
   * @returns {Promise<{success: boolean, signedTransactions?: Transaction[], error?: Error}>}
   */
  async signTransactions(transactions, options = {}) {
    const {
      maxRetries = 1,
      retryDelay = 1000,
      showProgress = false
    } = options;

    try {
      if (!this.isConnected || !this.adapter) {
        return {
          success: false,
          message: "Wallet not connected"
        };
      }

      const wrapper = this.getWalletWrapper();
      if (!wrapper) {
        return {
          success: false,
          message: "Failed to create wallet wrapper"
        };
      }

      // Normalize input to array
      const txArray = Array.isArray(transactions) ? transactions : [transactions];
      const isSingleTransaction = !Array.isArray(transactions);

      if (showProgress && import.meta.env.DEV) {
        console.log(`Signing ${txArray.length} transaction(s) with ${this.adapter.name}`);
      }

      let lastError;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          let signedTransactions;

          if (isSingleTransaction) {
            // Single transaction
            signedTransactions = [await wrapper.signTransaction(txArray[0])];
          } else {
            // Multiple transactions
            signedTransactions = await wrapper.signAllTransactions(txArray);
          }

          return {
            success: true,
            signedTransactions: isSingleTransaction ? signedTransactions[0] : signedTransactions
          };
        } catch (error) {
          lastError = error;
          
          // Don't retry if user rejected
          if (error.message?.includes('rejected')) {
            break;
          }

          // Retry logic
          if (attempt < maxRetries) {
            if (import.meta.env.DEV) {
              console.log(`Transaction signing attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      return {
        success: false,
        error: lastError,
        message: lastError?.message || "Transaction signing failed"
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("SolanaWalletService: Failed to sign transactions", error);
      }
      
      return {
        success: false,
        error,
        message: "Failed to sign transactions"
      };
    }
  }

  /**
   * Connect to wallet and request a signature to verify ownership
   * @param {string} adapterName - Name of the wallet adapter to use (optional)
   * @returns {Promise<{success: boolean, address?: string, signature?: string, error?: Error}>} Connection result
   */
  async connect(adapterName = null) {
    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error("Failed to initialize wallet service");
        }
      }

      // Check if already connected
      if (this.isConnected && this.adapter && this.walletAddress) {
        // 尝试从服务器获取签名信息
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // 用户已登录，从服务器获取签名
            const { data: signatureData, error: signatureError } = await supabase
              .from('wallet_signatures')
              .select('signature, signed_message')
              .eq('user_id', user.id)
              .eq('wallet_address', this.walletAddress)
              .eq('is_active', true)
              .or('expires_at.gte.now,expires_at.is.null')  // 过期时间大于当前时间或为空
              .maybeSingle();

            if (!signatureError && signatureData && signatureData.signature && signatureData.signed_message) {
              // 如果从服务器获取到有效签名，返回它
              return {
                success: true,
                address: this.walletAddress,
                signature: signatureData.signature,
                signedMessage: signatureData.signed_message,
                message: "Already connected with signature from server"
              };
            }
          }
        } catch (serverError) {
          if (import.meta.env.DEV) {
            console.error("SolanaWalletService: Error retrieving signature from server", serverError);
          }
        }

        // 如果从服务器获取签名失败，检查本地存储
        const storedConnection = localStorage.getItem(WALLET_CONNECTION_KEY);
        if (storedConnection) {
          try {
            const connectionData = JSON.parse(storedConnection);
            // 注意：新版本的本地存储不再包含签名信息
            // 这里是为了兼容旧版本
            if (connectionData.signature && connectionData.signedMessage) {
              if (import.meta.env.DEV) {
                console.log("SolanaWalletService: Using legacy signature from local storage");
              }
              return {
                success: true,
                address: this.walletAddress,
                signature: connectionData.signature,
                signedMessage: connectionData.signedMessage,
                message: "Already connected with signature from local storage"
              };
            }
          } catch (e) {
            if (import.meta.env.DEV) {
              console.error("SolanaWalletService: Error parsing stored connection", e);
            }
          }
        }

        // 如果没有找到有效签名，只返回连接状态
        return {
          success: true,
          address: this.walletAddress,
          message: "Already connected without signature"
        };
      }

      // Get available wallets
      const availableWallets = this.getAvailableWallets();

      if (availableWallets.length === 0) {
        return {
          success: false,
          message: "No compatible wallet found. Please install Phantom, Solflare, or Backpack wallet."
        };
      }

      // Select adapter
      let selectedAdapter;
      if (adapterName) {
        selectedAdapter = availableWallets.find(adapter =>
          adapter.name.toLowerCase() === adapterName.toLowerCase()
        );
      }

      // If no adapter name provided or not found, use the first available
      if (!selectedAdapter) {
        selectedAdapter = availableWallets[0];
      }

      this.adapter = selectedAdapter;

      // Connect to the wallet
      await this.adapter.connect();

      // Get wallet address
      this.walletAddress = this.adapter.publicKey.toString();
      this.isConnected = true;

      // 添加钱包事件监听器
      this.setupWalletEventListeners();

      // 移除日志输出

      // Store connection in local storage (without signature yet)
      localStorage.setItem(WALLET_CONNECTION_KEY, JSON.stringify({
        connected: true,
        address: this.walletAddress,
        adapter: this.adapter.name,
        timestamp: Date.now()
      }));

      // Update user metadata if user is logged in
      await this.updateUserMetadata();

      // Request message signature for security verification
      const signatureMessage = this.formatSignatureMessage(this.walletAddress);

      // 移除日志输出

      const signatureResult = await this.signMessage(signatureMessage);
      // 移除日志输出

      if (signatureResult.success) {
        // Store basic connection info in local storage (without full signature)
        localStorage.setItem(WALLET_CONNECTION_KEY, JSON.stringify({
          connected: true,
          address: this.walletAddress,
          adapter: this.adapter.name,
          timestamp: Date.now()
          // 不再在本地存储完整签名信息
        }));

        // 尝试将签名存储到服务器端
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // 用户已登录，使用数据库函数存储签名
            const { data, error: signatureError } = await supabase.rpc('store_wallet_signature', {
              p_user_id: user.id,
              p_wallet_address: this.walletAddress,
              p_signature: signatureResult.signature,
              p_signed_message: signatureMessage
            });

            if (signatureError && import.meta.env.DEV) {
              console.error("SolanaWalletService: Failed to store signature on server", signatureError);
              // 继续执行，不阻止用户连接钱包
            } else if (import.meta.env.DEV) {
              console.log("SolanaWalletService: Signature stored on server successfully");
            }
          } else if (import.meta.env.DEV) {
            console.log("SolanaWalletService: User not logged in, signature not stored on server");
          }
        } catch (serverError) {
          if (import.meta.env.DEV) {
            console.error("SolanaWalletService: Error storing signature on server", serverError);
          }
          // 继续执行，不阻止用户连接钱包
        }

        // Only notify listeners if signature is successful
        this.notifyConnectionListeners();

        return {
          success: true,
          address: this.walletAddress,
          signature: signatureResult.signature,
          signedMessage: signatureMessage
        };
      } else {
        // If signature failed, disconnect the wallet and return failure
        // 移除日志输出

        try {
          // Disconnect wallet without notifying listeners (we'll handle that here)
          if (this.adapter) {
            await this.adapter.disconnect();
          }

          // Reset connection state
          this.adapter = null;
          this.walletAddress = null;
          this.isConnected = false;

          // Remove connection from local storage
          localStorage.removeItem(WALLET_CONNECTION_KEY);
        } catch (disconnectError) {
          // 只在开发环境中输出详细错误
          if (import.meta.env.DEV) {
            console.error("SolanaWalletService: Error during disconnect after signature failure", disconnectError);
          }
        }

        // Get the error message from the signature result
        const errorMessage = signatureResult.message || "Signature verification required";

        return {
          success: false,
          message: "Wallet connection cancelled: " + errorMessage
        };
      }
    } catch (error) {
      // 只在开发环境中输出详细错误
      if (import.meta.env.DEV) {
        console.error("SolanaWalletService: Failed to connect wallet", error);
      }

      // Handle specific error messages
      let errorMessage = "Failed to connect wallet";
      if (error.message && error.message.includes('User rejected')) {
        errorMessage = "User rejected the connection";
      }

      return {
        success: false,
        error,
        message: errorMessage
      };
    }
  }

  /**
   * Disconnect from wallet
   * @returns {Promise<{success: boolean, error?: Error}>} Disconnection result
   */
  async disconnect() {
    try {
      if (!this.isConnected || !this.adapter) {
        return { success: true, message: "Not connected" };
      }

      // 保存钱包地址，以便在断开连接后仍能使用
      const walletAddressToDisconnect = this.walletAddress;

      // 移除钱包事件监听器
      this.removeWalletEventListeners();

      await this.adapter.disconnect();

      this.adapter = null;
      this.walletAddress = null;
      this.isConnected = false;

      // Remove connection from local storage
      localStorage.removeItem(WALLET_CONNECTION_KEY);

      // 尝试从服务器清除签名信息
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 用户已登录，使用数据库函数停用签名
          const { data, error: signatureError } = await supabase.rpc('deactivate_wallet_signature', {
            p_user_id: user.id,
            p_wallet_address: walletAddressToDisconnect
          });

          if (signatureError) {
            if (import.meta.env.DEV) {
              console.error("SolanaWalletService: Failed to deactivate signature on server", signatureError);
            }
          } else if (!data || !data.success) {
            if (import.meta.env.DEV) {
              console.error("SolanaWalletService: Failed to deactivate signature on server", data?.message || "Unknown error");
            }
          } else if (import.meta.env.DEV) {
            console.log("SolanaWalletService: Signature deactivated on server successfully");
          }
        }
      } catch (serverError) {
        if (import.meta.env.DEV) {
          console.error("SolanaWalletService: Error deactivating signature on server", serverError);
        }
      }

      // Update user metadata if user is logged in
      await this.updateUserMetadata();

      this.notifyConnectionListeners();

      return { success: true };
    } catch (error) {
      // 只在开发环境中输出详细错误
      if (import.meta.env.DEV) {
        console.error("SolanaWalletService: Failed to disconnect wallet", error);
      }
      return { success: false, error };
    }
  }

  /**
   * Check if wallet is connected
   * @returns {boolean} Whether wallet is connected
   */
  isWalletConnected() {
    return this.isConnected && !!this.walletAddress;
  }

  /**
   * Get wallet address
   * @returns {string|null} Wallet address
   */
  getWalletAddress() {
    return this.walletAddress;
  }

  /**
   * Get wallet balance in SOL
   * @returns {Promise<{success: boolean, balance?: number, error?: Error}>} Balance result
   */
  async getBalance() {
    try {
      if (!this.isInitialized) {
        // 移除初始化日志
        await this.initialize();
      }

      if (!this.isConnected || !this.walletAddress) {
        // 移除钱包未连接日志
        return {
          success: false,
          message: "Wallet not connected"
        };
      }

      // 移除获取余额日志

      // 使用统一的 RPC 服务获取余额
      try {
        const balanceResult = await solanaRpcService.getBalance(this.walletAddress);

        // 如果 RPC 服务成功获取余额，直接返回结果
        if (balanceResult.success && balanceResult.balance !== undefined && !isNaN(balanceResult.balance)) {
          // 移除 RPC 服务成功日志
          return balanceResult;
        } else {
          // 移除 RPC 服务返回无效余额日志
        }
      } catch (rpcError) {
        // 移除 RPC 服务错误日志
      }

      // 移除 RPC 服务失败日志

      // 如果 RPC 服务失败，尝试使用钱包适配器的 getBalance 方法（如果可用）
      if (this.adapter && typeof this.adapter.getBalance === 'function') {
        try {
          // 移除使用适配器方法日志

          const adapterBalance = await this.adapter.getBalance();

          // 移除适配器返回余额日志

          // 检查 adapterBalance 是否为有效数值
          if (adapterBalance === null || adapterBalance === undefined || isNaN(adapterBalance)) {
            // 移除适配器返回无效余额日志
            return {
              success: false,
              message: "钱包适配器返回的余额不是有效数值"
            };
          }

          const solBalance = adapterBalance / 1000000000;

          // 再次检查转换后的值是否有效
          if (isNaN(solBalance)) {
            // 移除余额转换失败日志
            return {
              success: false,
              message: "余额转换失败"
            };
          }

          // 移除适配器成功获取余额日志

          return {
            success: true,
            balance: solBalance
          };
        } catch (adapterError) {
          // 移除适配器获取余额失败日志
        }
      } else {
        // 移除适配器方法不可用日志
      }

      // 如果所有方法都失败，返回错误
      return {
        success: false,
        message: "Failed to get wallet balance"
      };
    } catch (error) {
      // 移除获取余额失败日志
      return {
        success: false,
        error,
        message: "Failed to get wallet balance"
      };
    }
  }

  /**
   * Get CFX token balance for the connected wallet
   * @returns {Promise<{success: boolean, balance?: number, error?: Error}>} Balance result
   */
  async getCfxTokenBalance() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.isConnected || !this.walletAddress) {
        return {
          success: false,
          message: "Wallet not connected"
        };
      }

      // 使用 solanaRpcService 获取 CFX 代币余额
      return await getCfxTokenBalance(this.walletAddress);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("SolanaWalletService: Failed to get CFX token balance", error);
      }
      return {
        success: false,
        error,
        message: "Failed to get CFX token balance"
      };
    }
  }

  /**
   * Update user metadata with wallet information
   */
  async updateUserMetadata() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const metadata = {
        ...user.user_metadata,
        wallet: this.isConnected ? {
          address: this.walletAddress,
          provider: this.adapter?.name || 'solana',
          chain: 'solana',
          connected_at: new Date().toISOString()
        } : null
      };

      await supabase.auth.updateUser({
        data: metadata
      });

      // 移除日志输出
    } catch (error) {
      // 移除更新用户元数据失败日志
    }
  }

  /**
   * Add a connection state change listener
   * @param {Function} listener Listener function
   */
  addConnectionListener(listener) {
    this.connectionListeners.push(listener);
  }

  /**
   * Remove a connection state change listener
   * @param {Function} listener Listener function
   */
  removeConnectionListener(listener) {
    const index = this.connectionListeners.indexOf(listener);
    if (index !== -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  /**
   * Notify all connection listeners
   */
  notifyConnectionListeners() {
    this.connectionListeners.forEach(listener => {
      listener({
        connected: this.isConnected,
        address: this.walletAddress
      });
    });
  }
}

// Create and export a singleton instance
export const solanaWalletService = new SolanaWalletService();