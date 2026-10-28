import crypto from 'node:crypto';
import { pool, redis } from './db.js';
import { config } from './config.js';

export async function createAccount(owner, currency) {
  const { rows } = await pool.query('INSERT INTO accounts (owner, currency) VALUES ($1, $2) RETURNING *', [owner, currency]);
  return rows[0];
}

export async function balance(accountId) {
  const { rows } = await pool.query('SELECT COALESCE(SUM(amount_minor), 0)::bigint AS balance FROM postings WHERE account_id = $1', [accountId]);
  return Number(rows[0].balance);
}

// Moves money between two accounts. Retries with the same idempotency key return the original transfer.
export async function transfer({ from, to, amountMinor, idempotencyKey }) {
  const cached = await redis.get(`idem:${idempotencyKey}`);
  if (cached) return { ...JSON.parse(cached), replayed: true };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const fromBal = await client.query('SELECT COALESCE(SUM(amount_minor),0)::bigint b FROM postings WHERE account_id = $1', [from]);
    if (Number(fromBal.rows[0].b) < amountMinor) throw Object.assign(new Error('insufficient funds'), { status: 409 });
    const signature = crypto.createHmac('sha256', config.signingKey).update(`${from}:${to}:${amountMinor}:${idempotencyKey}`).digest('hex');
    const t = await client.query('INSERT INTO transfers (idempotency_key, signature) VALUES ($1, $2) RETURNING id', [idempotencyKey, signature]);
    await client.query('INSERT INTO postings (transfer_id, account_id, amount_minor) VALUES ($1, $2, $3), ($1, $4, $5)', [t.rows[0].id, from, -amountMinor, to, amountMinor]);
    await client.query('COMMIT');
    const result = { transferId: t.rows[0].id, from, to, amountMinor };
    await redis.set(`idem:${idempotencyKey}`, JSON.stringify(result), 'EX', 86400);
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function deposit(accountId, amountMinor) {
  const t = await pool.query("INSERT INTO transfers (idempotency_key, signature) VALUES ('dep-' || gen_random_uuid(), 'deposit') RETURNING id");
  await pool.query('INSERT INTO postings (transfer_id, account_id, amount_minor) VALUES ($1, $2, $3)', [t.rows[0].id, accountId, amountMinor]);
}
