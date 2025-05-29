import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import programIds from '../data/program-ids.json';
import { getCurrentNetwork } from './solanaRpcService.js';

// Define TOKEN_PROGRAM_ID manually since import might be problematic
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// Helper function to convert string to Uint8Array (replaces Buffer.from)
function stringToUint8Array(str) {
  return new TextEncoder().encode(str);
}

/**
 * Calculate associated token account address manually
 */
async function getAssociatedTokenAddress(mint, owner) {
  const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

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

  if (network.type === 'localnet') {
    // 本地网络使用 program-ids.json 中的地址
    return {
      PROGRAM_ID: new PublicKey(programIds.programs.CFX_STAKE_CORE),
      CFX_TOKEN_MINT: new PublicKey(programIds.tokens.CFX_TOKEN_MINT)
    };
  } else {
    // 主网和测试网使用环境变量，如果没有配置则使用占位符地址
    // 临时处理：如果环境变量未配置，使用占位符避免报错
    const stakeProgramId = network.config.stakeProgramId || '11111111111111111111111111111111';
    const cfxToken = network.config.cfxToken || '11111111111111111111111111111111';

    return {
      PROGRAM_ID: new PublicKey(stakeProgramId),
      CFX_TOKEN_MINT: new PublicKey(cfxToken)
    };
  }
}

// 获取当前网络的合约地址
const { PROGRAM_ID, CFX_TOKEN_MINT } = getProgramAddresses();

// Staking limits and constants (from documentation)
const MIN_STAKE_AMOUNT = 10000 * 1e6; // 10,000 CFX (6 decimals)
const MAX_PERSONAL_STAKE = 10000000 * 1e6; // 10,000,000 CFX per user
const MAX_TOTAL_POOL_SIZE = 400000000 * 1e6; // 400,000,000 CFX total
const DEFAULT_LOCK_DURATION_DAYS = 30; // 30 days default lock period
const MAX_LOCK_DURATION_DAYS = 365; // 1 year maximum

// Instruction discriminators (based on Anchor IDL)
const INSTRUCTION_DISCRIMINATORS = {
  CREATE_USER_STAKE: 0,
  STAKE: 1,
  REQUEST_WITHDRAWAL: 2,
  WITHDRAW: 3,
  INITIALIZE: 4,
  TOGGLE_PAUSE: 5
};



