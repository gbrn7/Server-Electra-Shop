const express = require('express');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');
const { index, create, update } = require('./controller');
const router = express();

router.get('/products', authenticateUser, index);

router.post('/products', authenticateUser, authorizeRoles('superAdmin', 'admin'), create);

router.put('/products/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), update);

module.exports = router;