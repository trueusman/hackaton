const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

// Some Windows machines (VPN clients, "smart" DNS proxies, certain antivirus
// suites) point Node's resolver at 127.0.0.1 while the OS network stack
// itself uses a different, working DNS server. That mismatch makes Node's
// `dns.resolveSrv` fail with ECONNREFUSED even though the machine has normal
// internet access - which breaks `mongodb+srv://` URIs specifically, since
// they require an SRV lookup. Falling back to public resolvers when Node's
// configured server is loopback is a no-op on any normal network/host
// (Render, CI, a properly configured dev machine) and fixes this failure
// mode when it's present.
function ensureUsableDnsResolver() {
  const servers = dns.getServers();
  const onlyLoopback = servers.every((s) => s === '127.0.0.1' || s === '::1');
  if (onlyLoopback) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.warn('[db] Node DNS resolver was loopback-only; switched to public DNS servers for SRV lookups');
  }
}

async function connectDB() {
  if (isConnected) return mongoose.connection;

  mongoose.set('strictQuery', true);
  ensureUsableDnsResolver();

  await mongoose.connect(env.MONGO_URI);
  isConnected = true;

  console.log(`[db] MongoDB connected -> ${mongoose.connection.name}`);

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
    isConnected = false;
  });

  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
  isConnected = false;
}

module.exports = { connectDB, disconnectDB };
