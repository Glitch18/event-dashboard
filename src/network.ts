import { ethers } from 'ethers'

export async function getSender(txHash: string, provider: ethers.Provider) {
  // TODO: Add a retry mechanism
  const tx = await provider.getTransaction(txHash)
  if (!tx) {
    throw new Error(`Transaction not found ${txHash}`)
  }
  return tx.from
}
