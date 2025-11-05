// database/connect.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

let _client;
let _db;

function pickDbNameFromUri(uri) {
  try {
    // mongodb+srv://user:pass@cluster.xyz.mongodb.net/project1?retryWrites=true...
    const afterHost = uri.split('.net/')[1] || '';
    const dbAndQuery = afterHost.split('?')[0] || '';
    return dbAndQuery || null; // returns 'project1' or null if missing
  } catch {
    return null;
  }
}

async function _initInternal() {
  if (_db) return _db;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing from .env');

  const desiredName = process.env.DB_NAME || pickDbNameFromUri(uri);

  _client = new MongoClient(uri);
  await _client.connect();

  // Choose DB: prefer explicit DB_NAME, otherwise the one in the URI (or 'test' fallback)
  _db = desiredName ? _client.db(desiredName) : _client.db();

  // Verify connection
  await _db.command({ ping: 1 });

  console.log(`Mongo connected → db: ${_db.databaseName}`);
  if (!desiredName) {
    console.log('Tip: Set DB_NAME in .env or append "/project1" to MONGODB_URI to lock the database explicitly.');
  }

  // Graceful shutdown
  process.once('SIGINT', async () => {
    try {
      await _client.close();
      console.log('Mongo client closed (SIGINT).');
    } finally {
      process.exit(0);
    }
  });

  return _db;
}

/**
 * initDb(callback?) — supports both:
 *  - initDb((err, db) => { ... })
 *  - await initDb()
 */
const initDb = async (callback) => {
  try {
    const db = await _initInternal();
    if (typeof callback === 'function') return callback(null, db);
    return db;
  } catch (err) {
    if (typeof callback === 'function') return callback(err);
    throw err;
  }
};

const getDb = () => {
  if (!_db) throw new Error('DB not initialized. Call initDb first.');
  return _db;
};

const getClient = () => _client;

const getCollection = (name) => getDb().collection(name);

module.exports = { initDb, getDb, getClient, getCollection };