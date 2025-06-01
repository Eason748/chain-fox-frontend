import { Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  parseContractError,
  getStakePoolPDA,
  getUserStakePDA,
  PROGRAM_ID,
  calculateInstructionDiscriminator
} from './common.js';
import { getUserStakeInfo } from './view-status.js';

/**
 * Request withdrawal using native web3.js (manual implementation)
 */
export async function requestWithdrawal(connection, wallet) {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }

  try {
    // 移除生产环境日志

    // 预检查：确保用户状态正确
    const userStakeResult = await getUserStakeInfo(connection, wallet.publicKey);
    if (!userStakeResult.success || !userStakeResult.data) {
      return {
        success: false,
        error: '您还没有质押任何 CFX 代币'
      };
    }

    const userStake = userStakeResult.data;

    // 检查是否有质押金额
    if (userStake.stakedAmount === '0' || parseInt(userStake.stakedAmount) === 0) {
      return {
        success: false,
        error: '您还没有质押任何 CFX 代币'
      };
    }

    // 检查是否已经申请过提取
    if (userStake.withdrawalRequested) {
      return {
        success: false,
        error: '您已经申请过提取，请等待锁定期结束'
      };
    }

    const stakePoolPDA = await getStakePoolPDA();
    const userStakePDA = await getUserStakePDA(wallet.publicKey);

    // 移除生产环境日志 - 账户信息
    // 保留变量用于后续逻辑
    const accountInfo = {
      userWallet: wallet.publicKey.toString(),
      stakePool: stakePoolPDA.toString(),
      userStake: userStakePDA.toString(),
      stakedAmount: `${parseInt(userStake.stakedAmount) / 1e6} CFX`
    };

    // 使用 common.js 中的正确指令判别器计算方法
    // 这会从 IDL 中验证指令并计算正确的判别器
    const instructionDiscriminator = await calculateInstructionDiscriminator('requestWithdrawal');

    // 移除生产环境日志 - 指令判别器

    // 创建指令数据（只有判别器，没有参数）
    const instructionData = instructionDiscriminator;

    // 创建账户列表
    const accounts = [
      { pubkey: userStakePDA, isSigner: false, isWritable: true },
      { pubkey: stakePoolPDA, isSigner: false, isWritable: false },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true }
    ];

    // 创建指令
    const instruction = new TransactionInstruction({
      keys: accounts,
      programId: PROGRAM_ID,
      data: instructionData
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = wallet.publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signedTransaction = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());

    await connection.confirmTransaction(txid);

    // 移除生产环境日志 - 成功信息

    return { success: true, tx: txid };
  } catch (error) {
    // 移除生产环境日志

    // 检查常见错误
    let errorMessage = parseContractError(error);
    if (error.message.includes('NoStakedTokens')) {
      errorMessage = '您还没有质押任何 CFX 代币';
    } else if (error.message.includes('WithdrawalAlreadyRequested')) {
      errorMessage = '您已经申请过提取，请等待锁定期结束';
    } else if (error.message.includes('ContractPaused')) {
      errorMessage = '合约当前已暂停，请稍后再试';
    }

    return {
      success: false,
      error: errorMessage,
      originalError: error
    };
  }
}