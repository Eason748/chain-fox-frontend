import React from 'react';
import StakingService from '../../services/stakingService/index.js';
import { formatTimeDisplay } from './utils';

const UserStaking = ({ userStakeInfo, stakingDuration, canWithdraw }) => {
  if (!userStakeInfo) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
        <span className="mr-2">👤</span>
        Your Staking
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
          <p className="text-sm text-blue-300 mb-1">Your Stake</p>
          <p className="text-xl font-bold text-white">
            {StakingService.formatCfxAmount(userStakeInfo.stakedAmount.toString())} CFX
          </p>
        </div>

        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
          <p className="text-sm text-blue-300 mb-1">Staking Duration</p>
          <p className="text-xl font-bold text-white">
            {stakingDuration ? formatTimeDisplay(stakingDuration) : '--'}
          </p>
        </div>

        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
          <p className="text-sm text-blue-300 mb-1">Status</p>
          <p className="text-xl font-bold text-white flex items-center">
            {userStakeInfo.withdrawalRequested ? (
              canWithdraw ? (
                <>
                  <span className="text-green-400 mr-2">✅</span>
                  <span className="text-green-400 text-sm">Ready</span>
                </>
              ) : (
                <>
                  <span className="text-orange-400 mr-2">⏳</span>
                  <span className="text-orange-400 text-sm">Pending</span>
                </>
              )
            ) : (
              <>
                <span className="text-blue-400 mr-2">🔒</span>
                <span className="text-blue-400 text-sm">Staked</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserStaking;
