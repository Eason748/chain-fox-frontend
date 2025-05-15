import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const DaoProgressContext = createContext(null);

// Progress states - simplified to a single progress track
const PROGRESS_STATES = {
  NOT_STARTED: 0,
  PLANNING: 10,
  DESIGN: 20,
  DEVELOPMENT: 40,
  TESTING: 60,
  REVIEW: 80,
  COMPLETED: 100
};

// Local storage keys
const PROGRESS_KEY = 'dao_progress';
const STAGE_KEY = 'dao_stage';

/**
 * Provider component for DAO progress context
 */
export const DaoProgressProvider = ({ children }) => {
  // Single progress state
  const [progress, setProgress] = useState(10);
  const [stage, setStage] = useState('PLANNING');

  // 设置固定进度值，不再从localStorage读取
  useEffect(() => {
    // 设置固定进度为40%和DEVELOPMENT阶段
    const fixedProgress = 10;
    const fixedStage = 'DEVELOPMENT';

    // 更新状态
    setProgress(fixedProgress);
    setStage(fixedStage);

    // 保存到localStorage以保持一致性
    localStorage.setItem(PROGRESS_KEY, fixedProgress.toString());
    localStorage.setItem(STAGE_KEY, fixedStage);
  }, []);

  // Context value - 只提供只读值，不再提供修改函数
  const value = {
    progress,
    stage,
    PROGRESS_STATES
  };

  return (
    <DaoProgressContext.Provider value={value}>
      {children}
    </DaoProgressContext.Provider>
  );
};

// Custom hook for using the DAO progress context
export const useDaoProgress = () => {
  const context = useContext(DaoProgressContext);
  if (!context) {
    throw new Error('useDaoProgress must be used within a DaoProgressProvider');
  }
  return context;
};

export default DaoProgressContext;
