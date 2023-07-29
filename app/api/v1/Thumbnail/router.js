const express = require('express');
const router = express();
const upload = require('../../../middlewares/multer');
const { create } = require('./controller');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');

router.post('/thumbnail', upload.single('thumbnail'), authenticateUser, authorizeRoles('admin', 'superAdmin'), create);

module.exports = router;