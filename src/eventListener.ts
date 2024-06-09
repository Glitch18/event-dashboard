import { Contract, ContractEventPayload, ethers } from 'ethers'

export type UserOperationEvent = {
  userOpHash: string
  sender: string
  paymaster: string
  nonce: number
  success: boolean
  actualGas: number
  gasUsed: number
  payload: ContractEventPayload
}

// TODO: Try replacing with https://medium.com/coinmonks/top-10-polygon-apis-6187fc965851
export const listen = async (contract: Contract, eventName: string) => {
  console.log(`Listening for ${eventName} events...`)
  contract.on(eventName, (...args) => {
    // LOGGER.info(`Received event: ${eventName}`);
    const userOpEvent: UserOperationEvent = {
      userOpHash: args[0],
      sender: args[1],
      paymaster: args[2],
      nonce: args[3],
      success: args[4],
      actualGas: args[5],
      gasUsed: args[6],
      payload: args[7],
    }
    // Send to database
  })
}
