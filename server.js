// server.js
require('dotenv').config();
const express = require('express');
const { initDb } = require('./database/connect');
const routes = require('./routes/routes');

const app = express();
const port = process.env.PORT || 8080;

const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');

// Middleware
app
  .use(express.json())
  .use((req, res, next) => {
    // CORS (Cross-Origin Resource Sharing) Allows other ports/domains to access API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  
// Routes
app
  .use('/', routes)
  .get('/', (req, res) => res.send('Server is up'));
  

// Main error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error', detail: err.message });
  next(err);
});

// Initialize DB, then start server
initDb((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`Connected to DB and listening on ${port}`);
  });
});
