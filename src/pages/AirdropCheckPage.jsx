import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import supabase from '../services/supabase';
import { notify } from '../components/ui/Notification';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import AuthRequired from '../components/AuthRequired';
import { enhancedQuery } from '../utils/requestUtils';
import '../styles/loadingAnimation.css';

/**
 * FaqItem - Component for displaying a single FAQ item with collapsible answer
 * Optimized for performance with simpler animations
 */
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle newlines in the answer text
  const formattedAnswer = answer.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < answer.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div
      className={`bg-gradient-to-r ${
        isOpen
          ? 'from-blue-900/30 to-purple-900/20 border-blue-500/30'
          : 'from-gray-800/30 to-gray-900/20 border-gray-700/30 hover:border-blue-500/20'
      } border rounded-lg transition-colors duration-200`}
    >
      <button
        className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`font-medium ${isOpen ? 'text-blue-300' : 'text-white'}`}>
          {question}
        </span>
        <span
          className={`text-2xl transition-transform duration-200 text-white ${isOpen ? 'rotate-45' : 'rotate-0'}`}
        >
          +
        </span>
      </button>

      {isOpen && (
        <div
          className="px-4 pb-4 text-gray-300 overflow-hidden"
          style={{
            animation: isOpen ? 'faqSlideDown 0.2s ease-out forwards' : 'none'
          }}
        >
          <p>{formattedAnswer}</p>
        </div>
      )}
    </div>
  );
};

/**
 * AirdropCheckPage - Allows users to check wallet address eligibility for airdrop and potential credits amount
 * and claim credits if eligible
 */
