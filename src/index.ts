import { ethers } from 'ethers'
import abiJson from '../abi.json'
import process from 'process'
import { listen } from './eventListener'

// Handle interrupt signal
process.on('SIGINT', () => {
  console.log('Exiting...')
  process.exit(0)
})

// TODO: Setup a logger with multiple levels
// Maybe winston?

const RPC_URL = 'https://polygon-rpc.com'
const ABI = abiJson.abi
const ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

const provider = new ethers.JsonRpcProvider(RPC_URL)
const contract = new ethers.Contract(ADDRESS, ABI, provider)

listen(contract, 'UserOperationEvent')
