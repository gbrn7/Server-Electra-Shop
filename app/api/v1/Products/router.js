const express = require('express');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');
const { index, create, update, find, destroy } = require('./controller');
const router = express();

router.get('/products', authenticateUser, index);

router.post('/products', authenticateUser, authorizeRoles('superAdmin', 'admin'), create);

router.put('/products/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), update);

router.get('/products/:id', authenticateUser, find);

router.delete('/products/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), destroy);

module.exports = router;