CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  signature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS postings (
  id bigserial PRIMARY KEY,
  transfer_id uuid NOT NULL REFERENCES transfers(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
  amount_minor bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS postings_account_idx ON postings(account_id);
