import { ethers } from 'ethers'

export async function getSender(txHash: string, provider: ethers.Provider) {
  // TODO: Add a retry mechanism
  let retry = 3
  let tx: ethers.TransactionResponse | null = null
  while (retry > 0) {
    try {
      tx = await provider.getTransaction(txHash)
      if (!tx) {
        throw new Error(`Transaction not found ${txHash}`)
      }
      return tx.from
    } catch (err) {
      // Wait 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000))
      retry--
    }
  }
  if (!tx) {
    throw new Error(`Transaction not found ${txHash}`)
  }
  return tx.from
}