const AirdropCheckPage = () => {
  const { t } = useTranslation(['common', 'airdrop']);
  const { user, loading: authLoading } = useAuth();
  const {
    isConnected: isWalletConnected,
    address: connectedWalletAddress,
    connectWallet
  } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [isSignatureLoading, setIsSignatureLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [signatureVerified, setSignatureVerified] = useState(false);

  // 全局加载状态
  const isPageLoading = authLoading || isLoading || isClaimLoading || isSignatureLoading;

  // 当钱包连接状态改变时，检查签名状态
  useEffect(() => {
    // 如果认证尚未完成，不执行数据获取
    if (authLoading) return;

    if (isWalletConnected && connectedWalletAddress) {
      // 检查钱包签名状态
      checkWalletSignature();
    } else {
      // 重置签名验证状态
      setSignatureVerified(false);
    }
  }, [isWalletConnected, connectedWalletAddress, authLoading]);

  // 检查钱包签名状态
  const checkWalletSignature = async () => {
    try {
      // 验证服务器上是否有该签名记录
      const { data: authData, error: authError } = await enhancedQuery(
        () => supabase.auth.getUser(),
        {
          withRetryOptions: {
            maxRetries: 3,
            retryDelay: 1000,
            onRetry: (attempt) => {
              console.log(`重试获取用户信息 (${attempt}/3)...`);
            }
          },
          withTimeoutOptions: {
            timeoutMs: 10000 // 10秒超时
          }
        }
      );

      if (authError) {
        throw authError;
      }

      const currentUser = authData?.user;

      if (!currentUser || !connectedWalletAddress) {
        setSignatureVerified(false);
        return false;
      }

      // 查询数据库中的签名记录
      const { data: signatureData, error: signatureError } = await enhancedQuery(
        () => supabase
          .from('wallet_signatures')
          .select('signature, signed_message')
          .eq('user_id', currentUser.id)
          .eq('wallet_address', connectedWalletAddress)
          .eq('is_active', true)
          .or('expires_at.gte.now,expires_at.is.null')  // 过期时间大于当前时间或为空
          .maybeSingle(),
        {
          withCacheOptions: {
            cacheKey: `wallet_signature_${currentUser.id}_${connectedWalletAddress}`,
            ttl: 5 * 60 * 1000 // 缓存5分钟
          },
          withRetryOptions: {
            maxRetries: 3,
            retryDelay: 1000,
            onRetry: (attempt) => {
              console.log(`重试获取钱包签名 (${attempt}/3)...`);
            }
          },
          withTimeoutOptions: {
            timeoutMs: 10000 // 10秒超时
          }
        }
      );

      if (signatureError) {
        console.error('Error fetching signature data:', signatureError);
        setSignatureVerified(false);
        return false;
      }

      // 如果找到有效签名记录
      if (signatureData && signatureData.signature) {
        setSignatureVerified(true);
        return true;
      }

      // 如果没有有效签名，返回 false
      setSignatureVerified(false);
      return false;
    } catch (error) {
      console.error('Error checking wallet signature:', error);
      setSignatureVerified(false);
      return false;
    }
  };

  // 使用连接的钱包地址，无需手动验证格式

  // 检查当前连接钱包的空投资格
  const handleCheck = async () => {
    // Reset previous results and errors
    setResult(null);
    setError('');
    setClaimError('');
    setClaimSuccess(false);

    // 验证认证状态是否已完成
    if (authLoading) {
      notify.warning(t('errors.authLoading', { ns: 'airdrop', defaultValue: '正在验证身份，请稍候...' }));
      return;
    }

    // 验证钱包是否已连接
    if (!isWalletConnected || !connectedWalletAddress) {
      setError(t('errors.walletNotConnected', { ns: 'airdrop' }));
      return;
    }

    // 直接使用连接的钱包地址
    setIsLoading(true);

    try {
      // 使用增强的查询函数，带缓存、重试和超时机制
      const { data, error: apiError } = await enhancedQuery(
        () => supabase.rpc('check_airdrop_eligibility', {
          p_wallet_address: connectedWalletAddress
        }),
        {
          withCacheOptions: {
            cacheKey: `airdrop_eligibility_${connectedWalletAddress}`,
            ttl: 5 * 60 * 1000 // 缓存5分钟
          },
          withRetryOptions: {
            maxRetries: 3,
            retryDelay: 1000,
            onRetry: (attempt) => {
              console.log(`重试检查空投资格 (${attempt}/3)...`);
            }
          },
          withTimeoutOptions: {
            timeoutMs: 15000 // 15秒超时
          }
        }
      );

      if (apiError) {
        throw apiError;
      }

      // Set result
      setResult(data);
    } catch (err) {
      console.error('Error checking airdrop eligibility:', err);
      setError(t('errors.checkFailed', {
        ns: 'airdrop',
        error: err.message
      }));
      notify.error(t('errors.checkFailed', { ns: 'airdrop', defaultValue: '检查空投资格失败，请稍后重试' }));
    } finally {
      setIsLoading(false);
    }
  };

  // 请求钱包签名 - 使用 WalletContext 提供的 connectWallet 方法
  const requestWalletSignature = async () => {
    setIsSignatureLoading(true);
    try {
      // 使用 WalletContext 提供的 connectWallet 方法
      const result = await connectWallet();

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to connect wallet and sign message');
      }

      // 验证签名是否成功保存
      const signatureVerified = await checkWalletSignature();

      if (!signatureVerified) {
        throw new Error('Signature verification failed');
      }

      return true;
    } catch (error) {
      console.error('Error requesting wallet signature:', error);
      setClaimError(t('claim.errors.signatureFailed', { ns: 'airdrop' }) || 'Failed to sign message');
      notify.error(t('claim.errors.signatureFailed', { ns: 'airdrop' }));
      return false;
    } finally {
      setIsSignatureLoading(false);
    }
  };

  // Handle claim button click
  const handleClaim = async () => {
    // Reset claim-related states
    setClaimError('');
    setClaimSuccess(false);

    // 验证认证状态是否已完成
    if (authLoading) {
      notify.warning(t('errors.authLoading', { ns: 'airdrop', defaultValue: '正在验证身份，请稍候...' }));
      return;
    }

    // Validate user is logged in
    if (!user) {
      setClaimError(t('claim.errors.notLoggedIn', { ns: 'airdrop' }));
      notify.error(t('claim.errors.notLoggedIn', { ns: 'airdrop' }));
      return;
    }

    // Validate wallet is connected
    if (!isWalletConnected || !connectedWalletAddress) {
      setClaimError(t('claim.errors.walletNotConnected', { ns: 'airdrop' }));
      notify.error(t('claim.errors.walletNotConnected', { ns: 'airdrop' }));
      return;
    }

    // Validate result exists and user is eligible
    if (!result || !result.is_eligible) {
      setClaimError(t('claim.errors.notEligible', { ns: 'airdrop' }));
      notify.error(t('claim.errors.notEligible', { ns: 'airdrop' }));
      return;
    }

    // 验证钱包签名
    if (!signatureVerified) {
      // 显示签名提示
      setClaimError(t('claim.errors.noSignature', { ns: 'airdrop' }) || 'No valid signature found for this wallet. Please reconnect your wallet.');

      // 请求钱包签名 - 使用现有的钱包连接功能
      const signatureSuccess = await requestWalletSignature();
      if (!signatureSuccess) {
        return; // 签名失败，中止领取流程
      }

      // 再次检查签名状态
      const verificationResult = await checkWalletSignature();
      if (!verificationResult) {
        setClaimError(t('claim.errors.signatureVerificationFailed', { ns: 'airdrop' }) || 'Signature verification failed. Please try again.');
        notify.error(t('claim.errors.signatureVerificationFailed', { ns: 'airdrop' }));
        return; // 验证失败，中止领取流程
      }
    }

    setIsClaimLoading(true);

    try {
      // 使用增强的查询函数，带重试和超时机制（不缓存写操作）
      const { data, error: apiError } = await enhancedQuery(
        () => supabase.rpc('claim_airdrop_credits', {
          p_wallet_address: connectedWalletAddress,
          p_user_id: user.id
        }),
        {
          withRetryOptions: {
            maxRetries: 3,
            retryDelay: 1000,
            onRetry: (attempt) => {
              console.log(`重试领取空投积分 (${attempt}/3)...`);
            }
          },
          withTimeoutOptions: {
            timeoutMs: 20000 // 20秒超时
          }
        }
      );

      if (apiError) {
        throw apiError;
      }

      if (!data.success) {
        throw new Error(data.message || t('claim.errors.claimFailed', { ns: 'airdrop' }));
      }

      // Set success state
      setClaimSuccess(true);

      // Show success notification with the amount from the server response
      notify.success(t('claim.success', {
        ns: 'airdrop',
        amount: data.amount || result.amount
      }));

      // Update result to show claimed status with data from server
      setResult({
        ...result,
        is_eligible: false,
        amount: data.amount || result.amount,
        reason: t('claim.alreadyClaimed', { ns: 'airdrop' })
      });

      // 成功领取后，可以在这里添加刷新用户积分余额的代码

      // 重新查询用户的空投资格状态，确保显示最新的状态
      try {
        const { data: refreshedData, error: refreshError } = await enhancedQuery(
          () => supabase.rpc('check_airdrop_eligibility', {
            p_wallet_address: connectedWalletAddress
          }),
          {
            // 强制刷新缓存
            withCacheOptions: {
              cacheKey: `airdrop_eligibility_${connectedWalletAddress}`,
              forceRefresh: true
            },
            withRetryOptions: {
              maxRetries: 2,
              retryDelay: 1000
            },
            withTimeoutOptions: {
              timeoutMs: 10000
            }
          }
        );

        if (!refreshError && refreshedData) {
          // 更新结果，但保留成功领取的状态
          setResult({
            ...refreshedData,
            amount: data.amount || result.amount, // 使用服务器返回的积分数量
          });
        }
      } catch (refreshErr) {
        console.error('Error refreshing airdrop eligibility:', refreshErr);
        // 不影响用户体验，所以不显示错误
      }

    } catch (err) {
      console.error('Error claiming airdrop credits:', err);
      setClaimError(err.message || t('claim.errors.claimFailed', { ns: 'airdrop' }));
      notify.error(t('claim.errors.claimFailed', { ns: 'airdrop', defaultValue: '领取积分失败，请稍后重试' }));
    } finally {
      setIsClaimLoading(false);
    }
  };

  // Render result card
  const renderResultCard = () => {
    if (!result) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-6 rounded-lg bg-gradient-to-br from-purple-900/40 to-blue-900/20 backdrop-blur-md border border-white/10"
      >
        <div className="space-y-4 text-center">
          {/* Eligibility Status and Amount - 更简化显示 */}
          <div className="py-4">
            {result.is_eligible ? (
              <>
                <div className="text-green-400 text-lg font-medium mb-2">{t('result.eligible', { ns: 'airdrop' })}</div>
                <div className="font-medium text-4xl text-green-300 mb-2">{result.amount}</div>
                <div className="text-gray-400 text-sm">{t('result.amount', { ns: 'airdrop' })}</div>
              </>
            ) : claimSuccess ? (
              // 如果已成功领取，只显示成功信息，不显示"Not Eligible"
              <div className="text-green-400 text-lg font-medium">{t('claim.claimSuccess', { ns: 'airdrop', amount: result.amount })}</div>
            ) : result.reason && result.reason.includes('already claimed') ? (
              // 如果原因是已经领取过，显示已领取信息
              <div className="text-blue-400 text-lg font-medium">{t('claim.alreadyClaimed', { ns: 'airdrop' })}</div>
            ) : (
              // 否则显示不符合资格的信息
              <>
                <div className="text-red-400 text-lg font-medium mb-2">{t('result.notEligible', { ns: 'airdrop' })}</div>
                {result.reason && (
                  <div className="text-gray-400 text-sm">{result.reason}</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* If eligible or just claimed, show claim section */}
        {(result.is_eligible || claimSuccess) && (
          <div className="mt-6">
            {/* Error message */}
            {claimError && (
              <div className="p-3 mb-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {claimError}
              </div>
            )}

            {/* 成功领取后不再显示重复的成功消息 */}

            {/* Signature status */}
            {!signatureVerified && !claimSuccess && (
              <div className="p-3 mb-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm">
                {t('claim.noSignature', { ns: 'airdrop' }) || 'No valid signature found for this wallet. Please click the claim button to sign a message.'}
              </div>
            )}

            {/* Claim button - 简化版 */}
            <div className="flex justify-center">
              <button
                onClick={handleClaim}
                disabled={isClaimLoading || isSignatureLoading || !isWalletConnected || !user || claimSuccess}
                className={`px-8 py-3 rounded-full text-lg font-semibold transition-all ${
                  claimSuccess
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {isClaimLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('claim.claiming', { ns: 'airdrop' })}
                  </div>
                ) : isSignatureLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('claim.signing', { ns: 'airdrop' }) || 'Signing...'}
                  </div>
                ) : (
                  claimSuccess ? t('claim.claimed', { ns: 'airdrop' }) : (!signatureVerified ? t('claim.signAndClaim', { ns: 'airdrop' }) || 'Sign & Claim' : t('claim.claimNow', { ns: 'airdrop' }))
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white p-8 pt-16 md:pt-24"
    >
      <div className="max-w-3xl mx-auto">
        {/* 全局加载指示器 */}
        {isPageLoading && (
          <>
            <div className="loading-indicator"></div>
            <div className="loading-text">
              {authLoading ? '验证身份...' :
               isLoading ? '检查空投资格...' :
               isClaimLoading ? '处理积分领取...' :
               isSignatureLoading ? '处理钱包签名...' : '加载中...'}
            </div>
          </>
        )}

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t('title', { ns: 'airdrop' })}
          </h1>
          <div className="mt-4 inline-block px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white font-bold">May 7, 2025</span>
            </div>
          </div>
        </motion.div>

        <AuthRequired>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
          >
          {/* Wallet Connection Form */}
          <div className="space-y-4">
            {/* 只显示钱包地址 */}
            {isWalletConnected ? (
              <div className="text-green-400 text-center mb-4">
                {connectedWalletAddress}
              </div>
            ) : (
              <div className="mb-4"></div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons - 简化按钮逻辑 */}
            <div className="flex justify-center mt-6">
              {/* 只显示一个按钮：未连接钱包时显示连接按钮，已连接但未查询时显示查询按钮，查询后不显示按钮 */}
              {!isWalletConnected ? (
                <button
                  onClick={connectWallet}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/40 transition-all"
                >
                  {t('claim.connectWallet', { ns: 'airdrop' })}
                </button>
              ) : !result && (
                <button
                  onClick={handleCheck}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('form.checking', { ns: 'airdrop' })}
                    </div>
                  ) : (
                    t('form.check', { ns: 'airdrop' })
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Check Results */}
          {renderResultCard()}
        </motion.div>

        {/* Credits System Information as FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-lg bg-blue-900/10 border border-blue-500/20"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">
            {t('info.title', { ns: 'airdrop' })}
          </h3>

          <div className="space-y-4">
            {t('info.faqItems', { ns: 'airdrop', returnObjects: true }).map((item, index) => (
              <FaqItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </motion.div>
        </AuthRequired>
      </div>
    </motion.div>
  );
};

export default AirdropCheckPage;
