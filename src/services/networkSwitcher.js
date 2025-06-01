/**
 * 网络切换示例和说明
 *
 * 如何切换 Solana 网络：
 *
 * 1. 打开 src/services/solanaRpcService.js
 * 2. 找到第17行的 CURRENT_NETWORK 变量
 * 3. 修改为以下值之一：
 *    - NETWORK_TYPES.MAINNET  (主网)
 *    - NETWORK_TYPES.DEVNET   (测试网)
 *    - NETWORK_TYPES.LOCALNET (本地网络)
 *
 * 示例：
 * const CURRENT_NETWORK = NETWORK_TYPES.LOCALNET; // 切换到本地网络
 * const CURRENT_NETWORK = NETWORK_TYPES.DEVNET;   // 切换到测试网
 * const CURRENT_NETWORK = NETWORK_TYPES.MAINNET;  // 切换到主网
 */

import solanaRpcService, { getCurrentNetwork, NETWORK_TYPES } from './solanaRpcService.js';

/**
 * 显示当前网络信息
 */
export async function showCurrentNetwork() {
  const network = getCurrentNetwork();
  console.log('🌐 当前网络配置:');
  console.log(`  网络类型: ${network.type}`);
  console.log(`  网络名称: ${network.config.name}`);
  console.log(`  RPC URL: ${network.config.rpcUrl}`);
  console.log(`  CFX Token: ${network.config.cfxToken}`);
  console.log(`  质押程序ID: ${network.config.stakeProgramId || '未配置'}`);
  console.log(`  需要API密钥: ${network.config.requiresApiKey ? '是' : '否'}`);

  // 获取网络状态
  const networkInfo = await solanaRpcService.getNetworkInfo();
  if (networkInfo.success) {
    console.log('📊 网络状态:');
    console.log(`  版本: ${JSON.stringify(networkInfo.networkInfo.version)}`);
    console.log(`  当前插槽: ${networkInfo.networkInfo.currentSlot}`);

    // 如果是本地网络，显示部署的账户信息
    if (networkInfo.networkInfo.deployedAccounts) {
      console.log('🏗️ 部署的账户:');
      const accounts = networkInfo.networkInfo.deployedAccounts;
      console.log(`  质押池: ${accounts.stake_pool?.address}`);
      console.log(`  代币金库: ${accounts.token_vault?.address}`);
      console.log(`  管理员钱包: ${accounts.authority_wallet?.address}`);
      console.log(`  团队钱包: ${accounts.team_wallet?.address}`);
    }

    if (networkInfo.networkInfo.metadata) {
      // 移除生产环境日志 - 代币信息
      const cfxInfo = networkInfo.networkInfo.metadata.cfx_token_info;
      // 保留变量用于可能的调试需求
      const tokenInfo = {
        name: cfxInfo.name,
        symbol: cfxInfo.symbol,
        decimals: cfxInfo.decimals,
        totalSupply: cfxInfo.total_supply
      };
    }
  } else {
    // 移除生产环境日志 - 网络状态错误
  }
}

/**
 * 测试网络连接
 */
export async function testNetworkConnection() {
  // 移除生产环境日志 - 测试网络连接

  try {
    const initialized = await solanaRpcService.initialize();
    if (initialized) {
      // 移除生产环境日志 - 网络连接成功
      await showCurrentNetwork();
    } else {
      // 移除生产环境日志 - 网络连接失败
    }
  } catch (error) {
    // 移除生产环境日志 - 网络连接错误
  }
}

/**
 * 网络切换指南
 */
export function showNetworkSwitchGuide() {
  console.log('📖 网络切换指南:');
  console.log('');
  console.log('1. 主网 (Mainnet):');
  console.log('   - 用于生产环境');
  console.log('   - 需要 Helius API 密钥');
  console.log('   - 真实的 SOL 和代币');
  console.log('');
  console.log('2. 测试网 (Devnet):');
  console.log('   - 用于开发测试');
  console.log('   - 需要 Helius API 密钥');
  console.log('   - 免费的测试 SOL');
  console.log('');
  console.log('3. 本地网络 (Localnet):');
  console.log('   - 用于本地开发');
  console.log('   - 不需要 API 密钥');
  console.log('   - 需要运行本地 Solana 验证器');
  console.log('');
  console.log('切换方法:');
  console.log('修改 src/services/solanaRpcService.js 第17行:');
  console.log('const CURRENT_NETWORK = NETWORK_TYPES.LOCALNET;');
  console.log('');
}

// 如果直接运行此文件，显示网络信息
if (import.meta.url === `file://${process.argv[1]}`) {
  showNetworkSwitchGuide();
  testNetworkConnection();
}
