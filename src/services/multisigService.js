/**
 * 多签管理服务
 * 处理多签配置、提案创建、签名和执行
 */

import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import solanaRpcService from './solanaRpcService';
import programIds from '../data/program-ids.json';
import idl from '../data/idl/cfx_stake_core.json';
import { stringToUint8Array } from './stakingService/common.js';

// 程序 ID
const PROGRAM_ID = new PublicKey(programIds.programs.CFX_STAKE_CORE);
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

/**
 * 创建指令数据
 * @param {string} methodName - 方法名
 * @param {Object} args - 参数
 * @returns {Promise<Uint8Array>} 指令数据
 */
async function createInstructionData(methodName, args) {
  // 根据 IDL 查找方法的判别器
  const method = idl.instructions.find(ix => ix.name === methodName);
  if (!method) {
    throw new Error(`Method ${methodName} not found in IDL`);
  }

  // 计算方法判别器 (前8字节) - 使用 Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(`global:${methodName}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  const discriminator = hashArray.slice(0, 8);

  // 序列化参数 (简化版本，使用 JSON)
  const argsString = JSON.stringify(args);
  const argsArray = stringToUint8Array(argsString);

  // 合并判别器和参数
  const result = new Uint8Array(discriminator.length + argsArray.length);
  result.set(discriminator, 0);
  result.set(argsArray, discriminator.length);

  return result;
}

/**
 * 解析多签配置账户数据
 * @param {Uint8Array} data - 账户数据
 * @returns {Object} 解析后的配置
 */
function parseMultisigConfig(data) {
  if (!data || data.length < 8) {
    throw new Error('Invalid multisig config data');
  }

  let offset = 8; // 跳过账户判别器

  // 解析签名者 (3个公钥，每个32字节)
  const signers = [];
  for (let i = 0; i < 3; i++) {
    const signerBytes = data.slice(offset, offset + 32);
    signers.push(new PublicKey(signerBytes));
    offset += 32;
  }

  // 解析阈值 (1字节)
  const threshold = data[offset];
  offset += 1;

  // 解析质押池地址 (32字节)
  const stakePoolBytes = data.slice(offset, offset + 32);
  const stakePool = new PublicKey(stakePoolBytes);
  offset += 32;

  // 解析提案计数 (8字节)
  const proposalCountView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const proposalCount = proposalCountView.getBigUint64(0, true); // little-endian
  offset += 8;

  // 解析 bump (1字节)
  const bump = data[offset];

  return {
    signers,
    threshold,
    stakePool,
    proposalCount: Number(proposalCount),
    bump
  };
}

/**
 * 解析提案账户数据
 * @param {Uint8Array} data - 账户数据
 * @returns {Object} 解析后的提案
 */
function parseProposal(data) {
  if (!data || data.length < 8) {
    throw new Error('Invalid proposal data');
  }

  let offset = 8; // 跳过账户判别器

  // 解析提案 ID (8字节)
  const idView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const id = idView.getBigUint64(0, true); // little-endian
  offset += 8;

  // 解析提案类型 (1字节枚举)
  const proposalTypeIndex = data[offset];
  offset += 1;

  const proposalTypes = ['TogglePause', 'UpdateAuthority', 'UpdateTeamWallet', 'AdminWithdraw'];
  const proposalType = proposalTypes[proposalTypeIndex] || 'Unknown';

  // 解析提案者 (32字节)
  const proposerBytes = data.slice(offset, offset + 32);
  const proposer = new PublicKey(proposerBytes);
  offset += 32;

  // 解析多签配置地址 (32字节)
  const multisigConfigBytes = data.slice(offset, offset + 32);
  const multisigConfig = new PublicKey(multisigConfigBytes);
  offset += 32;

  // 解析状态 (1字节枚举)
  const statusIndex = data[offset];
  offset += 1;

  const statuses = ['Pending', 'Approved', 'Executed', 'Rejected'];
  const status = statuses[statusIndex] || 'Unknown';

  // 解析签名状态 (3个布尔值，每个1字节)
  const signatures = [];
  for (let i = 0; i < 3; i++) {
    signatures.push(data[offset] === 1);
    offset += 1;
  }

  // 解析签名计数 (1字节)
  const signatureCount = data[offset];
  offset += 1;

  // 解析创建时间 (8字节)
  const createdAtView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const createdAt = createdAtView.getBigUint64(0, true); // little-endian
  offset += 8;

  // 解析执行时间 (可选，1字节标志 + 8字节时间戳)
  const hasExecutedAt = data[offset] === 1;
  offset += 1;
  let executedAt = null;
  if (hasExecutedAt) {
    const executedAtView = new DataView(data.buffer, data.byteOffset + offset, 8);
    executedAt = executedAtView.getBigUint64(0, true); // little-endian
    offset += 8;
  }

  // 解析数据长度和数据
  const dataLengthView = new DataView(data.buffer, data.byteOffset + offset, 4);
  const dataLength = dataLengthView.getUint32(0, true); // little-endian
  offset += 4;
  const proposalData = data.slice(offset, offset + dataLength);
  offset += dataLength;

  // 解析 bump (1字节)
  const bump = data[offset];

  return {
    id: Number(id),
    proposalType,
    proposer,
    multisigConfig,
    status,
    signatures,
    signatureCount,
    createdAt: Number(createdAt),
    executedAt: executedAt ? Number(executedAt) : null,
    data: proposalData,
    bump
  };
}

