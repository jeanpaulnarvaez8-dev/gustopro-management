const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');

router.get('/pre-conto/:orderId', billingController.generatePreConto);
router.post('/pay', billingController.processPayment);

module.exports = router;
