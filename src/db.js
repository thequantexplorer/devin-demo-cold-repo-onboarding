import pg from 'pg';
import Redis from 'ioredis';
import { config } from './config.js';

export const pool = new pg.Pool({ connectionString: config.databaseUrl });
export const redis = new Redis(config.redisUrl, { lazyConnect: false, maxRetriesPerRequest: 1 });
