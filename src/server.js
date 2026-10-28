import { createApp } from './app.js';
const port = process.env.PORT || 4600;
createApp().listen(port, () => console.log('ledger on :' + port));
