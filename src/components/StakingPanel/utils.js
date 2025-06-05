import StakingService from '../../services/stakingService/index.js';
import solanaRpcService from '../../services/solanaRpcService';

// Helper function: Format time display
export const formatTimeDisplay = (timeFormat) => {
  if (!timeFormat) return '';

  switch (timeFormat.type) {
    case 'immediate':
      return 'Available now';
    case 'daysHours':
      // If seconds are available, show more precise time
      if (timeFormat.seconds !== undefined) {
        return `${timeFormat.days}d ${timeFormat.hours}h ${timeFormat.minutes}m ${timeFormat.seconds}s`;
      }
      return `${timeFormat.days} days ${timeFormat.hours} hours`;
    case 'days':
      if (timeFormat.seconds !== undefined) {
        return `${timeFormat.days}d ${timeFormat.minutes}m ${timeFormat.seconds}s`;
      }
      return `${timeFormat.days} days`;
    case 'hoursMinutes':
      if (timeFormat.seconds !== undefined) {
        return `${timeFormat.hours}h ${timeFormat.minutes}m ${timeFormat.seconds}s`;
      }
      return `${timeFormat.hours} hours ${timeFormat.minutes} minutes`;
    case 'hours':
      if (timeFormat.seconds !== undefined) {
        return `${timeFormat.hours}h ${timeFormat.minutes}m ${timeFormat.seconds}s`;
      }
      return `${timeFormat.hours} hours`;
    case 'minutes':
      if (timeFormat.seconds !== undefined) {
        return `${timeFormat.minutes}m ${timeFormat.seconds}s`;
      }
      return `${timeFormat.minutes} minutes`;
    case 'seconds':
      return `${timeFormat.seconds} seconds`;
    case 'lessThanMinute':
      return 'Less than a minute';
    default:
      return '';
  }
};

// 辅助函数：基于时间戳计算剩余时间
export const calculateTimeRemainingFromTimestamp = (endTimestamp) => {
  if (!endTimestamp) return null;

  const now = Date.now();
  const timeRemaining = Math.max(0, endTimestamp - now);

  if (timeRemaining === 0) {
    return { canWithdraw: true, type: 'immediate' };
  }

  const secondsRemaining = Math.ceil(timeRemaining / 1000);
  const days = Math.floor(secondsRemaining / (24 * 60 * 60));
  const hours = Math.floor((secondsRemaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((secondsRemaining % (60 * 60)) / 60);
  const seconds = secondsRemaining % 60;

  if (days > 0) {
    if (hours > 0) {
      return { canWithdraw: false, type: 'daysHours', days, hours, minutes, seconds };
    } else {
      return { canWithdraw: false, type: 'days', days, minutes, seconds };
    }
  } else if (hours > 0) {
    if (minutes > 0) {
      return { canWithdraw: false, type: 'hoursMinutes', hours, minutes, seconds };
    } else {
      return { canWithdraw: false, type: 'hours', hours, minutes, seconds };
    }
  } else if (minutes > 0) {
    return { canWithdraw: false, type: 'minutes', minutes, seconds };
  } else if (seconds > 0) {
    return { canWithdraw: false, type: 'seconds', seconds };
  } else {
    return { canWithdraw: true, type: 'immediate' };
  }
};

// 辅助函数：计算质押时长
export const calculateStakingDuration = async (userStakeInfo, stakingService) => {
  if (!userStakeInfo?.lastStakeSlot || !stakingService) return null;

  try {
    const connection = await solanaRpcService.getConnection();
    const currentSlot = await connection.getSlot();
    const lastStakeSlot = parseInt(userStakeInfo.lastStakeSlot);

    // 计算已质押的 slots
    const stakedSlots = Math.max(0, currentSlot - lastStakeSlot);

    // 使用 StakingService 的时间格式化方法
    return StakingService.formatTimeFromSlots(stakedSlots);
  } catch (error) {
    return null;
  }
};