// Error codes from the contract
const STAKE_ERRORS = {
  0x1770: 'Amount must be greater than zero',
  0x1771: 'Below minimum stake amount (10,000 CFX)',
  0x1772: 'Exceeds maximum stake amount (10,000,000 CFX)',
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
function parseContractError(error) {
  const errorCode = error.code || error.error?.code;
  return STAKE_ERRORS[errorCode] || `Unknown error: ${errorCode}`;
}

/**
 * Validate stake amount
 */
function validateStakeAmount(amount) {
  const MAX_STAKE = 10000000 * 1e6; // 10,000,000 CFX

  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  if (amount < MIN_STAKE_AMOUNT) {
    throw new Error('Minimum stake is 10,000 CFX');
  }

  if (amount > MAX_STAKE) {
    throw new Error('Maximum stake is 10,000,000 CFX');
  }

  return true;
}

/**
 * Get stake pool PDA
 */
async function getStakePoolPDA() {
  const [pda] = await PublicKey.findProgramAddress(
    [stringToUint8Array('stake_pool'), CFX_TOKEN_MINT.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Get user stake PDA
 */
async function getUserStakePDA(userPublicKey) {
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
async function checkUserStakeAccount(connection, userPublicKey) {
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

/**
 * Create instruction data buffer for different operations
 * Uses Anchor's instruction discriminator format (8-byte hash + args)
 */
function createInstructionData(instruction, args = {}) {
  // 真实的 Anchor 指令判别器 (从 IDL 中获取)
  // 这些需要与合约中的实际判别器匹配
  const instructionDiscriminators = {
    'createUserStake': new Uint8Array([0x6a, 0x18, 0x6a, 0x18, 0x6a, 0x18, 0x6a, 0x18]), // 需要更新为真实值
    'stake': new Uint8Array([0x90, 0x1c, 0x90, 0x1c, 0x90, 0x1c, 0x90, 0x1c]), // 需要更新为真实值
    'requestWithdrawal': new Uint8Array([0xa1, 0x2d, 0xa1, 0x2d, 0xa1, 0x2d, 0xa1, 0x2d]), // 需要更新为真实值
    'withdraw': new Uint8Array([0xb2, 0x3e, 0xb2, 0x3e, 0xb2, 0x3e, 0xb2, 0x3e]) // 需要更新为真实值
  };

  const discriminator = instructionDiscriminators[instruction];
  if (!discriminator) {
    throw new Error(`Unknown instruction: ${instruction}`);
  }

  // Add arguments based on instruction type
  if (instruction === 'stake' && args.amount) {
    // Create buffer with discriminator + amount (8 + 8 bytes)
    const buffer = new Uint8Array(16);
    buffer.set(discriminator, 0);

    // Write amount as 8-byte little-endian u64
    const amount = BigInt(args.amount);
    const dataView = new DataView(buffer.buffer);
    dataView.setBigUint64(8, amount, true); // true for little-endian

    return buffer;
  } else if (instruction === 'createUserStake' && args.bump !== undefined) {
    // Create buffer with discriminator + bump (8 + 1 bytes)
    const buffer = new Uint8Array(9);
    buffer.set(discriminator, 0);
    buffer[8] = args.bump;

    return buffer;
  } else {
    // Just return the discriminator for instructions without arguments
    return discriminator;
  }
}

/**
 * Create transaction instruction for staking operations
 */
function createStakingInstruction(instruction, accounts, args = {}) {
  const data = createInstructionData(instruction, args);

  return new TransactionInstruction({
    keys: accounts,
    programId: PROGRAM_ID,
    data: data
  });
}

/**
 * Parse StakePool account data
 * Based on the IDL structure: authority, tokenMint, tokenVault, lockDurationSlots, totalStaked, emergencyMode, reentrancyGuard, bump
 */
function parseStakePoolData(data) {
  if (!data || data.length < 8) {
    throw new Error('Invalid stake pool data');
  }

  // Skip 8-byte discriminator
  let offset = 8;

  // Parse fields according to StakePool struct (按照 IDL 中的正确顺序)
  const authority = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const tokenMint = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const tokenVault = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  // lockDurationSlots 在 totalStaked 之前！
  const lockDurationView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const lockDurationSlots = lockDurationView.getBigUint64(0, true);
  offset += 8;

  // totalStaked 在 lockDurationSlots 之后
  const totalStakedView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const totalStaked = totalStakedView.getBigUint64(0, true); // true = little-endian
  offset += 8;

  const emergencyMode = data[offset] === 1;
  offset += 1;

  const reentrancyGuard = data[offset] === 1;
  offset += 1;

  const bump = data[offset];
  offset += 1;

  console.log('🔍 解析的 totalStaked:', totalStaked.toString());

  return {
    authority: authority.toString(),
    tokenMint: tokenMint.toString(),
    tokenVault: tokenVault.toString(),
    lockDurationSlots: lockDurationSlots.toString(),
    totalStaked: totalStaked.toString(),
    emergencyMode,
    reentrancyGuard,
    bump
  };
}

/**
 * Parse UserStake account data
 * Based on the real IDL structure in cfx_stake_core.json
 *
 * 根据真实的 IDL，UserStake 结构应该是：
 * - discriminator: 8 bytes
 * - owner: 32 bytes (PublicKey)
 * - stake_pool: 32 bytes (PublicKey) <- 这个字段之前缺失了！
 * - staked_amount: 8 bytes (u64)
 * - last_stake_slot: 8 bytes (u64)
 * - unlock_slot: 8 bytes (u64)
 * - withdrawal_requested: 1 byte (bool)
 * - bump: 1 byte (u8)
 */
function parseUserStakeData(data) {
  if (!data || data.length < 90) { // 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1 = 98 bytes minimum
    throw new Error('Invalid user stake data - insufficient length');
  }

  // Skip 8-byte discriminator
  let offset = 8;

  // Parse fields according to UserStake struct
  const owner = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  // Parse stakePool field
  const stakePool = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  // Parse stakedAmount using DataView for correct byte order
  const stakedAmountBytes = data.slice(offset, offset + 8);
  const dataView = new DataView(data.buffer, data.byteOffset + offset, 8);

  // 手动计算 little-endian 值以确保准确性
  let stakedAmount = 0n;
  for (let i = 0; i < 8; i++) {
    stakedAmount += BigInt(stakedAmountBytes[i]) << BigInt(i * 8);
  }
  offset += 8;

  const lastStakeSlotView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const lastStakeSlot = lastStakeSlotView.getBigUint64(0, true);
  offset += 8;

  const unlockSlotView = new DataView(data.buffer, data.byteOffset + offset, 8);
  const unlockSlot = unlockSlotView.getBigUint64(0, true);
  offset += 8;

  const withdrawalRequested = data[offset] === 1;

  return {
    owner: owner.toString(),
    stakePool: stakePool.toString(),
    stakedAmount: stakedAmount.toString(),
    lastStakeSlot: lastStakeSlot.toString(),
    unlockSlot: unlockSlot.toString(),
    withdrawalRequested
  };
}

/**
 * Staking Service Class
 */
class StakingService {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
    this.program = null;
    this._initializeProgram();
  }

  /**
   * Initialize Anchor program
   */
  async _initializeProgram() {
    try {
      // 临时跳过 Anchor 程序初始化，避免在生产环境中报错
      // 等 stake 功能开发完成后再启用
      console.warn('Staking service: Anchor program initialization skipped (development in progress)');
      return;

      // 创建 provider
      const provider = new anchor.AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );

      // 加载 IDL - 尝试从本地文件加载（就像脚本中那样）
      let idl;
      try {
        // 尝试从网络获取 IDL
        idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
      } catch (error) {
        // 直接导入本地 IDL 文件
        try {
          // 直接导入 IDL 文件
          const idlModule = await import('../data/idl/cfx_stake_core.json');
          idl = idlModule.default || idlModule;
        } catch (importError) {
          console.warn('无法导入本地 IDL 文件，使用简化的 IDL');
          // 如果无法导入，使用简化的 IDL
          idl = this._getSimplifiedIdl();
        }
      }

      if (idl) {
        this.program = new anchor.Program(idl, PROGRAM_ID, provider);
      }
    } catch (error) {
      console.error('初始化 Anchor 程序失败:', error);
    }
  }

  /**
   * 获取简化的 IDL 用于数据解析（与真实 IDL 结构匹配）
   */
  _getSimplifiedIdl() {
    return {
      version: "0.1.0",
      name: "cfx_stake_core",
      accounts: [
        {
          name: "StakePool",
          type: {
            kind: "struct",
            fields: [
              { name: "authority", type: "publicKey" },
              { name: "tokenMint", type: "publicKey" },
              { name: "tokenVault", type: "publicKey" },
              { name: "lockDurationSlots", type: "u64" }, // 正确顺序：lockDurationSlots 在前
              { name: "totalStaked", type: "u64" },       // totalStaked 在后
              { name: "emergencyMode", type: "bool" },
              { name: "reentrancyGuard", type: "bool" },
              { name: "bump", type: "u8" }
            ]
          }
        },
        {
          name: "UserStake",
          type: {
            kind: "struct",
            fields: [
              { name: "owner", type: "publicKey" },
              { name: "stakePool", type: "publicKey" },
              { name: "stakedAmount", type: "u64" },
              { name: "lastStakeSlot", type: "u64" },
              { name: "unlockSlot", type: "u64" },
              { name: "withdrawalRequested", type: "bool" },
              { name: "bump", type: "u8" }
            ]
          }
        }
      ]
    };
  }

  /**
   * Update wallet
   */
  updateWallet(wallet) {
    this.wallet = wallet;
    // 重新初始化程序
    this._initializeProgram();
  }

  /**
   * 调试方法：获取详细的账户信息
   */
  async debugAccountInfo() {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const stakePoolPDA = await getStakePoolPDA();
      const userStakePDA = await getUserStakePDA(this.wallet.publicKey);

      console.log('🔍 调试信息:');
      console.log('钱包地址:', this.wallet.publicKey.toString());
      console.log('程序 ID:', PROGRAM_ID.toString());
      console.log('CFX Token Mint:', CFX_TOKEN_MINT.toString());
      console.log('质押池 PDA:', stakePoolPDA.toString());
      console.log('用户质押 PDA:', userStakePDA.toString());

      // 检查质押池账户
      const stakePoolAccount = await this.connection.getAccountInfo(stakePoolPDA);
      console.log('质押池账户存在:', !!stakePoolAccount);
      if (stakePoolAccount) {
        console.log('质押池账户所有者:', stakePoolAccount.owner.toString());
        console.log('质押池账户数据长度:', stakePoolAccount.data.length);
      }

      // 检查用户质押账户
      const userStakeAccount = await this.connection.getAccountInfo(userStakePDA);
      console.log('用户质押账户存在:', !!userStakeAccount);
      if (userStakeAccount) {
        console.log('用户质押账户所有者:', userStakeAccount.owner.toString());
        console.log('用户质押账户数据长度:', userStakeAccount.data.length);
      }

      // 检查网络信息
      const slot = await this.connection.getSlot();
      console.log('当前 Slot:', slot);

      return {
        walletAddress: this.wallet.publicKey.toString(),
        programId: PROGRAM_ID.toString(),
        cfxTokenMint: CFX_TOKEN_MINT.toString(),
        stakePoolPDA: stakePoolPDA.toString(),
        userStakePDA: userStakePDA.toString(),
        stakePoolExists: !!stakePoolAccount,
        userStakeExists: !!userStakeAccount,
        currentSlot: slot
      };
    } catch (error) {
      console.error('调试信息获取失败:', error);
      throw error;
    }
  }

  /**
   * Check if user stake account exists
   */
  async hasUserStakeAccount() {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    return await checkUserStakeAccount(this.connection, this.wallet.publicKey);
  }

  /**
   * Create user stake account (internal method)
   * This is called automatically by stake() if needed
   */
  async _createUserStakeIfNeeded() {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    const stakePoolPDA = await getStakePoolPDA();
    const [userStakePDA, userStakeBump] = await PublicKey.findProgramAddress(
      [
        stringToUint8Array('user_stake'),
        stakePoolPDA.toBuffer(),
        this.wallet.publicKey.toBuffer()
      ],
      PROGRAM_ID
    );

    // Check if account already exists
    const accountInfo = await this.connection.getAccountInfo(userStakePDA);
    if (accountInfo && accountInfo.owner.equals(PROGRAM_ID)) {
      return { userStakePDA, userStakeBump, created: false };
    }

    // Create the account
    const accounts = [
      { pubkey: userStakePDA, isSigner: false, isWritable: true },
      { pubkey: stakePoolPDA, isSigner: false, isWritable: false },
      { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ];

    const instruction = createStakingInstruction('createUserStake', accounts, { bump: userStakeBump });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = this.wallet.publicKey;

    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signedTransaction = await this.wallet.signTransaction(transaction);
    const txid = await this.connection.sendRawTransaction(signedTransaction.serialize());

    await this.connection.confirmTransaction(txid);

    return { userStakePDA, userStakeBump, created: true, tx: txid };
  }

  /**
   * Stake CFX tokens
   * Automatically creates user stake account if it doesn't exist
   */
  async stake(amount) {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Validate amount
      validateStakeAmount(amount);

      const stakePoolPDA = await getStakePoolPDA();

      // Ensure user stake account exists (create if needed)
      const { userStakePDA, created: accountCreated, tx: createTx } = await this._createUserStakeIfNeeded();

      if (accountCreated) {
        console.log('User stake account created:', createTx);
      }

      // Get stake pool info to get the token vault
      const stakePoolInfo = await this.getStakePoolInfo();
      if (!stakePoolInfo.success) {
        throw new Error('Failed to get stake pool info');
      }

      // Get token accounts
      const userTokenAccount = await getAssociatedTokenAddress(
        CFX_TOKEN_MINT,
        this.wallet.publicKey
      );

      // Use the actual token vault from stake pool
      const tokenVault = new PublicKey(stakePoolInfo.data.tokenVault);

      // Stake pool authority is the stake pool PDA itself
      const stakePoolAuthority = stakePoolPDA;

      const accounts = [
        { pubkey: userStakePDA, isSigner: false, isWritable: true },
        { pubkey: stakePoolPDA, isSigner: false, isWritable: true },
        { pubkey: stakePoolAuthority, isSigner: false, isWritable: false },
        { pubkey: tokenVault, isSigner: false, isWritable: true },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
      ];

      const instruction = createStakingInstruction('stake', accounts, { amount });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = this.wallet.publicKey;

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await this.wallet.signTransaction(transaction);
      const txid = await this.connection.sendRawTransaction(signedTransaction.serialize());

      await this.connection.confirmTransaction(txid);

      return {
        success: true,
        tx: txid,
        accountCreated,
        createTx
      };
    } catch (error) {
      console.error('Stake failed:', error);
      return {
        success: false,
        error: parseContractError(error),
        originalError: error
      };
    }
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal() {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const stakePoolPDA = await getStakePoolPDA();
      const userStakePDA = await getUserStakePDA(this.wallet.publicKey);

      const accounts = [
        { pubkey: userStakePDA, isSigner: false, isWritable: true },
        { pubkey: stakePoolPDA, isSigner: false, isWritable: false },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false }
      ];

      const instruction = createStakingInstruction('requestWithdrawal', accounts);

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = this.wallet.publicKey;

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await this.wallet.signTransaction(transaction);
      const txid = await this.connection.sendRawTransaction(signedTransaction.serialize());

      await this.connection.confirmTransaction(txid);

      return { success: true, tx: txid };
    } catch (error) {
      console.error('Request withdrawal failed:', error);
      return {
        success: false,
        error: parseContractError(error),
        originalError: error
      };
    }
  }

  /**
   * Withdraw tokens
   */
  async withdraw() {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const stakePoolPDA = await getStakePoolPDA();
      const userStakePDA = await getUserStakePDA(this.wallet.publicKey);

      const userTokenAccount = await getAssociatedTokenAddress(
        CFX_TOKEN_MINT,
        this.wallet.publicKey
      );

      const tokenVault = await getAssociatedTokenAddress(
        CFX_TOKEN_MINT,
        stakePoolPDA
      );

      const accounts = [
        { pubkey: stakePoolPDA, isSigner: false, isWritable: true },
        { pubkey: userStakePDA, isSigner: false, isWritable: true },
        { pubkey: tokenVault, isSigner: false, isWritable: true },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
      ];

      const instruction = createStakingInstruction('withdraw', accounts);

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = this.wallet.publicKey;

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await this.wallet.signTransaction(transaction);
      const txid = await this.connection.sendRawTransaction(signedTransaction.serialize());

      await this.connection.confirmTransaction(txid);

      return { success: true, tx: txid };
    } catch (error) {
      console.error('Withdraw failed:', error);
      return {
        success: false,
        error: parseContractError(error),
        originalError: error
      };
    }
  }

  /**
   * Get stake pool information from the blockchain
   */
  async getStakePoolInfo() {
    try {
      const stakePoolPDA = await getStakePoolPDA();

      // 优先使用 Anchor 程序获取数据
      if (this.program) {
        try {
          const stakePoolData = await this.program.account.stakePool.fetch(stakePoolPDA);
          return {
            success: true,
            data: {
              authority: stakePoolData.authority.toString(),
              tokenMint: stakePoolData.tokenMint.toString(),
              tokenVault: stakePoolData.tokenVault.toString(),
              totalStaked: stakePoolData.totalStaked.toString(),
              emergencyMode: stakePoolData.emergencyMode,
              lockDurationSlots: stakePoolData.lockDurationSlots.toString()
            }
          };
        } catch (anchorError) {
          console.warn('Anchor 获取失败，回退到手动解析:', anchorError);
        }
      }

      // 回退到手动解析
      const accountInfo = await this.connection.getAccountInfo(stakePoolPDA);

      if (!accountInfo) {
        return {
          success: false,
          error: 'Stake pool account not found - contract may not be initialized'
        };
      }

      if (!accountInfo.owner.equals(PROGRAM_ID)) {
        return {
          success: false,
          error: 'Invalid stake pool account owner'
        };
      }

      // Parse the account data
      const stakePoolData = parseStakePoolData(accountInfo.data);

      return {
        success: true,
        data: stakePoolData
      };
    } catch (error) {
      console.error('Failed to fetch stake pool:', error);
      return {
        success: false,
        error: 'Failed to fetch stake pool information',
        originalError: error
      };
    }
  }

  /**
   * Get user stake information from the blockchain
   */
  async getUserStakeInfo() {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const userStakePDA = await getUserStakePDA(this.wallet.publicKey);

      // 优先使用 Anchor 程序获取数据，就像脚本中那样
      if (this.program) {
        try {
          const userStakeData = await this.program.account.userStake.fetch(userStakePDA);

          // 验证所有者匹配
          if (userStakeData.owner.toString() !== this.wallet.publicKey.toString()) {
            return {
              success: false,
              error: 'User stake account owner mismatch'
            };
          }

          return {
            success: true,
            data: {
              owner: userStakeData.owner.toString(),
              stakedAmount: userStakeData.stakedAmount.toString(),
              lastStakeSlot: userStakeData.lastStakeSlot.toString(),
              unlockSlot: userStakeData.unlockSlot.toString(),
              withdrawalRequested: userStakeData.withdrawalRequested
            }
          };
        } catch (anchorError) {
          // 如果账户不存在，Anchor 会抛出错误
          if (anchorError.message.includes('Account does not exist')) {
            return {
              success: true,
              data: null // Account doesn't exist yet
            };
          }
          console.warn('Anchor 获取失败，回退到手动解析:', anchorError);
        }
      }

      // 回退到手动解析
      const accountInfo = await this.connection.getAccountInfo(userStakePDA);

      if (!accountInfo) {
        return {
          success: true,
          data: null // Account doesn't exist yet
        };
      }

      if (!accountInfo.owner.equals(PROGRAM_ID)) {
        return {
          success: false,
          error: 'Invalid user stake account owner'
        };
      }

      // Parse the account data
      const userStakeData = parseUserStakeData(accountInfo.data);

      // Verify the owner matches the connected wallet
      if (userStakeData.owner !== this.wallet.publicKey.toString()) {
        return {
          success: false,
          error: 'User stake account owner mismatch'
        };
      }

      return {
        success: true,
        data: userStakeData
      };
    } catch (error) {
      console.error('Failed to fetch user stake:', error);
      return {
        success: false,
        error: 'Failed to fetch user stake information',
        originalError: error
      };
    }
  }

  /**
   * Check if withdrawal is available (lock period has passed)
   */
  async canWithdraw() {
    try {
      const userStakeResult = await this.getUserStakeInfo();
      if (!userStakeResult.success || !userStakeResult.data) {
        return false;
      }

      const userStake = userStakeResult.data;
      if (!userStake.withdrawalRequested) {
        return false;
      }

      const currentSlot = await this.connection.getSlot();
      const unlockSlot = parseInt(userStake.unlockSlot);

      return currentSlot >= unlockSlot;
    } catch (error) {
      console.error('Error checking withdrawal availability:', error);
      return false;
    }
  }

  /**
   * Get time remaining until withdrawal is available
   * @returns {Promise<{canWithdraw: boolean, slotsRemaining: number, estimatedTimeRemaining: string}>}
   */
  async getWithdrawalTimeRemaining() {
    try {
      const userStakeResult = await this.getUserStakeInfo();
      if (!userStakeResult.success || !userStakeResult.data) {
        return { canWithdraw: false, slotsRemaining: 0, estimatedTimeRemaining: 'N/A' };
      }

      const userStake = userStakeResult.data;
      if (!userStake.withdrawalRequested) {
        return { canWithdraw: false, slotsRemaining: 0, estimatedTimeRemaining: 'Withdrawal not requested' };
      }

      const currentSlot = await this.connection.getSlot();
      const unlockSlot = parseInt(userStake.unlockSlot);
      const slotsRemaining = Math.max(0, unlockSlot - currentSlot);

      // Estimate time (assuming ~400ms per slot on Solana)
      const secondsRemaining = slotsRemaining * 0.4;
      const hoursRemaining = Math.floor(secondsRemaining / 3600);
      const minutesRemaining = Math.floor((secondsRemaining % 3600) / 60);

      let estimatedTimeRemaining;
      if (slotsRemaining === 0) {
        estimatedTimeRemaining = 'Available now';
      } else if (hoursRemaining > 24) {
        const daysRemaining = Math.floor(hoursRemaining / 24);
        estimatedTimeRemaining = `${daysRemaining} days, ${hoursRemaining % 24} hours`;
      } else if (hoursRemaining > 0) {
        estimatedTimeRemaining = `${hoursRemaining} hours, ${minutesRemaining} minutes`;
      } else {
        estimatedTimeRemaining = `${minutesRemaining} minutes`;
      }

      return {
        canWithdraw: slotsRemaining === 0,
        slotsRemaining,
        estimatedTimeRemaining
      };
    } catch (error) {
      console.error('Error calculating withdrawal time:', error);
      return { canWithdraw: false, slotsRemaining: 0, estimatedTimeRemaining: 'Error' };
    }
  }

  /**
   * Format CFX amount from smallest units to human readable
   * @param {string|number} amount - Amount in smallest units (6 decimals)
   * @returns {string} Formatted amount
   */
  static formatCfxAmount(amount) {
    if (!amount || amount === '0') {
      return '0.00';
    }

    try {
      // Convert to string first to handle both string and number inputs
      const amountStr = amount.toString();

      // 验证输入是否为有效数字（允许负号）
      if (!/^-?\d+$/.test(amountStr)) {
        console.warn('formatCfxAmount: 无效的数字格式:', amountStr);
        return '0.00';
      }

      const amountBN = BigInt(amountStr);

      // 检查是否为负数
      if (amountBN < 0n) {
        console.warn('formatCfxAmount: 负数值:', amountBN.toString());
        return '0.00';
      }

      // 大幅提高合理范围上限 - 允许最大 1000 万亿 CFX
      const maxReasonableAmount = BigInt('1000000000000000') * BigInt('1000000'); // 1 quadrillion CFX in smallest units
      if (amountBN > maxReasonableAmount) {
        console.warn('formatCfxAmount: 数值过大，可能存在解析错误:', amountBN.toString());
        // 不直接返回 0.00，而是尝试格式化，但添加警告
      }

      // Convert from smallest units (6 decimals) to CFX using string manipulation
      // This avoids precision issues with very large numbers
      const amountString = amountBN.toString();

      let integerPart, decimalPart;

      if (amountString.length <= 6) {
        // Amount is less than 1 CFX
        integerPart = '0';
        decimalPart = amountString.padStart(6, '0');
      } else {
        // Amount is 1 CFX or more
        integerPart = amountString.slice(0, -6);
        decimalPart = amountString.slice(-6);
      }

      // Trim trailing zeros from decimal part and limit to 2 decimal places
      const trimmedDecimal = decimalPart.replace(/0+$/, '');
      const finalDecimal = trimmedDecimal.length > 0 ?
        trimmedDecimal.slice(0, 2).padEnd(2, '0') : '00';

      const result = `${integerPart}.${finalDecimal}`;
      const numericResult = parseFloat(result);

      const formattedResult = numericResult.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      return formattedResult;
    } catch (error) {
      console.error('Error formatting CFX amount:', error, 'Input:', amount);
      return '0.00';
    }
  }

  /**
   * Parse CFX amount from human readable to smallest units
   * @param {string|number} amount - Human readable amount
   * @returns {string} Amount in smallest units
   */
  static parseCfxAmount(amount) {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      throw new Error('Invalid amount');
    }
    return (amountNum * 1e6).toString();
  }
}

export default StakingService;
export { MIN_STAKE_AMOUNT, CFX_TOKEN_MINT, PROGRAM_ID };
