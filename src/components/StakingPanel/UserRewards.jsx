import React from 'react';
import StakingService from '../../services/stakingService/index.js';
import StakingRewardsService from '../../services/stakingRewardsService.js';

const UserRewards = ({ userStakeInfo, stakePoolInfo, rewardsInfo, rewardsStatistics }) => {
  if (!userStakeInfo) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
        <span className="mr-2">🎁</span>
        Your Rewards
      </h3>

      {/* Detailed Credits Earning Info */}
      {rewardsStatistics && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/10 rounded-lg p-3 border border-green-500/10">
            <p className="text-sm text-green-300 mb-2 font-medium">
              📊 Your CFX Stake Share
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Your CFX Stake:</span>
                <span className="text-white">{StakingService.formatCfxAmount(userStakeInfo.stakedAmount.toString())} CFX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Your Share:</span>
                <span className="text-green-400 font-medium">
                  {stakePoolInfo ? (
                    ((parseInt(userStakeInfo.stakedAmount) / parseInt(stakePoolInfo.totalStaked)) * 100).toFixed(4)
                  ) : '0.0000'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Rewards Credits:</span>
                <span className="text-yellow-400 font-medium">
                  {rewardsInfo ? (
                    `${StakingRewardsService.formatRewardsAmount(rewardsInfo.available_rewards)}`
                  ) : (
                    '--'
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-900/10 rounded-lg p-3 border border-green-500/10">
            <p className="text-sm text-green-300 mb-2 font-medium">
              ⚡ Credits Earning Rate
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Per Second:</span>
                <span className="text-white">
                  {stakePoolInfo && rewardsStatistics ? (
                    ((parseInt(userStakeInfo.stakedAmount) / parseInt(stakePoolInfo.totalStaked)) *
                     rewardsStatistics.current_phase.current_year_rate).toFixed(8)
                  ) : '0.00000000'} Credits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Per Day:</span>
                <span className="text-white">
                  {stakePoolInfo && rewardsStatistics ? (
                    ((parseInt(userStakeInfo.stakedAmount) / parseInt(stakePoolInfo.totalStaked)) *
                     rewardsStatistics.current_phase.current_year_rate * 86400).toFixed(2)
                  ) : '0.00'} Credits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Phase:</span>
                <span className="text-yellow-400">Year {rewardsStatistics.current_phase.year}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mt-4 bg-green-900/10 rounded-lg p-3 border border-green-500/10">
        <p className="text-sm text-green-300 mb-1">
          💡 <strong>How Credits Work:</strong>
        </p>
        <p className="text-xs text-gray-300">
          Earn <strong>Credits</strong> continuously while your <strong>CFX tokens</strong> are staked. Credits represent future DAO governance weight and can be claimed anytime.
          The Credits release system follows a 3-year halving schedule: Year 1 releases 50% of total Credits, Years 2-3 each release 25%.
          <br/><br/>
          <strong>Important:</strong> You stake CFX tokens to earn Credits rewards. CFX and Credits are different assets.
        </p>
      </div>
    </div>
  );
};

export default UserRewards;
