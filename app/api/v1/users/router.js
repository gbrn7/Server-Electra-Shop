const express = require('express');
const { activeUser, signUp, signIn, createCmsAdmin, signInCmsAdmin, updateUser, getUsers, getAdmins, countUsers } = require('./controller');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');
const router = express();

//user Authorization
router.post('/users/auth/signup', signUp);

router.post('/users/auth/signin', signIn);

router.put('/active', activeUser);

router.put('/users/:id', authenticateUser, authorizeRoles('user'), updateUser);

//Admin Authorization
router.post('/admin/auth/signin', signInCmsAdmin);

router.get('/users', authenticateUser, authorizeRoles('superAdmin', 'admin'), getUsers);

router.get('/admins', authenticateUser, authorizeRoles('superAdmin'), getAdmins);

router.get('/admins/Count', authenticateUser, authorizeRoles('superAdmin', 'admin'), countUsers);

router.post('/users/admin/create', authenticateUser, authorizeRoles('superAdmin'), createCmsAdmin);

module.exports = router;