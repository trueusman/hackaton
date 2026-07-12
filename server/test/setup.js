const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

// Prefer a real, reachable MongoDB (e.g. a local mongod or a scratch Atlas
// database) via TEST_MONGO_URI when set. Some sandboxed/locked-down CI or
// dev environments cannot spawn the mongodb-memory-server's mongod binary
// (it needs to fork a real mongod process) - this env var is the escape
// hatch for those environments. GitHub Actions and a normal dev machine can
// use the in-memory server with no setup at all.
async function connect() {
  if (process.env.TEST_MONGO_URI) {
    await mongoose.connect(process.env.TEST_MONGO_URI);
    return;
  }
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

async function closeDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
}

async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

module.exports = { connect, closeDatabase, clearDatabase };
