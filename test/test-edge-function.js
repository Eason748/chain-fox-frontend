#!/usr/bin/env node

/**
 * 测试 calculate-staking-rewards Edge Function
 * 用于验证积分释放系统、质押池数据读取和奖励领取功能是否正常

 * === 使用示例 ===
 * node test/test-edge-function.js                # 测试所有功能
 * node test/test-edge-function.js all            # 测试所有功能
 * node test/test-edge-function.js calculate      # 只测试计算功能
 * node test/test-edge-function.js claim          # 只测试领取功能
 *
 */

// 远程生产环境 URL
// const EDGE_FUNCTION_URL = 'https://sujwqwyumtbmhwrbdrpe.supabase.co/functions/v1/calculate-staking-rewards';

// 如果需要测试本地环境，取消注释下面这行
const EDGE_FUNCTION_URL = 'http://localhost:54321/functions/v1/calculate-staking-rewards';

// 测试用的钱包地址 - 只测试当前用户的钱包
const TEST_WALLET_ADDRESSES = [
  '4o3E6G5wTwcqLR2J278h27pGQmU6YesSNKSjUdQbhFK9', // 部署者钱包（当前用户）
];

// 测试用的真实JWT token（仅 claim 操作需要）
//
// 🔐 如何获取 JWT Token：
// 1. 在浏览器中登录你的 Chain Fox 应用 (https://chain-fox.vercel.app)
// 2. 打开开发者工具控制台 (F12)
// 3. 运行以下命令：
//    const authData = JSON.parse(localStorage.getItem('sb-sujwqwyumtbmhwrbdrpe-auth-token'));
//    console.log('JWT Token:', authData.access_token);
// 4. 复制输出的 access_token 值，设置到下面的变量中
// 5. 确保你的钱包地址已在应用中验证并绑定到用户账户
//
// 注意：JWT token 有过期时间，如果测试失败可能需要重新获取
let REAL_JWT_TOKEN = "";

// 示例（请替换为你的真实 token）：
// REAL_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

/**
 * 调用 Edge Function
 */
async function callEdgeFunction(walletAddress, action = 'calculate') {
  try {
    console.log(`\n🔍 测试钱包地址: ${walletAddress}`);
    console.log(`🎯 操作类型: ${action}`);

    // 根据环境选择不同的认证方式
    const headers = {
      'Content-Type': 'application/json'
    };

    // 临时跳过认证验证用于测试
    console.log('🧪 测试模式：跳过认证验证');

    // 对于非本地环境，仍然添加匿名认证以防万一
    if (!EDGE_FUNCTION_URL.includes('localhost')) {
      headers['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1andxd3l1bXRibWh3cmJkcnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzOTEzMTIsImV4cCI6MjA1ODk2NzMxMn0.3vwAaVjjJKkdSfMJu57ZvyCOV0W2zBO1b2m5RdSIAu4';
      console.log('☁️ 使用生产环境，添加匿名认证');
    } else {
      console.log('🏠 使用本地环境');
    }

    const requestBody = {
      wallet_address: walletAddress
    };

    // 如果是 claim 操作，添加 action 参数
    if (action === 'claim') {
      requestBody.action = 'claim';
    }

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    console.log(`📡 响应状态: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ 请求失败: ${errorText}`);

      // 解析错误信息
      try {
        const errorData = JSON.parse(errorText);
        console.log('\n🔍 错误详情:');
        console.log(`  错误代码: ${errorData.error}`);
        console.log(`  错误消息: ${errorData.message}`);
        if (errorData.details) {
          console.log(`  验证步骤: ${errorData.details.verification_step}`);
          console.log(`  失败原因: ${errorData.details.reason}`);
        }
      } catch (parseError) {
        console.log('无法解析错误响应');
      }

      // 如果是 API key 错误，提供解决方案
      if (errorText.includes('invalid api key')) {
        console.log('\n💡 解决方案:');
        console.log('1. 检查 supabase/.env 文件中的 HELIUS_API_KEY 是否正确');
        console.log('2. 确保本地 Supabase 服务正在运行:');
        console.log('   supabase functions serve calculate-staking-rewards');
        console.log('3. 检查 Helius API key 是否有效且有足够的配额');
      }

      return null;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`❌ 网络错误: ${error.message}`);
    return null;
  }
}

