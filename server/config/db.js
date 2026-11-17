import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import config from './env.js';
import logger from '../utils/logger.js';

let memoryServer = null;

/**
 * Connects to MongoDB.
 *
 * Production / demo use a remote MongoDB URI (Atlas) supplied through MONGODB_URI.
 * When no URI is configured (for example a fresh clone or an offline demo), an
 * in-process MongoDB is started with a persistent data folder so the whole
 * application still runs end to end. No code changes are needed to switch.
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);

  if (config.mongoUri) {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15000 });
    logger.info(`MongoDB connected (${mongoose.connection.host}/${mongoose.connection.name})`);
    return mongoose.connection;
  }

  const dataDir = path.resolve(process.cwd(), '.data/mongo');
  fs.mkdirSync(dataDir, { recursive: true });

  logger.warn('MONGODB_URI is not set — starting an embedded MongoDB for local development.');
  memoryServer = await MongoMemoryServer.create({
    instance: { dbPath: dataDir, storageEngine: 'wiredTiger' },
  });
  const uri = memoryServer.getUri('velora');
  await mongoose.connect(uri);
  logger.info(`Embedded MongoDB ready at ${uri}`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop({ doCleanup: false });
    memoryServer = null;
  }
}

export default connectDB;
