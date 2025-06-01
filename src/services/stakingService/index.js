// Export all common utilities and constants
export {
  TOKEN_PROGRAM_ID,
  PROGRAM_ID,
  CFX_TOKEN_MINT,
  MIN_STAKE_AMOUNT,
  MAX_PERSONAL_STAKE,
  MAX_TOTAL_POOL_SIZE,
  DEFAULT_LOCK_DURATION_DAYS,
  MAX_LOCK_DURATION_DAYS,
  CFX_DECIMALS,
  UserStakeStatus,
  ERROR_MESSAGES,
  INSTRUCTION_DISCRIMINATORS,
  STAKE_ERRORS,
  stringToUint8Array,
  getAssociatedTokenAddress,
  parseContractError,
  validateStakeAmount,
  getStakePoolPDA,
  getUserStakePDA,
  checkUserStakeAccount,
  calculateInstructionDiscriminator,
  createInstructionData,
  createStakingInstruction,
  getIdlInfo
} from './common.js';

// Export view/status functions
export {
  parseStakePoolData,
  parseUserStakeData,
  getStakePoolInfo,
  getUserStakeInfo,
  canWithdraw,
  getWithdrawalTimeRemaining,
  getUserStakeStatus,
  formatTimeFromSlots
} from './view-status.js';

// Export stake functions
export {
  createUserStakeIfNeeded,
  stake,
  getUserCFXBalance,
  formatCfxAmount,
  parseCfxAmount,
  validateStakeAmountWithBalance
} from './stake.js';

// Export unstake functions
export {
  requestWithdrawal
} from './unstake.js';

// Export withdraw functions
export {
  withdraw
} from './withdraw.js';

// Import all functions for the StakingService class
import { 
  MIN_STAKE_AMOUNT as MIN_STAKE,
  UserStakeStatus,
  checkUserStakeAccount
} from './common.js';
import { 
  getStakePoolInfo,
  getUserStakeInfo,
  canWithdraw as canWithdrawFunc,
  getWithdrawalTimeRemaining,
  getUserStakeStatus,
  formatTimeFromSlots
} from './view-status.js';
import { 
  stake as stakeFunc,
  getUserCFXBalance,
  formatCfxAmount,
  parseCfxAmount,
  validateStakeAmountWithBalance
} from './stake.js';
import { requestWithdrawal as requestWithdrawalFunc } from './unstake.js';
import { withdraw as withdrawFunc } from './withdraw.js';

/**
 * Staking Service Class - 使用模块化的实现
 */
class StakingService {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
    // 移除生产环境日志
  }

  /**
   * Update wallet
   */
  updateWallet(wallet) {
    this.wallet = wallet;
    // 移除生产环境日志
  }

  /**
   * Check if user stake account exists
   */
  async hasUserStakeAccount() {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    return await checkUserStakeAccount(this.connection, this.wallet.publicKey);
  }

  /**
   * Stake CFX tokens
   */
  async stake(amount) {
    return await stakeFunc(this.connection, this.wallet, amount);
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal() {
    return await requestWithdrawalFunc(this.connection, this.wallet);
  }

  /**
   * Withdraw tokens
   */
  async withdraw() {
    return await withdrawFunc(this.connection, this.wallet);
  }

  /**
   * Get stake pool information
   */
  async getStakePoolInfo() {
    return await getStakePoolInfo(this.connection);
  }

  /**
   * Get user stake information
   */
  async getUserStakeInfo() {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }
    return await getUserStakeInfo(this.connection, this.wallet.publicKey);
  }

  /**
   * Check if withdrawal is available
   */
  async canWithdraw() {
    if (!this.wallet?.publicKey) {
      return false;
    }
    return await canWithdrawFunc(this.connection, this.wallet.publicKey);
  }

  /**
   * Get withdrawal time remaining
   */
  async getWithdrawalTimeRemaining() {
    if (!this.wallet?.publicKey) {
      return { canWithdraw: false, slotsRemaining: 0, timeFormat: { type: 'immediate' } };
    }
    return await getWithdrawalTimeRemaining(this.connection, this.wallet.publicKey);
  }

  /**
   * 获取用户质押状态
   */
  getUserStakeStatus(userStake, currentSlot) {
    return getUserStakeStatus(userStake, currentSlot);
  }

  /**
   * 获取当前 slot
   */
  async getCurrentSlot() {
    return await this.connection.getSlot();
  }

  /**
   * 获取用户 CFX 余额
   */
  async getUserCFXBalance() {
    if (!this.wallet?.publicKey) {
      return 0;
    }
    return await getUserCFXBalance(this.connection, this.wallet.publicKey);
  }

  /**
   * 获取完整的用户状态
   */
  async getCompleteUserState() {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const [stakeInfo, cfxBalance, currentSlot] = await Promise.all([
        this.getUserStakeInfo(),
        this.getUserCFXBalance(),
        this.getCurrentSlot()
      ]);

      const userStakeData = stakeInfo.success ? stakeInfo.data : null;
      const status = this.getUserStakeStatus(userStakeData, currentSlot);

      let timeUntilUnlock = 0;
      if (userStakeData?.withdrawalRequested && currentSlot < parseInt(userStakeData.unlockSlot)) {
        timeUntilUnlock = parseInt(userStakeData.unlockSlot) - currentSlot;
      }

      return {
        status,
        stakeInfo: userStakeData,
        cfxBalance,
        currentSlot,
        timeUntilUnlock,
        canStake: cfxBalance >= MIN_STAKE,
        canRequestWithdrawal: status === UserStakeStatus.STAKED,
        canWithdraw: status === UserStakeStatus.READY_TO_WITHDRAW,
        isWithdrawalRequested: status === UserStakeStatus.WITHDRAWAL_REQUESTED
      };
    } catch (error) {
      console.error('获取完整用户状态失败:', error);
      throw error;
    }
  }

  // Static methods
  static formatCfxAmount = formatCfxAmount;
  static parseCfxAmount = parseCfxAmount;
  static formatTimeFromSlots = formatTimeFromSlots;
  static validateStakeAmount = validateStakeAmountWithBalance;

  /**
   * 获取锁定期天数
   * @param {string} lockDurationSlots - 锁定期 slots
   * @returns {number} 天数
   */
  static getLockDurationDays(lockDurationSlots) {
    const slots = parseInt(lockDurationSlots);
    const seconds = slots * 0.4;
    return Math.floor(seconds / 86400);
  }
}

export default StakingService;
