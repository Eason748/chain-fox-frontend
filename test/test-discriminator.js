// 测试指令判别器计算
import { readFileSync } from 'fs';
import { webcrypto } from 'crypto';

// 在 Node.js 中使用 webcrypto
global.crypto = webcrypto;

// 手动加载 JSON 文件
const programIds = JSON.parse(readFileSync('./src/data/program-ids.json', 'utf8'));
const idlData = JSON.parse(readFileSync('./src/data/idl/cfx_stake_core.json', 'utf8'));

// 模拟 common.js 中的函数
async function getInstructionFromIdl(instructionName) {
  const instruction = idlData.instructions.find(inst => inst.name === instructionName);
  if (!instruction) {
    throw new Error(`在 IDL 中找不到指令: ${instructionName}`);
  }
  return instruction;
}

function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

async function calculateInstructionDiscriminator(instructionName) {
  // 验证指令在 IDL 中存在
  await getInstructionFromIdl(instructionName);

  // 将 camelCase 转换为 snake_case（Anchor 的标准做法）
  const snakeCaseName = camelToSnakeCase(instructionName);

  // 使用 Web Crypto API 计算 SHA256
  const encoder = new TextEncoder();
  const data = encoder.encode('global:' + snakeCaseName);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return hashArray.slice(0, 8); // 取前8字节作为判别器
}

async function testDiscriminator() {
  try {
    console.log('测试 requestWithdrawal 指令判别器...');
    
    const discriminator = await calculateInstructionDiscriminator('requestWithdrawal');
    console.log('计算得到的判别器:', Array.from(discriminator).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // 手动验证 snake_case 转换
    const encoder = new TextEncoder();
    const data = encoder.encode('global:request_withdrawal');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    const manualDiscriminator = hashArray.slice(0, 8);
    
    console.log('手动计算的判别器:', Array.from(manualDiscriminator).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // 比较两个结果
    const isEqual = discriminator.every((byte, index) => byte === manualDiscriminator[index]);
    console.log('判别器是否匹配:', isEqual);
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testDiscriminator();
