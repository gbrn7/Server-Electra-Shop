const express = require('express');
const router = express();
const upload = require('../../../middlewares/multer');
const { create, checkthumb, destroy } = require('./controller');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');

router.post('/thumbnails', authenticateUser, authorizeRoles('superAdmin', 'admin'), upload.array('thumbnail', 6), create);

router.get('/thumbnails/check/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), checkthumb);

router.delete('/thumbnails/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), destroy);

module.exports = router;