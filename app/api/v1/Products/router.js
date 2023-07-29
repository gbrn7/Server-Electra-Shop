const express = require('express');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');
const { getAllProducts } = require('../../../services/mongoose/products');
const { index } = require('./controller');
const router = express();

router.get('/products', authenticateUser, index);

module.exports = router;