/**
 * 多签钱包地址列表 - 从 program-ids.json 中的 multisig_config.signers 读取
 * 额外添加合约部署地址以便查看界面
 */
export const MULTISIG_SIGNERS = [
  ...programIds.deployed_accounts.multisig_config.signers,
  programIds.deployed_accounts.authority_wallet.address  // 合约部署地址
];

/**
 * 多签阈值 - 从 program-ids.json 中的 multisig_config.threshold 读取
 */
export const MULTISIG_THRESHOLD = programIds.deployed_accounts.multisig_config.threshold;

/**
 * 提案类型枚举
 */
export const ProposalType = {
  TogglePause: { togglePause: {} },
  UpdateAuthority: { updateAuthority: {} },
  UpdateTeamWallet: { updateTeamWallet: {} },
  AdminWithdraw: { adminWithdraw: {} }
};

/**
 * 提案状态枚举
 */
export const ProposalStatus = {
  Pending: { pending: {} },
  Approved: { approved: {} },
  Executed: { executed: {} },
  Rejected: { rejected: {} }
};

/**
 * 检查当前钱包是否为多签成员
 * @param {string} walletAddress - 钱包地址
 * @returns {boolean} 是否为多签成员
 */
export function isMultisigSigner(walletAddress) {
  if (!walletAddress) return false;
  
  return MULTISIG_SIGNERS.includes(walletAddress);
}

/**
 * 获取多签配置PDA地址
 * @returns {Promise<{address: PublicKey, bump: number}>}
 */
export async function getMultisigConfigPDA() {
  const stakePoolAddress = new PublicKey(programIds.deployed_accounts.stake_pool.address);

  const [address, bump] = await PublicKey.findProgramAddress(
    [
      stringToUint8Array('multisig_config'),
      stakePoolAddress.toBytes()
    ],
    PROGRAM_ID
  );

  return { address, bump };
}

/**
 * 获取提案PDA地址
 * @param {number} proposalId - 提案ID
 * @returns {Promise<{address: PublicKey, bump: number}>}
 */
export async function getProposalPDA(proposalId) {
  const { address: multisigConfigAddress } = await getMultisigConfigPDA();

  // 创建 8 字节的提案 ID
  const proposalIdArray = new Uint8Array(8);
  const dataView = new DataView(proposalIdArray.buffer);
  dataView.setBigUint64(0, BigInt(proposalId), true); // little-endian

  const [address, bump] = await PublicKey.findProgramAddress(
    [
      stringToUint8Array('proposal'),
      multisigConfigAddress.toBytes(),
      proposalIdArray
    ],
    PROGRAM_ID
  );

  return { address, bump };
}

/**
 * 获取多签配置信息
 * @returns {Promise<Object|null>} 多签配置数据
 */
export async function getMultisigConfig() {
  try {
    const connection = await solanaRpcService.getConnection();
    const { address } = await getMultisigConfigPDA();

    const accountInfo = await connection.getAccountInfo(address);
    if (!accountInfo) {
      return null;
    }
    
    // 解析账户数据
    const config = parseMultisigConfig(accountInfo.data);

    return {
      address: address.toString(),
      signers: config.signers.map(signer => signer.toString()),
      threshold: config.threshold,
      stakePool: config.stakePool.toString(),
      proposalCount: config.proposalCount,
      bump: config.bump
    };
  } catch (error) {
    console.error('获取多签配置失败:', error);
    return null;
  }
}

/**
 * 获取提案信息
 * @param {number} proposalId - 提案ID
 * @returns {Promise<Object|null>} 提案数据
 */
export async function getProposal(proposalId) {
  try {
    const connection = await solanaRpcService.getConnection();
    const { address } = await getProposalPDA(proposalId);

    const accountInfo = await connection.getAccountInfo(address);
    if (!accountInfo) {
      return null;
    }
    
    // 解析提案数据
    const proposal = parseProposal(accountInfo.data);

    return {
      id: proposal.id,
      proposalType: proposal.proposalType,
      proposer: proposal.proposer.toString(),
      multisigConfig: proposal.multisigConfig.toString(),
      status: proposal.status,
      signatures: proposal.signatures,
      signatureCount: proposal.signatureCount,
      createdAt: proposal.createdAt,
      executedAt: proposal.executedAt,
      data: proposal.data,
      bump: proposal.bump
    };
  } catch (error) {
    console.error('获取提案信息失败:', error);
    return null;
  }
}

/**
 * 获取所有提案
 * @returns {Promise<Array>} 提案列表
 */
export async function getAllProposals() {
  try {
    const multisigConfig = await getMultisigConfig();
    if (!multisigConfig) {
      return [];
    }

    const proposals = [];
    for (let i = 0; i < multisigConfig.proposalCount; i++) {
      const proposal = await getProposal(i);
      if (proposal) {
        proposals.push(proposal);
      }
    }

    return proposals;
  } catch (error) {
    console.error('获取所有提案失败:', error);
    return [];
  }
}

