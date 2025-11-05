// swagger.js (root)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const swaggerAutogen = require('swagger-autogen')();

const outputFile = path.join(__dirname, 'swagger.json');

// Start with just server.js (always exists)
const endpointsFiles = [path.join(__dirname, 'server.js')];

// Try to also include routes/routes.js if it exists
const routesFile = path.join(__dirname, 'routes', 'routes.js');
if (fs.existsSync(routesFile)) {
  endpointsFiles.push(routesFile);
} else {
  console.warn('[swagger] Note: routes/routes.js not found. Scanning server.js only.');
}

console.log('[swagger] cwd:', process.cwd());
console.log('[swagger] outputFile:', outputFile);
console.log('[swagger] endpointsFiles:', endpointsFiles);

const doc = {
  swagger: '2.0',
  info: { title: 'Temple API', description: 'Docs for /temples', version: '1.0.0' },
  host: process.env.SWAGGER_HOST || `localhost:${process.env.PORT || 8080}`,
  basePath: '/',
  schemes: (process.env.SWAGGER_SCHEMES || 'http').split(','),
  consumes: ['application/json'],
  produces: ['application/json']
};

swaggerAutogen(outputFile, endpointsFiles, doc);
