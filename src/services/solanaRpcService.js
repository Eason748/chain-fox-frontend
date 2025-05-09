/**
 * Solana RPC Service - 简化的 Solana RPC 调用
 * 提供直接的 API 函数用于与 Solana 网络交互
 */

import { Connection, PublicKey } from '@solana/web3.js';

// Helius API 配置
const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY;
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// CFX Token 地址
const CFX_TOKEN_ADDRESS = import.meta.env.VITE_CFX_TOKEN;

// SPL Token 程序 ID - 直接使用常量而不是导入
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

// 创建连接实例
let connection = null;
let isInitialized = false;

/**
 * 初始化 Solana 连接
 * @returns {Promise<boolean>} 初始化是否成功
 */
async function initialize() {
  try {
    if (isInitialized) return true;

    if (!HELIUS_API_KEY) {
      console.error("未配置 Helius API 密钥。请在 .env 文件中添加 VITE_HELIUS_API_KEY");
      return false;
    }

    // 创建连接
    connection = new Connection(HELIUS_RPC_URL, 'confirmed');

    // 测试连接
    try {
      await connection.getVersion();
      // 移除日志输出
    } catch (error) {
      console.error("Solana RPC 连接测试失败", error);
      return false;
    }

    isInitialized = true;
    return true;
  } catch (error) {
    // 只在开发环境中输出详细错误
    if (import.meta.env.DEV) {
      console.error("初始化 Solana RPC 服务失败", error);
    }
    return false;
  }
}

/**
 * 获取 Solana 连接实例
 * @returns {Connection} Solana 连接实例
 */
async function getConnection() {
  if (!isInitialized) {
    await initialize();
  }
  return connection;
}

/**
 * 执行 JSON-RPC 请求
 * @param {string} method - RPC 方法名
 * @param {Array} params - RPC 参数
 * @returns {Promise<any>} - RPC 响应
 */
async function callJsonRpc(method, params = []) {
  if (!HELIUS_API_KEY) {
    throw new Error("未配置 Helius API 密钥。请在 .env 文件中添加 VITE_HELIUS_API_KEY");
  }

  // 移除详细调试日志

  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method,
        params,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
    }

    // 检查结果是否存在
    if (data.result === undefined) {
      throw new Error(`RPC result is undefined for method: ${method}`);
    }

    // 对于 getBalance 方法，检查 value 字段
    if (method === 'getBalance' && data.result && typeof data.result === 'object') {
      // 如果结果是一个对象并且有 value 字段，返回 value
      if (data.result.value !== undefined) {
        return data.result.value;
      }
    }

    return data.result;
  } catch (error) {
    // 记录详细错误信息
    if (import.meta.env.DEV) {
      console.error(`RPC call failed for method ${method}:`, error);
    }
    throw error;
  }
}

/**
 * 获取钱包余额
 * @param {string} address - 钱包地址
 * @returns {Promise<{success: boolean, balance?: number, error?: Error, message?: string}>} - 余额结果
 */
async function getBalance(address) {
  try {
    if (!address) {
      return {
        success: false,
        message: "未提供钱包地址"
      };
    }

    // 验证地址格式
    const publicKey = new PublicKey(address);

    // 调用 getBalance RPC 方法
    const result = await callJsonRpc('getBalance', [publicKey.toString()]);

    // 移除详细调试日志

    // 处理不同格式的响应
    let lamports;

    // 如果结果是一个对象并且有 value 字段（Helius API 格式）
    if (result && typeof result === 'object' && 'value' in result) {
      lamports = result.value;
    }
    // 如果结果直接是一个数值
    else if (typeof result === 'number') {
      lamports = result;
    }
    // 其他情况
    else {
      // 移除错误日志
      return {
        success: false,
        message: "获取余额返回了意外的格式"
      };
    }

    // 检查 lamports 是否为有效数值
    if (lamports === null || lamports === undefined || isNaN(lamports)) {
      // 移除错误日志
      return {
        success: false,
        message: "获取到的余额不是有效数值"
      };
    }

    // 将 lamports 转换为 SOL (1 SOL = 10^9 lamports)
    const solBalance = lamports / 1000000000;

    // 再次检查转换后的值是否有效
    if (isNaN(solBalance)) {
      // 移除错误日志
      return {
        success: false,
        message: "余额转换失败"
      };
    }

    // 移除成功日志

    return {
      success: true,
      balance: solBalance
    };
  } catch (error) {
    // 只在开发环境中输出详细错误
    if (import.meta.env.DEV) {
      console.error("获取余额失败:", error);
    }
    return {
      success: false,
      error,
      message: error.message || "获取钱包余额失败"
    };
  }
}

/**
 * 获取账户信息
 * @param {string} address - 账户地址
 * @returns {Promise<{success: boolean, result?: Object, error?: Error, message?: string}>} - 账户信息结果
 */
