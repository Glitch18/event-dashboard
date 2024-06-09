import { Contract, ContractEventPayload, EventLog, assert } from 'ethers'
import { addEvent } from './db'

export type UserOperationEvent = {
  userOpHash: string
  sender: string
  paymaster: string
  nonce: number
  success: boolean
  actualGas: number
  gasUsed: number
  timestamp: number
  txHash: string
}

export async function listenHistory(contract: Contract, fromBlock: number, toBlock?: number) {
  console.log(`Listening for UserOperationEvent from block ${fromBlock} ${toBlock ? `to ${toBlock}...` : ''}`)
  const logs = await contract.queryFilter(contract.filters.UserOperationEvent(), fromBlock, toBlock)
  const promises = logs.map(async (log) => {
    assert(log instanceof EventLog, 'log is not an EventLog', 'INVALID_ARGUMENT')
    const userOpEvent: UserOperationEvent = {
      userOpHash: log.args[0],
      sender: log.args[1],
      paymaster: log.args[2],
      nonce: log.args[3],
      success: log.args[4],
      actualGas: log.args[5],
      gasUsed: log.args[6],
      timestamp: Date.now(),
      txHash: log.transactionHash,
    }
    await addEvent(userOpEvent, log.provider)
  })
  await Promise.all(promises)
  console.log('Received historic events')
}

// TODO: Try replacing with https://medium.com/coinmonks/top-10-polygon-apis-6187fc965851
export async function listen(contract: Contract) {
  console.log(`Listening for UserOperationEvent...`)
  contract.on('UserOperationEvent', (...args) => {
    // LOGGER.info(`Received event: ${eventName}`);
    const payload: ContractEventPayload = args[args.length - 1]
    const userOpEvent: UserOperationEvent = {
      userOpHash: args[0],
      sender: args[1],
      paymaster: args[2],
      nonce: args[3],
      success: args[4],
      actualGas: args[5],
      gasUsed: args[6],
      timestamp: Date.now(),
      txHash: payload.log.transactionHash,
    }
    addEvent(userOpEvent, payload.log.provider)
  })
}
