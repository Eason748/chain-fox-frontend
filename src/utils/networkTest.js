/**
 * 网络切换测试工具
 * 用于验证不同网络配置是否正确
 */

import { getCurrentNetwork, getNetworkInfo } from '../services/solanaRpcService.js';
import { showCurrentNetwork } from '../services/networkSwitcher.js';

/**
 * 测试当前网络配置
 */
export async function testCurrentNetwork() {
  console.log('🧪 开始网络配置测试...\n');
  
  try {
    // 1. 显示当前网络信息
    await showCurrentNetwork();
    
    console.log('\n' + '='.repeat(50));
    
    // 2. 验证网络配置
    const network = getCurrentNetwork();
    console.log('✅ 网络配置验证:');
    
    // 检查必要的配置项
    const checks = [
      { name: '网络类型', value: network.type, required: true },
      { name: '网络名称', value: network.config.name, required: true },
      { name: 'RPC URL', value: network.config.rpcUrl, required: true },
      { name: 'CFX Token', value: network.config.cfxToken, required: true },
      { name: '质押程序ID', value: network.config.stakeProgramId, required: false }
    ];
    
    checks.forEach(check => {
      if (check.value) {
        console.log(`  ✅ ${check.name}: ${check.value}`);
      } else if (check.required) {
        console.log(`  ❌ ${check.name}: 缺失 (必需)`);
      } else {
        console.log(`  ⚠️ ${check.name}: 未配置 (可选)`);
      }
    });
    
    // 3. 测试网络连接
    console.log('\n🔗 测试网络连接...');
    const networkInfo = await getNetworkInfo();
    
    if (networkInfo.success) {
      console.log('✅ 网络连接成功');
      console.log(`  当前插槽: ${networkInfo.networkInfo.currentSlot}`);
      console.log(`  Solana 版本: ${networkInfo.networkInfo.version['solana-core']}`);
    } else {
      console.log('❌ 网络连接失败:', networkInfo.error?.message);
    }
    
    console.log('\n🎯 测试完成!');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

/**
 * 显示网络切换指南
 */
export function showNetworkGuide() {
  console.log('📖 Solana 网络切换指南');
  console.log('='.repeat(40));
  console.log('');
  console.log('1. 打开文件: src/services/solanaRpcService.js');
  console.log('2. 找到第18行的 CURRENT_NETWORK 变量');
  console.log('3. 修改为以下值之一:');
  console.log('');
  console.log('   🌐 主网 (生产环境):');
  console.log('   const CURRENT_NETWORK = NETWORK_TYPES.MAINNET;');
  console.log('   - 需要 Helius API 密钥');
  console.log('   - 真实的 SOL 和 CFX 代币');
  console.log('   - 用于生产部署');
  console.log('');
  console.log('   🧪 测试网 (开发测试):');
  console.log('   const CURRENT_NETWORK = NETWORK_TYPES.DEVNET;');
  console.log('   - 需要 Helius API 密钥');
  console.log('   - 免费的测试 SOL');
  console.log('   - 用于开发和测试');
  console.log('');
  console.log('   🏠 本地网络 (当前设置):');
  console.log('   const CURRENT_NETWORK = NETWORK_TYPES.LOCALNET;');
  console.log('   - 不需要 API 密钥');
  console.log('   - 需要运行本地 Solana 验证器');
  console.log('   - 使用 program-ids.json 中的地址');
  console.log('');
  console.log('4. 保存文件并重新启动应用');
  console.log('');
  console.log('💡 提示: 修改后运行 testCurrentNetwork() 验证配置');
}

/**
 * 显示 program-ids.json 信息摘要
 */
export function showProgramIdsInfo() {
  try {
    const programIds = require('../data/program-ids.json');
    
    console.log('📋 Program IDs 信息摘要');
    console.log('='.repeat(40));
    console.log(`网络: ${programIds.network}`);
    console.log(`部署时间: ${programIds.timestamp}`);
    console.log(`部署者: ${programIds.deployer}`);
    console.log('');
    console.log('🏗️ 程序:');
    Object.entries(programIds.programs).forEach(([name, id]) => {
      console.log(`  ${name}: ${id}`);
    });
    console.log('');
    console.log('🪙 代币:');
    Object.entries(programIds.tokens).forEach(([name, address]) => {
      console.log(`  ${name}: ${address}`);
    });
    console.log('');
    console.log('📦 部署的账户:');
    Object.entries(programIds.deployed_accounts).forEach(([name, info]) => {
      console.log(`  ${name}: ${info.address} (${info.type})`);
    });
    
  } catch (error) {
    console.error('❌ 无法读取 program-ids.json:', error.message);
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 启动网络测试...\n');
  showNetworkGuide();
  console.log('\n');
  showProgramIdsInfo();
  console.log('\n');
  testCurrentNetwork();
}
