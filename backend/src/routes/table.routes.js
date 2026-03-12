const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');

router.get('/zones', tableController.getZones);
router.get('/', tableController.getTables);

module.exports = router;
