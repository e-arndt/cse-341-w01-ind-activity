// routes/routes.js
const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../database/connect');

const router = express.Router();

// --- Professional route (static for now) ---
router.get('/professional', (req, res) => {
  res.json({
    professionalName: 'Eric Arndt',
    firstName: 'Eric',
    lastName: 'Arndt',
    email: 'eric@example.com'
  });
});

// --- GET ALL contacts ---
router.get('/contacts', async (req, res, next) => {
  try {
    if (req.query.id) return next(); // forward to GET ONE handler below
    const contacts = await getDb().collection('contacts').find({}).toArray();
    res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
});

// --- GET ONE contact ---
router.get(['/contacts/:id', '/contacts'], async (req, res, next) => {
  try {
    const id = req.params.id || req.query.id;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing contact ID' });
    }

    const doc = await getDb()
      .collection('contacts')
      .findOne({ _id: new ObjectId(id) });

    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json(doc);
  } catch (err) {
    next(err);
  }
});

// --- TEMPLES API ---
// Mount a separate router for temple endpoints
const templeRouter = require('./temple');
router.use('/temples', templeRouter);

module.exports = router;
