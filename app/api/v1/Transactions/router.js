const express = require('express');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');
const { index, create, find, update, destroy } = require('./controller');
const { CheckAvailProducts, reduceStockProduct } = require('../../../middlewares/product');
const router = express();

router.get('/transactions', authenticateUser, authorizeRoles('superAdmin', 'admin'), index);

router.post('/transactions', authenticateUser, authorizeRoles('superAdmin', 'admin', 'user'), CheckAvailProducts, reduceStockProduct, create);

router.put('/transactions/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), update);

router.delete('/transactions/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), destroy);

router.get('/transactions/:id', authenticateUser, authorizeRoles('superAdmin', 'admin', 'user'), find);

module.exports = router;