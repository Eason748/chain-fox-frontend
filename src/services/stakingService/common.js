import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import programIds from '../../data/program-ids.json';
import { getCurrentNetwork } from '../solanaRpcService.js';
import idlData from '../../data/idl/cfx_stake_core.json';

// Define TOKEN_PROGRAM_ID from environment variable
export const TOKEN_PROGRAM_ID = new PublicKey(import.meta.env.VITE_TOKEN_PROGRAM_ID);

// Helper function to convert string to Uint8Array (same as Buffer.from)
export function stringToUint8Array(str) {
  // 在浏览器中模拟 Buffer.from(str, 'utf8') 的行为
  // TextEncoder 使用 UTF-8 编码，与 Buffer.from(str, 'utf8') 相同
  return new TextEncoder().encode(str);
}

/**
 * Calculate associated token account address manually
 */
export async function getAssociatedTokenAddress(mint, owner) {
  const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(import.meta.env.VITE_ASSOCIATED_TOKEN_PROGRAM_ID);

  const [address] = await PublicKey.findProgramAddress(
    [
      owner.toBytes(),
      TOKEN_PROGRAM_ID.toBytes(),
      mint.toBytes(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

// 动态获取合约地址（根据当前网络）
function getProgramAddresses() {
  const network = getCurrentNetwork();

  // 所有网络都从 program-ids.json 读取，如果有环境变量则优先使用环境变量
  return {
    PROGRAM_ID: new PublicKey(network.config.stakeProgramId),
    CFX_TOKEN_MINT: new PublicKey(network.config.cfxToken)
  };
}

// 获取当前网络的合约地址
export const { PROGRAM_ID, CFX_TOKEN_MINT } = getProgramAddresses();

// Staking limits and constants (from documentation)
export const MIN_STAKE_AMOUNT = 10000 * 1e6; // 10,000 CFX (6 decimals)
export const MAX_PERSONAL_STAKE = 100000000 * 1e6; // 100,000,000 CFX per user
export const MAX_TOTAL_POOL_SIZE = 400000000 * 1e6; // 400,000,000 CFX total
export const DEFAULT_LOCK_DURATION_DAYS = 30; // 30 days default lock period
export const MAX_LOCK_DURATION_DAYS = 365; // 1 year maximum
export const CFX_DECIMALS = 6;

// 用户质押状态枚举
export const UserStakeStatus = {
  NOT_STAKED: 'not_staked',           // 未质押
  STAKED: 'staked',                   // 已质押，未申请提取
  WITHDRAWAL_REQUESTED: 'withdrawal_requested', // 已申请提取，锁定期中
  READY_TO_WITHDRAW: 'ready_to_withdraw'       // 锁定期结束，可提取
};

// 错误类型映射
export const ERROR_MESSAGES = {
  'NoStakedTokens': '您还没有质押任何 CFX 代币',
  'WithdrawalAlreadyRequested': '您已经申请过提取，请等待锁定期结束',
  'TokensStillLocked': '锁定期尚未结束，请稍后再试',
  'BelowMinimumStakeAmount': '质押金额低于最小要求 (10,000 CFX)',
  'ContractPaused': '合约处于紧急模式，暂停新的质押操作',
  'WithdrawalNotRequested': '您还没有申请提取',
  'InsufficientFunds': '余额不足',
  'AmountMustBeGreaterThanZero': '金额必须大于零'
};

// Instruction discriminators (based on Anchor IDL)
export const INSTRUCTION_DISCRIMINATORS = {
  CREATE_USER_STAKE: 0,
  STAKE: 1,
  REQUEST_WITHDRAWAL: 2,
  WITHDRAW: 3,
  INITIALIZE: 4,
  TOGGLE_PAUSE: 5
};

// Error codes from the contract
export const STAKE_ERRORS = {
  0x1770: 'Amount must be greater than zero',
  0x1771: 'Below minimum stake amount (10,000 CFX)',
  0x1772: 'Exceeds maximum stake amount (100,000,000 CFX)',
  0x1773: 'Contract is paused',
  0x1774: 'No staked tokens',
  0x1775: 'Withdrawal not requested',
  0x1776: 'Tokens still locked',
  0x1777: 'Invalid token mint',
  0x1778: 'Exceeds maximum total pool size',
  0x1779: 'Reentrancy detected',
  0x177A: 'Invalid multisig signer',
  0x177B: 'Proposal already executed',
  0x177C: 'Insufficient signatures',
  0x177D: 'Invalid proposal data',
  0x177E: 'Proposal expired',
  0x177F: 'Invalid time range',
};

/**
 * Parse contract error codes into human-readable messages
 */
export function parseContractError(error) {
  // 首先尝试获取错误代码
  const errorCode = error.code || error.error?.code;

  // 如果有错误代码，尝试匹配已知错误
  if (errorCode !== undefined) {
    return STAKE_ERRORS[errorCode] || `Contract error code: ${errorCode}`;
  }

  // 检查错误消息中的关键词
  const errorMessage = error.message || error.toString();

  // 使用新的错误映射
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) {
      return message;
    }
  }

  // 检查常见的错误模式
  if (errorMessage.includes('User rejected')) {
    return '用户取消了交易';
  }
  if (errorMessage.includes('insufficient funds')) {
    return '余额不足';
  }
  if (errorMessage.includes('Account does not exist')) {
    return '账户不存在或未初始化';
  }
  if (errorMessage.includes('Invalid instruction')) {
    return '无效的交易指令';
  }
  if (errorMessage.includes('Program failed to complete')) {
    return '智能合约执行失败';
  }
  if (errorMessage.includes('Wallet not connected')) {
    return '钱包未连接';
  }
  if (errorMessage.includes('Simulation failed')) {
    return '交易模拟失败，请检查账户状态';
  }

  // 返回原始错误消息（截取前100个字符避免过长）
  return errorMessage.length > 100 ?
    errorMessage.substring(0, 100) + '...' :
    errorMessage || '操作失败，请重试';
}

/**
 * Validate stake amount
 */
export function validateStakeAmount(amount) {
  const MAX_STAKE = 100000000 * 1e6; // 100,000,000 CFX

  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  if (amount < MIN_STAKE_AMOUNT) {
    throw new Error('Minimum stake is 10,000 CFX');
  }

  if (amount > MAX_STAKE) {
    throw new Error('Maximum stake is 100,000,000 CFX');
  }

  return true;
}

/**
 * Get stake pool PDA
 */
export async function getStakePoolPDA() {
  const [pda] = await PublicKey.findProgramAddress(
    [stringToUint8Array('stake_pool'), CFX_TOKEN_MINT.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Get user stake PDA
 */
export async function getUserStakePDA(userPublicKey) {
  const stakePoolPDA = await getStakePoolPDA();
  const [pda] = await PublicKey.findProgramAddress(
    [
      stringToUint8Array('user_stake'),
      stakePoolPDA.toBuffer(),
      userPublicKey.toBuffer()
    ],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Check if user stake account exists on the blockchain
 */
export async function checkUserStakeAccount(connection, userPublicKey) {
  try {
    const userStakePDA = await getUserStakePDA(userPublicKey);
    const accountInfo = await connection.getAccountInfo(userStakePDA);

    // Account exists if accountInfo is not null and has the correct owner
    return accountInfo !== null && accountInfo.owner.equals(PROGRAM_ID);
  } catch (error) {
    console.error('Error checking user stake account:', error);
    return false;
  }
}

// IDL 缓存
let cachedIdl = null;

/**
 * 加载 IDL 文件
 */
async function loadIdl() {
  if (cachedIdl) {
    return cachedIdl;
  }

  try {
    // 直接使用导入的 IDL 数据，避免 fetch 路径问题
    cachedIdl = idlData;
    // 移除生产环境日志
    return cachedIdl;
  } catch (error) {
    console.error('加载 IDL 文件失败:', error);
    throw new Error(`无法加载 IDL 文件: ${error.message}`);
  }
}

/**
 * 从 IDL 获取指令信息
 */
async function getInstructionFromIdl(instructionName) {
  const idl = await loadIdl();
  const instruction = idl.instructions.find(inst => inst.name === instructionName);

  if (!instruction) {
    throw new Error(`在 IDL 中找不到指令: ${instructionName}`);
  }

  return instruction;
}

/**
 * 将 camelCase 转换为 snake_case
 */
function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * 从 IDL 计算指令判别器
 * 基于 Anchor 的 sha256('global:' + instruction_name) 方法
 * Anchor 将 camelCase 指令名转换为 snake_case
 */
export async function calculateInstructionDiscriminator(instructionName) {
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

/**
 * 根据 IDL 中的类型定义序列化参数
 */
function serializeInstructionArgs(instruction, args) {
  if (!instruction.args || instruction.args.length === 0) {
    return new Uint8Array(0);
  }

  let totalSize = 0;
  const serializedArgs = [];

  // 计算总大小并序列化每个参数
  for (const arg of instruction.args) {
    let serialized;
    const value = args[arg.name];

    if (value === undefined) {
      throw new Error(`缺少必需的参数: ${arg.name}`);
    }

    switch (arg.type) {
      case 'u64':
        serialized = new Uint8Array(8);
        const dataView = new DataView(serialized.buffer);
        dataView.setBigUint64(0, BigInt(value), true); // little-endian
        break;
      case 'u8':
        serialized = new Uint8Array([value]);
        break;
      case 'bool':
        serialized = new Uint8Array([value ? 1 : 0]);
        break;
      default:
        throw new Error(`不支持的参数类型: ${arg.type}`);
    }

    serializedArgs.push(serialized);
    totalSize += serialized.length;
  }

  // 合并所有序列化的参数
  const result = new Uint8Array(totalSize);
  let offset = 0;
  for (const serialized of serializedArgs) {
    result.set(serialized, offset);
    offset += serialized.length;
  }

  return result;
}

/**
 * 创建指令数据（基于 IDL）
 */
export async function createInstructionData(instructionName, args = {}) {
  // 从 IDL 获取指令信息
  const instruction = await getInstructionFromIdl(instructionName);

  // 计算判别器
  const discriminator = await calculateInstructionDiscriminator(instructionName);

  // 移除生产环境日志

  // 序列化参数
  const serializedArgs = serializeInstructionArgs(instruction, args);

  // 合并判别器和参数
  const result = new Uint8Array(discriminator.length + serializedArgs.length);
  result.set(discriminator, 0);
  result.set(serializedArgs, discriminator.length);

  return result;
}

/**
 * 验证账户列表是否与 IDL 匹配
 */
async function validateAccounts(instructionName, accounts) {
  const instruction = await getInstructionFromIdl(instructionName);

  if (instruction.accounts.length !== accounts.length) {
    console.warn(`${instructionName} 账户数量不匹配: 期望 ${instruction.accounts.length}, 实际 ${accounts.length}`);
    console.warn('IDL 期望的账户:', instruction.accounts.map(acc => acc.name));
    console.warn('实际传入的账户:', accounts.map((acc, i) => `${i}: ${acc.pubkey.toString()}`));
  }

  // 可以添加更详细的账户验证逻辑
  for (let i = 0; i < Math.min(instruction.accounts.length, accounts.length); i++) {
    const expectedAccount = instruction.accounts[i];
    const actualAccount = accounts[i];

    // 移除生产环境日志 - 账户验证信息
    // 保留验证逻辑但不输出详细日志
    const accountInfo = {
      pubkey: actualAccount.pubkey.toString(),
      isSigner: actualAccount.isSigner,
      isWritable: actualAccount.isWritable,
      expected: {
        isSigner: expectedAccount.isSigner || false,
        isMut: expectedAccount.isMut || false
      }
    };
  }
}

/**
 * 创建交易指令（基于 IDL）
 */
export async function createStakingInstruction(instructionName, accounts, args = {}) {
  // 验证账户（开发模式下）
  if (process.env.NODE_ENV === 'development') {
    await validateAccounts(instructionName, accounts);
  }

  const data = await createInstructionData(instructionName, args);

  return new TransactionInstruction({
    keys: accounts,
    programId: PROGRAM_ID,
    data: data
  });
}

/**
 * 获取 IDL 信息（用于调试）
 */
export async function getIdlInfo() {
  const idl = await loadIdl();
  return {
    name: idl.name,
    version: idl.version,
    instructions: idl.instructions.map(inst => ({
      name: inst.name,
      accounts: inst.accounts.map(acc => acc.name),
      args: inst.args.map(arg => `${arg.name}: ${arg.type}`)
    }))
  };
}
