import { ethers } from 'ethers'
import abiJson from '../abi.json'
import process from 'process'
import { listen, listenHistory } from './eventListener'
import { clearDatabase, connectDB, createTable, disconnectDB } from './db'
import fs from 'fs'
import path from 'path'

// Handle interrupt signal
process.on('SIGINT', async () => {
  // Save current block number in order to resume from this block
  const blockNumber = await provider.getBlockNumber()
  fs.writeFileSync(path.join(__dirname, '../../blockNumber.txt'), blockNumber.toString())
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

// If blockNumber.txt exists, read the block number from it
// Otherwise, start from the current block number
let lastBlock: number
const blockNumberFile = path.join(__dirname, '../../blockNumber.txt')
if (fs.existsSync(blockNumberFile)) {
  lastBlock = parseInt(fs.readFileSync(blockNumberFile, 'utf8'))
  console.log(`Resuming from block number ${lastBlock}`)
}

// Current block number
connectDB()
  .then(() => createTable('events'))
  .then(() => provider.getBlockNumber())
  .then((blockNumber) => {
    if (lastBlock) {
      return listenHistory(contract, lastBlock + 1)
    } else {
      console.log('Fetching events from last 20 blocks')
      return listenHistory(contract, blockNumber - 20)
    }
  })
  // .then(() => disconnectDB())
  // .then(() => console.log('Done'))
  .then(() => listen(contract))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
