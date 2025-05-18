/**
 * 请求工具函数
 * 提供重试机制、超时处理和缓存功能
 */

// 简单的内存缓存实现
const memoryCache = {
  data: {},
  set(key, value, ttl = 5 * 60 * 1000) { // 默认缓存5分钟
    this.data[key] = {
      value,
      expiry: Date.now() + ttl
    };
  },
  get(key) {
    const item = this.data[key];
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      delete this.data[key];
      return null;
    }
    
    return item.value;
  },
  invalidate(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

/**
 * 带重试机制的异步函数执行器
 * @param {Function} asyncFn - 要执行的异步函数
 * @param {Object} options - 配置选项
 * @param {number} options.maxRetries - 最大重试次数，默认3次
 * @param {number} options.retryDelay - 重试延迟时间(ms)，默认1000ms
 * @param {Function} options.onRetry - 重试时的回调函数
 * @returns {Promise<*>} - 异步函数的执行结果
 */
export const withRetry = async (asyncFn, options = {}) => {
  const { 
    maxRetries = 3, 
    retryDelay = 1000,
    onRetry = (attempt, error) => console.log(`Retry attempt ${attempt}/${maxRetries} after ${retryDelay}ms. Error: ${error.message}`)
  } = options;
  
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // 重试前等待指定时间
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        onRetry(attempt, lastError);
      }
      
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      // 如果已经达到最大重试次数，抛出最后一个错误
      if (attempt >= maxRetries) {
        throw error;
      }
    }
  }
};

/**
 * 带超时机制的Promise包装器
 * @param {Promise} promise - 要包装的Promise
 * @param {number} timeoutMs - 超时时间(ms)，默认10000ms
 * @returns {Promise<*>} - 包装后的Promise
 */
export const withTimeout = (promise, timeoutMs = 10000) => {
  let timeoutId;
  
  // 创建一个超时Promise
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('请求超时'));
    }, timeoutMs);
  });
  
  // 使用Promise.race竞争，谁先完成就返回谁的结果
  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    // 清除超时定时器
    clearTimeout(timeoutId);
  });
};

/**
 * 带缓存的Supabase查询
 * @param {Function} queryFn - 执行Supabase查询的函数
 * @param {Object} options - 配置选项
 * @param {string} options.cacheKey - 缓存键
 * @param {number} options.ttl - 缓存有效期(ms)，默认5分钟
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存，默认false
 * @returns {Promise<{data, error}>} - 查询结果
 */
export const withCache = async (queryFn, options = {}) => {
  const { 
    cacheKey, 
    ttl = 5 * 60 * 1000, 
    forceRefresh = false 
  } = options;
  
  // 如果没有提供缓存键或强制刷新，直接执行查询
  if (!cacheKey || forceRefresh) {
    return await queryFn();
  }
  
  // 检查缓存
  const cachedResult = memoryCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }
  
  // 执行查询
  const result = await queryFn();
  
  // 如果查询成功且有数据，缓存结果
  if (!result.error && result.data) {
    memoryCache.set(cacheKey, result, ttl);
  }
  
  return result;
};

/**
 * 组合多个请求增强器
 * @param {Function} queryFn - 执行Supabase查询的函数
 * @param {Object} options - 配置选项
 * @returns {Promise<{data, error}>} - 查询结果
 */
export const enhancedQuery = async (queryFn, options = {}) => {
  const { 
    withRetryOptions = {}, 
    withTimeoutOptions = {}, 
    withCacheOptions = {} 
  } = options;
  
  // 组合缓存、重试和超时
  try {
    return await withCache(
      () => withRetry(
        () => withTimeout(
          queryFn(), 
          withTimeoutOptions.timeoutMs
        ),
        withRetryOptions
      ),
      withCacheOptions
    );
  } catch (error) {
    console.error('Enhanced query failed:', error);
    return { data: null, error };
  }
};

export default {
  memoryCache,
  withRetry,
  withTimeout,
  withCache,
  enhancedQuery
};
