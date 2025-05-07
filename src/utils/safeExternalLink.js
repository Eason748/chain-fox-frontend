/**
 * 安全外部链接处理工具
 * 提供安全的方式打开外部链接，防止钓鱼攻击
 */

/**
 * 验证Solana合约地址格式
 * @param {string} address - 要验证的合约地址
 * @returns {boolean} - 地址格式是否有效
 */
export const validateSolanaAddress = (address) => {
  // Solana地址通常是base58编码的32-44个字符
  return /^[A-HJ-NP-Za-km-z1-9]{32,44}$/.test(address);
};

/**
 * 验证URL是否属于允许的域名
 * @param {string} url - 要验证的URL
 * @param {Array<string>} allowedDomains - 允许的域名列表
 * @returns {boolean} - URL是否属于允许的域名
 */
export const isAllowedDomain = (url, allowedDomains = []) => {
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`));
  } catch (e) {
    console.error('Invalid URL format:', e);
    return false;
  }
};

/**
 * 安全地打开外部链接
 * @param {string} url - 要打开的URL
 * @param {Object} options - 配置选项
 * @param {Array<string>} options.allowedDomains - 允许的域名列表
 * @param {string} options.warningMessage - 警告消息
 * @param {Function} options.onError - 错误处理函数
 * @param {boolean} options.preventPropagation - 是否阻止事件传播
 * @param {Event} event - 事件对象
 * @returns {Window|null} - 新窗口对象或null
 */
export const openSafeExternalLink = (url, options = {}, event = null) => {
  // 默认配置
  const defaultOptions = {
    allowedDomains: ['dexscreener.com', 'github.com', 'chain-fox.com'],
    warningMessage: '您将被重定向到外部网站。是否继续？',
    onError: (error) => console.error('External link error:', error),
    preventPropagation: true
  };

  // 合并选项
  const { allowedDomains, warningMessage, onError, preventPropagation } = {
    ...defaultOptions,
    ...options
  };

  try {
    // 阻止事件传播（如果需要）
    if (event && preventPropagation) {
      event.stopPropagation();
      event.preventDefault();
    }

    // 验证URL格式
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL');
    }

    // 检查URL是否属于允许的域名
    if (!isAllowedDomain(url, allowedDomains)) {
      throw new Error(`Domain not in allowed list: ${allowedDomains.join(', ')}`);
    }

    // 显示确认对话框
    if (window.confirm(warningMessage)) {
      // 安全打开新窗口
      const newWindow = window.open();
      if (newWindow) {
        // 断开与opener的连接，防止新窗口访问opener
        newWindow.opener = null;
        newWindow.location = url;
        return newWindow;
      } else {
        throw new Error('Failed to open new window. Popup might be blocked.');
      }
    }
    
    return null;
  } catch (error) {
    onError(error);
    return null;
  }
};

/**
 * 安全地打开Solana合约地址的DexScreener页面
 * @param {string} contractAddress - Solana合约地址
 * @param {Object} options - 配置选项
 * @param {Event} event - 事件对象
 * @returns {Window|null} - 新窗口对象或null
 */
export const openDexScreenerSafe = (contractAddress, options = {}, event = null) => {
  // 验证合约地址格式
  if (!validateSolanaAddress(contractAddress)) {
    console.error('Invalid Solana contract address format');
    return null;
  }

  // 默认配置
  const defaultOptions = {
    warningMessage: '您将被重定向到DexScreener查看合约信息。是否继续？',
  };

  // 合并选项
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    allowedDomains: ['dexscreener.com'] // 强制使用dexscreener.com域名
  };

  // 构建URL并安全打开
  const url = `https://dexscreener.com/solana/${contractAddress}`;
  return openSafeExternalLink(url, mergedOptions, event);
};

export default {
  openSafeExternalLink,
  openDexScreenerSafe,
  validateSolanaAddress,
  isAllowedDomain
};
