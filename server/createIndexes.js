import mongoose from 'mongoose';
import 'dotenv/config';
import logger from './utils/logger.js';

const ensureIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    logger.success('Connected to MongoDB for index creation');

    const db = mongoose.connection.db;

    const createIndex = async (collection, spec, options) => {
      try {
        await db.collection(collection).createIndex(spec, options);
        logger.info(`✓ ${collection}: ${options.name}`);
      } catch (err) {
        if (err.code === 85 || err.code === 86) {
          logger.warn(`⚠ ${collection}: ${options.name} already exists (skipped)`);
        } else {
          logger.error(`✗ ${collection}: ${options.name} — ${err.message}`);
        }
      }
    };

    // Message indexes
    await createIndex('messages', { chat: 1, createdAt: -1 }, { name: 'chat_createdAt_desc' });
    await createIndex('messages', { chat: 1, sequenceNumber: -1 }, { name: 'chat_sequence_desc' });
    await createIndex('messages', { sender: 1, createdAt: -1 }, { name: 'sender_createdAt_desc' });

    // Chat indexes
    await createIndex('chats', { participants: 1, updatedAt: -1 }, { name: 'participants_updatedAt_desc' });

    // Call indexes
    await createIndex('calls', { participants: 1, createdAt: -1 }, { name: 'call_participants_createdAt' });
    await createIndex('calls', { roomId: 1 }, { name: 'call_roomId', sparse: true });

    // User indexes
    await createIndex('users', { phone: 1 }, { name: 'user_phone', sparse: true });

    // Status indexes
    await createIndex('statuses', { user: 1, expiresAt: 1 }, { name: 'status_user_expiry' });

    logger.success('Index creation complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    logger.error(`Index creation failed: ${err.message}`);
    process.exit(1);
  }
};

ensureIndexes();
