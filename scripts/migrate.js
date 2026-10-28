import fs from 'node:fs';
import path from 'node:path';
import { pool } from '../src/db.js';
const dir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'migrations');
for (const f of fs.readdirSync(dir).sort()) {
  await pool.query(fs.readFileSync(path.join(dir, f), 'utf8'));
  console.log('applied', f);
}
process.exit(0);
