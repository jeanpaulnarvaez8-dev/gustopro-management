const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

router.get('/categories', menuController.getCategories);
router.get('/items', menuController.getMenuItems);
router.get('/items/:itemId/modifiers', menuController.getItemModifiers);

module.exports = router;