/**
 * 创建管理员提取提案
 * @param {Object} params - 参数
 * @param {string} params.walletAddress - 提案者钱包地址
 * @param {number} params.amount - 提取金额 (lamports)
 * @param {string} params.recipientAddress - 接收者地址
 * @returns {Promise<Object>} 交易指令
 */
export async function createAdminWithdrawProposal({ walletAddress, amount, recipientAddress }) {
  try {
    if (!isMultisigSigner(walletAddress)) {
      throw new Error('只有多签成员才能创建提案');
    }
    
    const proposer = new PublicKey(walletAddress);
    const recipient = new PublicKey(recipientAddress);
    
    // 获取多签配置
    const multisigConfig = await getMultisigConfig();
    if (!multisigConfig) {
      throw new Error('多签配置不存在');
    }
    
    const { address: multisigConfigAddress } = await getMultisigConfigPDA();
    const { address: proposalAddress, bump: proposalBump } = await getProposalPDA(multisigConfig.proposalCount);
    
    // 构建提案数据: [amount: 8 bytes][recipient: 32 bytes]
    const proposalData = new Uint8Array(40);
    const dataView = new DataView(proposalData.buffer);
    dataView.setBigUint64(0, BigInt(amount), true); // little-endian
    proposalData.set(recipient.toBytes(), 8);

    // 创建指令数据
    const instructionData = await createInstructionData('createProposal', {
      proposalType: 'AdminWithdraw',
      data: Array.from(proposalData),
      proposalBump
    });
    
    return new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: proposalAddress, isSigner: false, isWritable: true },
        { pubkey: multisigConfigAddress, isSigner: false, isWritable: true },
        { pubkey: proposer, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
      ],
      data: instructionData
    });
  } catch (error) {
    console.error('创建管理员提取提案失败:', error);
    throw error;
  }
}

/**
 * 签名提案
 * @param {Object} params - 参数
 * @param {string} params.walletAddress - 签名者钱包地址
 * @param {number} params.proposalId - 提案ID
 * @returns {Promise<Object>} 交易指令
 */
export async function signProposal({ walletAddress, proposalId }) {
  try {
    if (!isMultisigSigner(walletAddress)) {
      throw new Error('只有多签成员才能签名提案');
    }
    
    const signer = new PublicKey(walletAddress);
    
    const { address: proposalAddress } = await getProposalPDA(proposalId);
    const { address: multisigConfigAddress } = await getMultisigConfigPDA();
    
    // 创建指令数据
    const instructionData = await createInstructionData('signProposal', {});
    
    return new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: proposalAddress, isSigner: false, isWritable: true },
        { pubkey: multisigConfigAddress, isSigner: false, isWritable: false },
        { pubkey: signer, isSigner: true, isWritable: false }
      ],
      data: instructionData
    });
  } catch (error) {
    console.error('签名提案失败:', error);
    throw error;
  }
}

/**
 * 执行管理员提取提案
 * @param {Object} params - 参数
 * @param {string} params.walletAddress - 执行者钱包地址
 * @param {number} params.proposalId - 提案ID
 * @param {string} params.recipientTokenAccount - 接收者代币账户
 * @returns {Promise<Object>} 交易指令
 */
export async function executeAdminWithdraw({ walletAddress, proposalId, recipientTokenAccount }) {
  try {
    const executor = new PublicKey(walletAddress);
    const recipientAccount = new PublicKey(recipientTokenAccount);
    
    const { address: proposalAddress } = await getProposalPDA(proposalId);
    const { address: multisigConfigAddress } = await getMultisigConfigPDA();
    const stakePoolAddress = new PublicKey(programIds.deployed_accounts.stake_pool.address);
    const tokenVaultAddress = new PublicKey(programIds.deployed_accounts.token_vault.address);
    
    // 创建指令数据
    const instructionData = await createInstructionData('executeAdminWithdraw', {});
    
    return new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: proposalAddress, isSigner: false, isWritable: true },
        { pubkey: multisigConfigAddress, isSigner: false, isWritable: false },
        { pubkey: stakePoolAddress, isSigner: false, isWritable: true },
        { pubkey: stakePoolAddress, isSigner: false, isWritable: false }, // stake_pool_authority
        { pubkey: tokenVaultAddress, isSigner: false, isWritable: true },
        { pubkey: recipientAccount, isSigner: false, isWritable: true },
        { pubkey: executor, isSigner: true, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
      ],
      data: instructionData
    });
  } catch (error) {
    console.error('执行管理员提取失败:', error);
    throw error;
  }
}

export default {
  isMultisigSigner,
  getMultisigConfig,
  getProposal,
  getAllProposals,
  createAdminWithdrawProposal,
  signProposal,
  executeAdminWithdraw,
  MULTISIG_SIGNERS,
  MULTISIG_THRESHOLD,
  ProposalType,
  ProposalStatus
};
