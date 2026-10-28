import { createAccount, deposit } from '../src/ledger.js';
const alice = await createAccount('alice', 'USD');
const bob = await createAccount('bob', 'USD');
await deposit(alice.id, 10000);
console.log({ alice: alice.id, bob: bob.id });
process.exit(0);
