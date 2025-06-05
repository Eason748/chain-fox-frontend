import React from 'react';
import { formatTimeDisplay } from './utils';

const WithdrawalStatus = ({ userStakeInfo, canWithdraw, dynamicTimeRemaining, withdrawalTimeInfo }) => {
  if (!userStakeInfo?.withdrawalRequested) return null;

  return (
    <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-500/20 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-orange-400 font-medium mr-2">🔓</span>
          <span className="text-orange-400 font-medium">
            Withdrawal Requested
          </span>
        </div>

        {(dynamicTimeRemaining || withdrawalTimeInfo) && (
          <div className="text-right">
            <div className={`text-sm font-medium ${
              (dynamicTimeRemaining?.canWithdraw || withdrawalTimeInfo?.canWithdraw) ? 'text-green-400' : 'text-orange-400'
            }`}>
              {(dynamicTimeRemaining?.canWithdraw || withdrawalTimeInfo?.canWithdraw) ? (
                <span className="flex items-center">
                  <span className="mr-1">✅</span>
                  Available Now
                </span>
              ) : (
                formatTimeDisplay(dynamicTimeRemaining || withdrawalTimeInfo?.timeFormat)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalStatus;
