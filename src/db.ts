import { Db, MongoClient } from 'mongodb'
import { UserOperationEvent } from './eventListener'
import { ethers } from 'ethers'
import { getSender } from './network'
import { getCompanyName } from './bundlerList'

const uri = process.env.CONNECTION_STRING
if (!uri) {
  throw new Error('CONNECTION_STRING not set: Please set the CONNECTION_STRING environment variable')
}

const client = new MongoClient(uri)

let db: Db

export const connectDB = async () => {
  try {
    await client.connect()
    db = client.db('eventDB')
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error(err)
  }
}

export const disconnectDB = async () => {
  try {
    await client.close()
    console.log('Disconnected from MongoDB')
  } catch (err) {
    console.error(err)
  }
}

export const getDB = () => {
  if (!db) {
    throw new Error('Database not connected')
  }
  return db
}

export const clearDatabase = async (): Promise<void> => {
  if (!db) {
    throw new Error('Database not connected')
  }

  const collections = await db.listCollections().toArray()
  for (const collection of collections) {
    await db.collection(collection.name).drop()
  }
  console.log('Cleared all collections in the database')
}

export const createTable = async (name: string) => {
  if (!db) {
    throw new Error('Database not connected')
  }

  // Check if table already exists
  const collections = await db.listCollections().toArray()
  if (name in collections) {
    console.log(`Collection ${name} already exists`)
    return
  }
  await db.createCollection(name)
  console.log(`Created collection ${name}`)
}

export async function addEvent(event: UserOperationEvent, provider: ethers.Provider) {
  if (!db) {
    throw new Error('Database not connected')
  }

  const sender = await getSender(event.txHash, provider).catch((err) => {
    console.error(err)
    return undefined
  })
  if (!sender) {
    console.error('Sender not found')
    return
  }

  const bundler = getCompanyName(sender)
  const collection = db.collection('events')
  await collection.insertOne({
    ...event,
    from: sender,
    bundler,
  })
  console.log('Added event to database')
}
