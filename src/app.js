import express from 'express';
import { createAccount, balance, transfer } from './ledger.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.post('/accounts', async (req, res, next) => {
    try { res.status(201).json(await createAccount(req.body.owner, req.body.currency)); } catch (e) { next(e); }
  });
  app.get('/accounts/:id/balance', async (req, res, next) => {
    try { res.json({ balance: await balance(req.params.id) }); } catch (e) { next(e); }
  });
  app.post('/transfers', async (req, res, next) => {
    try {
      const key = req.get('idempotency-key');
      if (!key) return res.status(400).json({ error: 'Idempotency-Key header required' });
      res.status(201).json(await transfer({ ...req.body, idempotencyKey: key }));
    } catch (e) { next(e); }
  });
  app.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.message }));
  return app;
}
