import { PublicKey } from '@solana/web3.js';
import {
  PROGRAM_ID,
  UserStakeStatus,
  getStakePoolPDA,
  getUserStakePDA
} from './common.js';

/**
 * Parse StakePool account data
 * Based on the IDL structure: authority, tokenMint, tokenVault, lockDurationSlots, totalStaked, emergencyMode, reentrancyGuard, bump
 */
export function parseStakePoolData(data) {
  if (!data || data.length < 8) {
    throw new Error('Invalid stake pool data');
  }

  // Skip 8-byte discriminator
  let offset = 8;

  // Parse fields according to StakePool struct (按照 IDL 中的正确顺序)
  const authority = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const tokenMint = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const tokenVault = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  // lockDurationSlots 在 totalStaked 之前！
  const lockDurationView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const lockDurationSlots = lockDurationView.getBigUint64(0, true);
  offset += 8;

  // totalStaked 在 lockDurationSlots 之后
  const totalStakedView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const totalStaked = totalStakedView.getBigUint64(0, true); // true = little-endian
  offset += 8;

  const emergencyMode = data[offset] === 1;
  offset += 1;

  const reentrancyGuard = data[offset] === 1;
  offset += 1;

  const bump = data[offset];
  offset += 1;

  // 移除生产环境日志

  return {
    authority: authority.toString(),
    tokenMint: tokenMint.toString(),
    tokenVault: tokenVault.toString(),
    lockDurationSlots: lockDurationSlots.toString(),
    totalStaked: totalStaked.toString(),
    emergencyMode,
    reentrancyGuard,
    bump
  };
}

/**
 * Parse UserStake account data
 * Based on the real IDL structure in cfx_stake_core.json
 *
 * 根据真实的 IDL，UserStake 结构应该是：
 * - discriminator: 8 bytes
 * - owner: 32 bytes (PublicKey)
 * - stake_pool: 32 bytes (PublicKey) <- 这个字段之前缺失了！
 * - staked_amount: 8 bytes (u64)
 * - last_stake_slot: 8 bytes (u64)
 * - unlock_slot: 8 bytes (u64)
 * - withdrawal_requested: 1 byte (bool)
 * - bump: 1 byte (u8)
 */
export function parseUserStakeData(data) {
  if (!data || data.length < 90) { // 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1 = 98 bytes minimum
    throw new Error('Invalid user stake data - insufficient length');
  }

  // Skip 8-byte discriminator
  let offset = 8;

  // Parse fields according to UserStake struct
  const owner = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  // Parse stakePool field
  const stakePool = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  // Parse stakedAmount using DataView for correct byte order
  const stakedAmountBytes = data.slice(offset, offset + 8);

  // 手动计算 little-endian 值以确保准确性
  let stakedAmount = 0n;
  for (let i = 0; i < 8; i++) {
    stakedAmount += BigInt(stakedAmountBytes[i]) << BigInt(i * 8);
  }
  offset += 8;

  const lastStakeSlotView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const lastStakeSlot = lastStakeSlotView.getBigUint64(0, true);
  offset += 8;

  const unlockSlotView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const unlockSlot = unlockSlotView.getBigUint64(0, true);
  offset += 8;

  const withdrawalRequested = data[offset] === 1;

  return {
    owner: owner.toString(),
    stakePool: stakePool.toString(),
    stakedAmount: stakedAmount.toString(),
    lastStakeSlot: lastStakeSlot.toString(),
    unlockSlot: unlockSlot.toString(),
    withdrawalRequested
  };
}

/**
 * Get stake pool information from the blockchain
 */
export async function getStakePoolInfo(connection) {
  try {
    const stakePoolPDA = await getStakePoolPDA();

    // 直接使用手动解析
    const accountInfo = await connection.getAccountInfo(stakePoolPDA);

    if (!accountInfo) {
      return {
        success: false,
        error: 'Stake pool account not found - contract may not be initialized'
      };
    }

    if (!accountInfo.owner.equals(PROGRAM_ID)) {
      return {
        success: false,
        error: 'Invalid stake pool account owner'
      };
    }

    // Parse the account data
    const stakePoolData = parseStakePoolData(accountInfo.data);

    return {
      success: true,
      data: stakePoolData
    };
  } catch (error) {
    console.error('Failed to fetch stake pool:', error);
    return {
      success: false,
      error: 'Failed to fetch stake pool information',
      originalError: error
    };
  }
}

/**
 * Get user stake information from the blockchain
 */
