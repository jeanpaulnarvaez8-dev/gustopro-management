const express = require('express');
const router = express.Router();
const kdsController = require('../controllers/kds.controller');

router.get('/pending', kdsController.getPendingOrders);
router.put('/items/:itemId/status', kdsController.updateItemStatus);

module.exports = router;
