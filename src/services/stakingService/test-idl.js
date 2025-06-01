/**
 * IDL 加载和指令创建测试
 * 用于验证基于 IDL 的实现是否正常工作
 */

import { getIdlInfo, createInstructionData } from './common.js';

/**
 * 测试 IDL 加载
 */
export async function testIdlLoading() {
  try {
    console.log('🧪 测试 IDL 加载...');
    
    const idlInfo = await getIdlInfo();
    console.log('✅ IDL 加载成功:');
    console.log(`  程序名称: ${idlInfo.name}`);
    console.log(`  版本: ${idlInfo.version}`);
    console.log('  可用指令:');
    
    idlInfo.instructions.forEach(inst => {
      console.log(`    ${inst.name}:`);
      console.log(`      账户: [${inst.accounts.join(', ')}]`);
      console.log(`      参数: [${inst.args.join(', ')}]`);
    });
    
    return { success: true, data: idlInfo };
  } catch (error) {
    console.error('❌ IDL 加载失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 测试指令数据创建
 */
export async function testInstructionCreation() {
  try {
    console.log('🧪 测试指令数据创建...');
    
    // 测试 requestWithdrawal 指令（无参数）
    console.log('测试 requestWithdrawal 指令...');
    const withdrawalData = await createInstructionData('requestWithdrawal');
    console.log('✅ requestWithdrawal 指令数据:', Array.from(withdrawalData).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // 测试 stake 指令（有参数）
    console.log('测试 stake 指令...');
    const stakeData = await createInstructionData('stake', { amount: '10000000000' }); // 10,000 CFX
    console.log('✅ stake 指令数据:', Array.from(stakeData).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // 测试 createUserStake 指令（有参数）
    console.log('测试 createUserStake 指令...');
    const createData = await createInstructionData('createUserStake', { bump: 255 });
    console.log('✅ createUserStake 指令数据:', Array.from(createData).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    return { 
      success: true, 
      data: {
        requestWithdrawal: withdrawalData,
        stake: stakeData,
        createUserStake: createData
      }
    };
  } catch (error) {
    console.error('❌ 指令创建失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 运行所有测试
 */
export async function runAllTests() {
  console.log('🚀 开始 IDL 和指令创建测试...');
  console.log('');
  
  const results = {
    idlLoading: await testIdlLoading(),
    instructionCreation: await testInstructionCreation()
  };
  
  console.log('');
  console.log('📊 测试结果汇总:');
  console.log(`  IDL 加载: ${results.idlLoading.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`  指令创建: ${results.instructionCreation.success ? '✅ 成功' : '❌ 失败'}`);
  
  const allSuccess = Object.values(results).every(result => result.success);
  console.log(`  总体结果: ${allSuccess ? '✅ 全部通过' : '❌ 存在失败'}`);
  
  return results;
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined' && window.location.search.includes('test-idl')) {
  runAllTests().then(results => {
    console.log('测试完成，结果:', results);
  });
}