export async function getUserStakeInfo(connection, userPublicKey) {
  if (!userPublicKey) {
    throw new Error('Wallet not connected');
  }

  try {
    const userStakePDA = await getUserStakePDA(userPublicKey);

    // 直接使用手动解析
    const accountInfo = await connection.getAccountInfo(userStakePDA);

    if (!accountInfo) {
      return {
        success: true,
        data: null // Account doesn't exist yet
      };
    }

    if (!accountInfo.owner.equals(PROGRAM_ID)) {
      return {
        success: false,
        error: 'Invalid user stake account owner'
      };
    }

    // Parse the account data
    const userStakeData = parseUserStakeData(accountInfo.data);

    // Verify the owner matches the connected wallet
    if (userStakeData.owner !== userPublicKey.toString()) {
      return {
        success: false,
        error: 'User stake account owner mismatch'
      };
    }

    return {
      success: true,
      data: userStakeData
    };
  } catch (error) {
    console.error('Failed to fetch user stake:', error);
    return {
      success: false,
      error: 'Failed to fetch user stake information',
      originalError: error
    };
  }
}

/**
 * Check if withdrawal is available (lock period has passed)
 */
export async function canWithdraw(connection, userPublicKey) {
  try {
    const userStakeResult = await getUserStakeInfo(connection, userPublicKey);
    if (!userStakeResult.success || !userStakeResult.data) {
      return false;
    }

    const userStake = userStakeResult.data;
    if (!userStake.withdrawalRequested) {
      return false;
    }

    const currentSlot = await connection.getSlot();
    const unlockSlot = parseInt(userStake.unlockSlot);

    return currentSlot >= unlockSlot;
  } catch (error) {
    console.error('Error checking withdrawal availability:', error);
    return false;
  }
}

/**
 * Get time remaining until withdrawal is available
 * @returns {Promise<{canWithdraw: boolean, slotsRemaining: number, timeFormat: object}>}
 */
export async function getWithdrawalTimeRemaining(connection, userPublicKey) {
  try {
    const userStakeResult = await getUserStakeInfo(connection, userPublicKey);
    if (!userStakeResult.success || !userStakeResult.data) {
      return { canWithdraw: false, slotsRemaining: 0, timeFormat: { type: 'immediate' } };
    }

    const userStake = userStakeResult.data;
    if (!userStake.withdrawalRequested) {
      return { canWithdraw: false, slotsRemaining: 0, timeFormat: { type: 'immediate' } };
    }

    const currentSlot = await connection.getSlot();
    const unlockSlot = parseInt(userStake.unlockSlot);
    const slotsRemaining = Math.max(0, unlockSlot - currentSlot);

    // 使用统一的时间格式化方法
    const timeFormat = formatTimeFromSlots(slotsRemaining);

    return {
      canWithdraw: slotsRemaining === 0,
      slotsRemaining,
      timeFormat
    };
  } catch (error) {
    console.error('Error calculating withdrawal time:', error);
    return { canWithdraw: false, slotsRemaining: 0, timeFormat: { type: 'immediate' } };
  }
}

/**
 * 获取用户质押状态
 */
export function getUserStakeStatus(userStake, currentSlot) {
  if (!userStake || userStake.stakedAmount === '0') {
    return UserStakeStatus.NOT_STAKED;
  }

  if (!userStake.withdrawalRequested) {
    return UserStakeStatus.STAKED;
  }

  if (currentSlot >= parseInt(userStake.unlockSlot)) {
    return UserStakeStatus.READY_TO_WITHDRAW;
  }

  return UserStakeStatus.WITHDRAWAL_REQUESTED;
}

/**
 * 格式化时间（从 slots 到人类可读格式）
 * @param {number} slots - Slot 数量
 * @returns {object} 包含时间组件的对象，供前端使用国际化
 */
export function formatTimeFromSlots(slots) {
  if (slots <= 0) {
    return { type: 'immediate' };
  }

  const seconds = slots * 0.4; // 每个 slot 约 400ms
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  // 返回时间组件，让前端使用国际化
  if (days > 0) {
    if (hours > 0) {
      return { type: 'daysHours', days, hours };
    } else {
      return { type: 'days', days };
    }
  } else if (hours > 0) {
    if (minutes > 0) {
      return { type: 'hoursMinutes', hours, minutes };
    } else {
      return { type: 'hours', hours };
    }
  } else if (minutes > 0) {
    return { type: 'minutes', minutes };
  } else {
    return { type: 'lessThanMinute' };
  }
}