/**
 * 格式化显示结果
 */
function displayResults(data, action = 'calculate') {
  if (!data || !data.success) {
    console.error('❌ 函数执行失败:', data?.error || '未知错误');
    if (data?.message) {
      console.error(`错误消息: ${data.message}`);
    }
    return;
  }

  const result = data.data;
  console.log('\n✅ 函数执行成功!');

  // 如果是 claim 操作，显示 claim 结果
  if (action === 'claim') {
    console.log('\n🎉 奖励领取成功!');
    console.log('\n💰 领取详情:');
    console.log(`  领取金额: ${result.claimed_amount} 积分`);
    console.log(`  新余额: ${result.new_balance} 积分`);
    console.log(`  交易ID: ${result.transaction_id}`);
    console.log(`  记录ID: ${result.claim_record_id}`);
    console.log(`  领取时间: ${result.claim_timestamp}`);
    console.log(`  验证通过: ${result.verification_passed ? '是' : '否'}`);
    return;
  }
  
  // === 您的质押信息 ===
  console.log('\n=== 您的质押信息 ===');

  if (result.debug_info?.user_stake_result?.debug?.userStakePDA) {
    console.log(`用户质押账户: ${result.debug_info.user_stake_result.debug.userStakePDA}`);
  }

  // 格式化质押数量（从 wei 转换为 CFX）
  const stakedAmountCFX = result.staked_amount !== "0"
    ? (parseInt(result.staked_amount) / 1000000).toLocaleString()
    : "0";
  console.log(`质押数量: ${stakedAmountCFX} CFX`);

  if (result.debug_info?.user_stake_result?.data?.lastStakeSlot) {
    console.log(`最后质押 Slot: ${result.debug_info.user_stake_result.data.lastStakeSlot}`);
  }

  // 提取状态
  if (result.withdrawal_requested) {
    console.log(`提取状态: 已申请提取`);
    if (result.debug_info?.user_stake_result?.data?.unlockSlot) {
      console.log(`解锁 Slot: ${result.debug_info.user_stake_result.data.unlockSlot}`);
    }

    if (result.stake_status === 'ready_to_withdraw') {
      console.log(`✅ 质押可以执行提取`);
    } else if (result.stake_status === 'withdrawal_requested') {
      console.log(`⏳ 锁定期中，等待解锁`);
    }
  } else if (result.staked_amount !== "0") {
    console.log(`提取状态: 未申请提取`);
    console.log(`✅ 正在质押，获得奖励`);
  } else {
    console.log(`提取状态: 未质押`);
  }

  console.log(`可用奖励: ${result.available_rewards} 积分`);
  console.log(`当前 Slot: ${result.current_slot}`);

  // 积分释放系统统计
  if (result.rewards_statistics) {
    const stats = result.rewards_statistics;
    console.log('\n🎯 积分释放系统统计:');
    console.log(`  系统状态: ${stats.system_active ? '✅ 已启动' : '❌ 未启动'}`);
    console.log(`  起始时间: ${stats.start_time_info.date_readable}`);
    console.log(`  总积分池: ${stats.total_rewards_pool.toLocaleString()} 积分`);
    console.log(`  已释放: ${stats.total_released.toLocaleString()} 积分`);
    console.log(`  剩余积分: ${stats.remaining_rewards.toLocaleString()} 积分`);
    console.log(`  释放进度: ${stats.total_progress_percentage}%`);
    
    // 当前阶段
    console.log('\n📅 当前阶段:');
    console.log(`  阶段: ${stats.current_phase.phase}`);
    console.log(`  年份: 第 ${stats.current_phase.year} 年`);
    console.log(`  年内进度: ${(stats.current_phase.progress_in_year * 100).toFixed(2)}%`);
    console.log(`  当前释放速率: ${stats.current_phase.current_year_rate.toFixed(6)} 积分/秒`);
    console.log(`  已运行天数: ${stats.days_since_start.toFixed(2)} 天`);
    
    // 未来30天预估
    console.log('\n🔮 未来30天预估:');
    console.log(`  预估释放: ${stats.next_30_days.next_30_days_release.toLocaleString()} 积分`);
    console.log(`  日均释放: ${stats.next_30_days.daily_average.toLocaleString()} 积分/天`);
    console.log(`  周期结束: ${new Date(stats.next_30_days.period_end_date).toLocaleDateString()}`);
    
    // 释放速率
    console.log('\n⚡ 各年份释放速率:');
    console.log(`  第1年: ${stats.release_rates.year_1_per_day.toFixed(2)} 积分/天`);
    console.log(`  第2年: ${stats.release_rates.year_2_per_day.toFixed(2)} 积分/天`);
    console.log(`  第3年: ${stats.release_rates.year_3_per_day.toFixed(2)} 积分/天`);
  }

  // 质押池信息
  if (result.debug_info?.stake_pool_data) {
    const pool = result.debug_info.stake_pool_data;
    console.log('\n🏦 质押池信息:');
    console.log(`  管理员: ${pool.authority}`);
    console.log(`  代币铸造: ${pool.tokenMint}`);
    console.log(`  代币金库: ${pool.tokenVault}`);
    console.log(`  总质押量: ${pool.totalStaked} CFX`);
    console.log(`  锁定期: ${pool.lockDurationSlots} slots`);
    console.log(`  紧急模式: ${pool.emergencyMode ? '是' : '否'}`);
  }

  // 调试信息
  if (result.debug_info?.user_stake_result) {
    const userResult = result.debug_info.user_stake_result;
    console.log('\n🔧 用户质押调试信息:');
    console.log(`  查询成功: ${userResult.success ? '是' : '否'}`);
    if (userResult.error) {
      console.log(`  错误信息: ${userResult.error}`);
    }
    if (userResult.debug) {
      console.log(`  用户质押PDA: ${userResult.debug.userStakePDA}`);
      console.log(`  账户存在: ${userResult.debug.accountExists ? '是' : '否'}`);
    }
    if (userResult.data) {
      console.log(`  质押数据: ${JSON.stringify(userResult.data, null, 2)}`);
    }
  }
}

