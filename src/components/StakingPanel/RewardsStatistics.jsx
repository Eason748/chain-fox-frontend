import React, { useState, useEffect } from 'react';
import { getTotalCredits } from '../../services/pointsService';

const RewardsStatistics = ({ rewardsStatistics }) => {
  const [totalCredits, setTotalCredits] = useState(null);
  const [loadingTotalCredits, setLoadingTotalCredits] = useState(false);

  // Load total credits when component mounts
  useEffect(() => {
    const loadTotalCredits = async () => {
      setLoadingTotalCredits(true);
      try {
        const result = await getTotalCredits();
        if (result.error) {
          console.error('Error loading total credits:', result.error);
        } else {
          setTotalCredits(result.totalCredits);
        }
      } catch (error) {
        console.error('Error loading total credits:', error);
      } finally {
        setLoadingTotalCredits(false);
      }
    };

    loadTotalCredits();
  }, []);

  if (!rewardsStatistics) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
        <span className="mr-2">🎯</span>
        Credits Pool
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/20">
          <p className="text-sm text-yellow-300 mb-1">Current Released</p>
          <p className="text-xl font-bold text-white">
            {rewardsStatistics.total_released.toLocaleString()}
          </p>
          <p className="text-xs text-yellow-300 mt-1">
            {rewardsStatistics.total_progress_percentage}% Complete
          </p>
        </div>

        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/20">
          <p className="text-sm text-yellow-300 mb-1">System Runtime</p>
          <p className="text-xl font-bold text-white">
            {rewardsStatistics.days_since_start.toFixed(1)} days
          </p>
          <p className="text-xs text-yellow-300 mt-1">
            Start Time: {new Date(rewardsStatistics.start_time_info.date_utc).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/20">
          <p className="text-sm text-yellow-300 mb-1">Current supply</p>
          <p className="text-xl font-bold text-white">
            {totalCredits}
          </p>
          <p className="text-xs text-yellow-300 mt-1">
            Total Supply: 1000,000
          </p>
        </div>


        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/20">
          <p className="text-sm text-yellow-300 mb-1">Current Burned</p>
          <p className="text-xl font-bold text-white">
            0 Credits
          </p>
          <p className="text-xs text-yellow-300 mt-1">
            Awaiting Reward CFX: 1000,000 
          </p>
        </div>
      </div>

    </div>
  );
};

export default RewardsStatistics;
