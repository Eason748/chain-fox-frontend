import React from 'react';
import StakingService, { MAX_TOTAL_POOL_SIZE } from '../../services/stakingService/index.js';
import { formatTimeDisplay } from './utils';

const PoolStatistics = ({ stakePoolInfo, tokenVaultBalance }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
        <span className="mr-2">🏛️</span>
        CFX Pool
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
          <p className="text-sm text-purple-300 mb-1">Total Staked</p>
          <p className="text-xl font-bold text-white">
            {stakePoolInfo ? StakingService.formatCfxAmount(stakePoolInfo.totalStaked.toString()) : '--'} CFX
          </p>
        </div>

        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
          <p className="text-sm text-purple-300 mb-1">Vault Balance</p>
          <p className="text-xl font-bold text-white">
            {tokenVaultBalance !== null ? tokenVaultBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'} CFX
          </p>
        </div>

        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
          <p className="text-sm text-purple-300 mb-1">Lock Duration</p>
          <p className="text-xl font-bold text-white">
            {stakePoolInfo ? formatTimeDisplay(StakingService.formatTimeFromSlots(parseInt(stakePoolInfo.lockDurationSlots))) : '--'}
          </p>
        </div>

        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
          <p className="text-sm text-purple-300 mb-1">Pool Utilization</p>
          <p className="text-xl font-bold text-white">
            {stakePoolInfo ? (
              (() => {
                const totalStaked = parseInt(stakePoolInfo.totalStaked);
                const maxCapacity = MAX_TOTAL_POOL_SIZE;
                const utilization = ((totalStaked / maxCapacity) * 100).toFixed(1);
                return `${utilization}%`;
              })()
            ) : '--'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoolStatistics;
