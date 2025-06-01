import { 
  PublicKey, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY, 
  Transaction 
} from '@solana/web3.js';
import {
  PROGRAM_ID,
  CFX_TOKEN_MINT,
  TOKEN_PROGRAM_ID,
  MIN_STAKE_AMOUNT,
  MAX_PERSONAL_STAKE,
  validateStakeAmount,
  parseContractError,
  getStakePoolPDA,
  getUserStakePDA,
  getAssociatedTokenAddress,
  createStakingInstruction,
  stringToUint8Array
} from './common.js';
import { getStakePoolInfo } from './view-status.js';

/**
 * Create user stake account (internal method)
 * This is called automatically by stake() if needed
 */
export async function createUserStakeIfNeeded(connection, wallet) {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }

  const stakePoolPDA = await getStakePoolPDA();
  const userStakePDA = await getUserStakePDA(wallet.publicKey);

  // Get the bump for the user stake PDA
  const [, userStakeBump] = await PublicKey.findProgramAddress(
    [
      stringToUint8Array('user_stake'),
      stakePoolPDA.toBuffer(),
      wallet.publicKey.toBuffer()
    ],
    PROGRAM_ID
  );

  // Check if account already exists
  const accountInfo = await connection.getAccountInfo(userStakePDA);
  if (accountInfo && accountInfo.owner.equals(PROGRAM_ID)) {
    return { userStakePDA, userStakeBump, created: false };
  }

  try {
    // 移除生产环境日志

    // 创建账户的指令
    const accounts = [
      { pubkey: userStakePDA, isSigner: false, isWritable: true },
      { pubkey: stakePoolPDA, isSigner: false, isWritable: false },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ];

    const instruction = await createStakingInstruction('createUserStake', accounts, { bump: userStakeBump });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = wallet.publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signedTransaction = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());

    await connection.confirmTransaction(txid);

    // 移除生产环境日志
    return { userStakePDA, userStakeBump, created: true, tx: txid };
  } catch (error) {
    // 移除生产环境日志
    throw new Error(`Failed to create user stake account: ${error.message}`);
  }
}

/**
 * Stake CFX tokens
 * Automatically creates user stake account if it doesn't exist
 */
export async function stake(connection, wallet, amount) {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }

  try {
    // Validate amount
    validateStakeAmount(amount);

    const stakePoolPDA = await getStakePoolPDA();

    // Ensure user stake account exists (create if needed)
    const { userStakePDA, created: accountCreated, tx: createTx } = await createUserStakeIfNeeded(connection, wallet);

    // 移除生产环境日志

    // Get stake pool info to get the token vault
    const stakePoolInfo = await getStakePoolInfo(connection);
    if (!stakePoolInfo.success) {
      throw new Error('Failed to get stake pool info');
    }

    const tokenVault = new PublicKey(stakePoolInfo.data.tokenVault);
    const stakePoolAuthority = stakePoolPDA;

    // Get user token account
    const userTokenAccount = await getAssociatedTokenAddress(
      CFX_TOKEN_MINT,
      wallet.publicKey
    );

    // 移除生产环境日志

    // 创建质押指令
    const accounts = [
      { pubkey: userStakePDA, isSigner: false, isWritable: true },
      { pubkey: stakePoolPDA, isSigner: false, isWritable: true },
      { pubkey: stakePoolAuthority, isSigner: false, isWritable: false },
      { pubkey: tokenVault, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
    ];

    const instruction = await createStakingInstruction('stake', accounts, { amount });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = wallet.publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signedTransaction = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());

    await connection.confirmTransaction(txid);

    // 移除生产环境日志

    return {
      success: true,
      tx: txid,
      accountCreated,
      createTx
    };
  } catch (error) {
    // 移除生产环境日志
    return {
      success: false,
      error: parseContractError(error),
      originalError: error
    };
  }
}

/**
 * 获取用户 CFX 余额
 */
export async function getUserCFXBalance(connection, userPublicKey) {
  if (!userPublicKey) {
    return 0;
  }

  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userPublicKey,
      { mint: CFX_TOKEN_MINT }
    );

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    return parseInt(tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount);
  } catch (error) {
    // 移除生产环境日志
    return 0;
  }
}

/**
 * Format CFX amount from smallest units to human readable
 * @param {string|number} amount - Amount in smallest units (6 decimals)
 * @returns {string} Formatted amount
 */
export function formatCfxAmount(amount) {
  if (!amount || amount === '0') {
    return '0.00';
  }

  try {
    // Convert to string first to handle both string and number inputs
    const amountStr = amount.toString();

    // 验证输入是否为有效数字（允许负号）
    if (!/^-?\d+$/.test(amountStr)) {
      // 移除生产环境日志
      return '0.00';
    }

    const amountBN = BigInt(amountStr);

    // 检查是否为负数
    if (amountBN < 0n) {
      // 移除生产环境日志
      return '0.00';
    }

    // 最大 1 亿 CFX
    const maxReasonableAmount = BigInt('100000000') * BigInt('1000000'); // 1 quadrillion CFX in smallest units
    if (amountBN > maxReasonableAmount) {
      // 移除生产环境日志
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
    // 移除生产环境日志
    return '0.00';
  }
}

/**
 * Parse CFX amount from human readable to smallest units
 * @param {string|number} amount - Human readable amount
 * @returns {string} Amount in smallest units
 */
export function parseCfxAmount(amount) {
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum < 0) {
    throw new Error('Invalid amount');
  }
  return (amountNum * 1e6).toString();
}

/**
 * 验证质押金额
 * @param {number} amount - 质押金额（最小单位）
 * @param {number} userBalance - 用户余额
 * @returns {string|null} 错误信息，null 表示验证通过
 */
export function validateStakeAmountWithBalance(amount, userBalance) {
  if (amount <= 0) {
    return '金额必须大于零';
  }

  if (amount < MIN_STAKE_AMOUNT) {
    return `最小质押金额为 ${formatCfxAmount(MIN_STAKE_AMOUNT)} CFX`;
  }

  if (amount > userBalance) {
    return '余额不足';
  }

  if (amount > MAX_PERSONAL_STAKE) {
    return `超过个人最大质押限额 ${formatCfxAmount(MAX_PERSONAL_STAKE)} CFX`;
  }

  return null;
}