async function getAccountInfo(address) {
  try {
    if (!address) {
      return {
        success: false,
        message: "未提供账户地址"
      };
    }

    // 验证地址格式
    const publicKey = new PublicKey(address);

    // 调用 getAccountInfo RPC 方法
    const result = await callJsonRpc('getAccountInfo', [publicKey.toString(), { encoding: 'jsonParsed' }]);

    return {
      success: true,
      result
    };
  } catch (error) {
    // 只在开发环境中输出详细错误
    if (import.meta.env.DEV) {
      console.error("获取账户信息失败:", error);
    }
    return {
      success: false,
      error,
      message: error.message || "获取账户信息失败"
    };
  }
}

/**
 * 获取交易信息
 * @param {string} signature - 交易签名
 * @returns {Promise<{success: boolean, result?: Object, error?: Error, message?: string}>} - 交易信息结果
 */
async function getTransaction(signature) {
  try {
    if (!signature) {
      return {
        success: false,
        message: "未提供交易签名"
      };
    }

    const result = await callJsonRpc('getTransaction', [signature, { encoding: 'jsonParsed' }]);

    return {
      success: true,
      result
    };
  } catch (error) {
    // 只在开发环境中输出详细错误
    if (import.meta.env.DEV) {
      console.error("获取交易信息失败:", error);
    }
    return {
      success: false,
      error,
      message: error.message || "获取交易信息失败"
    };
  }
}

/**
 * 获取用户的 CFX 代币余额
 * @param {string} ownerAddress - 钱包地址
 * @returns {Promise<{success: boolean, balance?: number, error?: Error, message?: string}>} - CFX 代币余额结果
 */
async function getCfxTokenBalance(ownerAddress) {
  try {
    if (!ownerAddress) {
      return {
        success: false,
        message: "未提供钱包地址"
      };
    }

    if (!CFX_TOKEN_ADDRESS) {
      return {
        success: false,
        message: "未配置 CFX 代币地址。请在 .env 文件中添加 VITE_CFX_TOKEN"
      };
    }

    // 验证地址格式
    const publicKey = new PublicKey(ownerAddress);

    // 第一步：获取用户的所有代币账户
    try {
      // 使用 getTokenAccountsByOwner RPC 方法
      const tokenAccountsResult = await callJsonRpc('getTokenAccountsByOwner', [
        publicKey.toString(),
        {
          programId: TOKEN_PROGRAM_ID
        },
        {
          encoding: 'jsonParsed'
        }
      ]);

      if (!tokenAccountsResult || !tokenAccountsResult.value || !Array.isArray(tokenAccountsResult.value)) {
        return {
          success: false,
          message: "获取代币账户失败：无效的响应格式"
        };
      }

      // 第二步：查找 CFX 代币账户
      const cfxTokenAccounts = tokenAccountsResult.value.filter(item => {
        try {
          const parsedData = item.account.data.parsed;
          return parsedData.info.mint === CFX_TOKEN_ADDRESS;
        } catch (e) {
          return false;
        }
      });

      // 如果没有找到 CFX 代币账户，返回余额为 0
      if (cfxTokenAccounts.length === 0) {
        return {
          success: true,
          balance: 0,
          message: "用户没有 CFX 代币账户"
        };
      }

      // 第三步：获取 CFX 代币余额
      const cfxTokenAccount = cfxTokenAccounts[0];
      const tokenAccountAddress = cfxTokenAccount.pubkey;

      // 使用 getTokenAccountBalance RPC 方法
      const balanceResult = await callJsonRpc('getTokenAccountBalance', [tokenAccountAddress]);

      if (!balanceResult || !balanceResult.value) {
        return {
          success: false,
          message: "获取 CFX 代币余额失败：无效的响应格式"
        };
      }

      // 解析余额
      const { amount, decimals, uiAmount, uiAmountString } = balanceResult.value;

      return {
        success: true,
        balance: uiAmount,
        rawAmount: amount,
        decimals: decimals,
        uiAmountString: uiAmountString
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("获取代币账户失败:", error);
      }
      return {
        success: false,
        error,
        message: error.message || "获取代币账户失败"
      };
    }
  } catch (error) {
    // 只在开发环境中输出详细错误
    if (import.meta.env.DEV) {
      console.error("获取 CFX 代币余额失败:", error);
    }
    return {
      success: false,
      error,
      message: error.message || "获取 CFX 代币余额失败"
    };
  }
}

// 导出所有函数
const solanaRpcService = {
  initialize,
  getConnection,
  getBalance,
  getAccountInfo,
  getTransaction,
  getCfxTokenBalance
};

export { getBalance, getAccountInfo, getTransaction, getCfxTokenBalance };
export default solanaRpcService;
