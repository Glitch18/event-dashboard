import { ethers } from 'ethers'
import abiJson from '../abi.json'
import process from 'process'
import { listen, listenHistory } from './eventListener'
import { clearDatabase, connectDB, createTable, disconnectDB } from './db'

// Handle interrupt signal
process.on('SIGINT', async () => {
  await disconnectDB().then(() => {
    console.log('Exiting...')
    process.exit(0)
  })
})

// TODO: Setup a logger with multiple levels
// Maybe winston?

const RPC_URL = 'https://polygon-rpc.com'
const ABI = abiJson.abi
const ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

const provider = new ethers.JsonRpcProvider(RPC_URL)
const contract = new ethers.Contract(ADDRESS, ABI, provider)

// Current block number
connectDB()
  .then(() => clearDatabase())
  .then(() => createTable('events'))
  .then(() => provider.getBlockNumber())
  .then((blockNumber) => {
    console.log(`Current block number: ${blockNumber}`)
    console.log('Backfetching last 20 blocks...')
    return listenHistory(contract, blockNumber - 20)
  })
  // .then(() => disconnectDB())
  // .then(() => console.log('Done'))
  .then(() => listen(contract))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
