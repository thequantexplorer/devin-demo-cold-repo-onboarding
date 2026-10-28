import test, { after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createAccount, deposit, balance } from '../src/ledger.js';
import { pool, redis } from '../src/db.js';

after(async () => { await pool.end(); redis.disconnect(); });

test('transfer moves money and is idempotent', async () => {
  const app = createApp();
  const a = await createAccount('a', 'USD');
  const b = await createAccount('b', 'USD');
  await deposit(a.id, 5000);
  const key = 'k-' + Date.now();
  const first = await request(app).post('/transfers').set('Idempotency-Key', key).send({ from: a.id, to: b.id, amountMinor: 1200 });
  assert.strictEqual(first.status, 201);
  const retry = await request(app).post('/transfers').set('Idempotency-Key', key).send({ from: a.id, to: b.id, amountMinor: 1200 });
  assert.strictEqual(retry.body.replayed, true);
  assert.strictEqual(await balance(a.id), 3800);
  assert.strictEqual(await balance(b.id), 1200);
});

test('rejects overdrafts', async () => {
  const a = await createAccount('c', 'USD');
  const b = await createAccount('d', 'USD');
  const res = await request(createApp()).post('/transfers').set('Idempotency-Key', 'k2-' + Date.now()).send({ from: a.id, to: b.id, amountMinor: 1 });
  assert.strictEqual(res.status, 409);
});
