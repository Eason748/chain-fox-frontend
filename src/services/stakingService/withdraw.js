import { PublicKey, Transaction } from '@solana/web3.js';
import { 
  PROGRAM_ID, 
  CFX_TOKEN_MINT, 
  TOKEN_PROGRAM_ID,
  parseContractError,
  getStakePoolPDA,
  getUserStakePDA,
  getAssociatedTokenAddress,
  createStakingInstruction,
  stringToUint8Array
} from './common.js';
import { getUserStakeInfo, getStakePoolInfo } from './view-status.js';

/**
 * Withdraw tokens
 */
export async function withdraw(connection, wallet) {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }

  try {
    // 预检查：确保用户状态正确
    const userStakeResult = await getUserStakeInfo(connection, wallet.publicKey);
    if (!userStakeResult.success || !userStakeResult.data) {
      return {
        success: false,
        error: '您还没有质押任何 CFX 代币'
      };
    }

    const userStake = userStakeResult.data;

    // 检查是否已申请提取
    if (!userStake.withdrawalRequested) {
      return {
        success: false,
        error: '您还没有申请提取'
      };
    }

    // 检查是否还有质押金额
    if (userStake.stakedAmount === '0' || parseInt(userStake.stakedAmount) === 0) {
      return {
        success: false,
        error: '没有可提取的代币，账户可能已经被清空'
      };
    }

    // 检查锁定期是否结束
    const currentSlot = await connection.getSlot();
    const unlockSlot = parseInt(userStake.unlockSlot);

    if (currentSlot < unlockSlot) {
      return {
        success: false,
        error: '锁定期尚未结束，请稍后再试'
      };
    }
    
    const stakePoolPDA = await getStakePoolPDA();
    const userStakePDA = await getUserStakePDA(wallet.publicKey);

    // 计算质押池权限 PDA (用于签名)
    const [stakePoolAuthority] = await PublicKey.findProgramAddress(
      [stringToUint8Array("stake_pool"), CFX_TOKEN_MINT.toBuffer()],
      PROGRAM_ID
    );

    const userTokenAccount = await getAssociatedTokenAddress(
      CFX_TOKEN_MINT,
      wallet.publicKey
    );

    // 获取质押池信息以获取正确的 tokenVault 地址
    const stakePoolResult = await getStakePoolInfo(connection);
    if (!stakePoolResult.success || !stakePoolResult.data) {
      return {
        success: false,
        error: '无法获取质押池信息'
      };
    }

    const tokenVault = new PublicKey(stakePoolResult.data.tokenVault);

    // 根据 IDL 中的正确账户顺序
    const accounts = [
      { pubkey: userStakePDA, isSigner: false, isWritable: true },        // userStake
      { pubkey: stakePoolPDA, isSigner: false, isWritable: true },        // stakePool
      { pubkey: stakePoolAuthority, isSigner: false, isWritable: false }, // stakePoolAuthority (正确的 PDA)
      { pubkey: tokenVault, isSigner: false, isWritable: true },          // tokenVault (从质押池信息获取)
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },    // userTokenAccount
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },     // owner
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }    // tokenProgram
    ];

    const instruction = await createStakingInstruction('withdraw', accounts);

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = wallet.publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signedTransaction = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());

    await connection.confirmTransaction(txid);

    return { success: true, tx: txid };
  } catch (error) {
    // 移除生产环境日志
    return {
      success: false,
      error: parseContractError(error),
      originalError: error
    };
  }
}