/**
 * 测试计算功能
 */
async function testCalculateFunction() {
  console.log('\n� === 测试计算功能 ===');

  for (const walletAddress of TEST_WALLET_ADDRESSES) {
    const result = await callEdgeFunction(walletAddress, 'calculate');
    if (result) {
      displayResults(result, 'calculate');
    }

    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * 测试领取功能
 */
async function testClaimFunction() {
  console.log('\n💰 === 测试领取功能 ===');

  for (const walletAddress of TEST_WALLET_ADDRESSES) {
    const result = await callEdgeFunction(walletAddress, 'claim');
    if (result) {
      displayResults(result, 'claim');
    }

    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始测试 calculate-staking-rewards Edge Function');
  console.log(`📍 Edge Function URL: ${EDGE_FUNCTION_URL}`);

  // 检查命令行参数
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';

  console.log(`🎯 测试类型: ${testType}`);

  if (testType === 'calculate' || testType === 'all') {
    await testCalculateFunction();
  }

  if (testType === 'claim' || testType === 'all') {
    await testClaimFunction();
  }

  if (testType !== 'calculate' && testType !== 'claim' && testType !== 'all') {
    console.log('\n❌ 无效的测试类型!');
    console.log('用法:');
    console.log('  node test/test-edge-function.js [calculate|claim|all]');
    console.log('');
    console.log('示例:');
    console.log('  node test/test-edge-function.js calculate  # 只测试计算功能');
    console.log('  node test/test-edge-function.js claim      # 只测试领取功能');
    console.log('  node test/test-edge-function.js all        # 测试所有功能（默认）');
    console.log('  node test/test-edge-function.js            # 测试所有功能（默认）');
    return;
  }

  console.log('\n🎉 测试完成!');
}

// 运行测试
runTests().catch(console.error);
