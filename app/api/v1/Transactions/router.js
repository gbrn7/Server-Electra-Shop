const express = require('express');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');
const { index, create, find, update } = require('./controller');
const { CheckAvailProducts, reduceStockProduct } = require('../../../middlewares/product');
const router = express();

router.get('/transactions', authenticateUser, authorizeRoles('superAdmin', 'admin'), index);

router.post('/transactions', authenticateUser, authorizeRoles('superAdmin', 'admin', 'user'), CheckAvailProducts, reduceStockProduct, create);

router.put('/transactions/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), update);

router.get('/transactions/:id', authenticateUser, authorizeRoles('superAdmin', 'admin', 'user'), find);

module.exports = router;