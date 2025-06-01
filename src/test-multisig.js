/**
 * 测试多签服务
 */

import multisigService from './services/multisigService.js';

async function testMultisigService() {
  console.log('🧪 开始测试多签服务...');
  
  try {
    // 测试获取多签配置
    console.log('📋 测试获取多签配置...');
    const config = await multisigService.getMultisigConfig();
    console.log('✅ 多签配置:', config);
    
    // 测试获取所有提案
    console.log('📝 测试获取所有提案...');
    const proposals = await multisigService.getAllProposals();
    console.log('✅ 提案列表:', proposals);
    
    // 测试检查多签成员
    console.log('👥 测试检查多签成员...');
    const testAddress = 'So11111111111111111111111111111111111111112'; // 测试地址
    const isSigner = multisigService.isMultisigSigner(testAddress);
    console.log(`✅ 地址 ${testAddress} 是否为多签成员:`, isSigner);
    
    console.log('🎉 多签服务测试完成！');
    
  } catch (error) {
    console.error('❌ 多签服务测试失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 在浏览器控制台中运行测试
if (typeof window !== 'undefined') {
  window.testMultisigService = testMultisigService;
  console.log('💡 在浏览器控制台中运行 testMultisigService() 来测试多签服务');
}

export default testMultisigService;
