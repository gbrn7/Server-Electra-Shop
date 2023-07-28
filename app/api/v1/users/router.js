const express = require('express');
const { activeUser, signUp, signIn, createCmsAdmin, signInCmsAdmin, updateUser, getUsers, getAdmins, countUsers, getDataUser, getDataAdmin, updateAdmin } = require('./controller');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');
const router = express();

//user Authorization
router.post('/users/auth/signup', signUp);

router.post('/users/auth/signin', signIn);

router.put('/active', activeUser);

router.get('/users/:id', authenticateUser, authorizeRoles('user'), getDataUser);

router.put('/users/:id', authenticateUser, authorizeRoles('user'), updateUser);

//Admin Authorization
router.post('/admins/auth/signin', signInCmsAdmin);

router.get('/users', authenticateUser, authorizeRoles('superAdmin', 'admin'), getUsers);

router.get('/admins/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), getDataAdmin);

router.put('/admins/:id', authenticateUser, authorizeRoles('admin', 'superAdmin'), updateAdmin);

router.get('/admins', authenticateUser, authorizeRoles('superAdmin'), getAdmins);

router.get('/admins/users/count', authenticateUser, authorizeRoles('superAdmin', 'admin'), countUsers);

router.post('/users/admins/create', authenticateUser, authorizeRoles('superAdmin'), createCmsAdmin);

module.exports = router;