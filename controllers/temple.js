// routes/temple.js
const router = require('express').Router();
const { getDb } = require('../database/connect');

const checkKey = (req, res, next) => {
  const required = process.env.API_KEY;
  if (!required) return next(); // apiKey optional for this assignment
  const provided = req.header('apiKey');
  if (provided !== required) return res.status(401).json({ error: 'Invalid or missing apiKey' });
  next();
};

/* GET /temples — list all */
router.get(
  '/',
  checkKey,
  async (req, res) => {
    /*
      #swagger.tags = ['Temples']
      #swagger.description = 'Return all temples.'
      #swagger.parameters['apiKey'] = { in: 'header', type: 'string', required: false }
      #swagger.responses[200] = { description: 'OK' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */
    try {
      const docs = await getDb().collection('temples').find({}, {
        projection: { _id: 0 }   // hide Mongo _id for a cleaner response (optional)
      }).toArray();
      res.json(docs);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

/* GET /temples/:temple_id — get one by temple_id */
router.get(
  '/:temple_id',
  checkKey,
  async (req, res) => {
    /*
      #swagger.tags = ['Temples']
      #swagger.description = 'Return a single temple by temple_id.'
      #swagger.parameters['temple_id'] = { in: 'path', required: true, type: 'string' }
      #swagger.parameters['apiKey'] = { in: 'header', type: 'string', required: false }
      #swagger.responses[200] = { description: 'OK' }
      #swagger.responses[404] = { description: 'Not Found' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */
    try {
      const id = req.params.temple_id;
      const query = { $or: [{ temple_id: Number(id) }, { temple_id: id }] };
      const doc = await getDb().collection('temples').findOne(query, { projection: { _id: 0 } });
      if (!doc) return res.status(404).json({ error: 'Temple not found' });
      res.json(doc);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

/* POST /temples — create one (simple validation) */
router.post(
  '/',
  checkKey,
  async (req, res) => {
    /*
      #swagger.tags = ['Temples']
      #swagger.description = 'Create a new temple.'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $temple_id: 9,
          $name: 'New Temple',
          location: 'Somewhere',
          dedicated: 'TBD',
          additionalInfo: false
        }
      }
      #swagger.responses[201] = { description: 'Created' }
      #swagger.responses[400] = { description: 'Bad Request' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */
    try {
      const { temple_id, name, location, dedicated, additionalInfo } = req.body || {};
      if (temple_id == null || !name) {
        return res.status(400).json({ error: 'temple_id and name are required' });
      }
      const result = await getDb().collection('temples').insertOne({
        temple_id, name, location, dedicated, additionalInfo
      });
      res.status(201).json({ _id: result.insertedId, temple_id, name, location, dedicated, additionalInfo });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

module.exports = router;
