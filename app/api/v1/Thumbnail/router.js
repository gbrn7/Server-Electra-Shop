const express = require('express');
const router = express();
const upload = require('../../../middlewares/multer');
const { create, checkthumb } = require('./controller');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');

router.post('/thumbnail', authenticateUser, authorizeRoles('superAdmin', 'admin'), upload.array('thumbnail', 6), create);

router.get('/thumbnail/check/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), checkthumb);

module.exports = router;