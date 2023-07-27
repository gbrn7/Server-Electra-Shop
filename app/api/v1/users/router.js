const express = require('express');
const { activeUser, signUp, signIn, createCmsAdmin, signInCmsAdmin, updateUser, getUsers, getAdmins, countUsers } = require('./controller');
const router = express();

//user Authorization
router.get('/users', getUsers);

router.post('/users/auth/signup', signUp);

router.post('/users/auth/signin', signIn);

router.put('/users/:id', updateUser);

//Admin Authorization
router.get('/admins', getAdmins);

router.get('/admins/Count', countUsers);

router.post('/users/admin/create', createCmsAdmin);

router.put('/active', activeUser);

router.post('/admin/auth/signin', signInCmsAdmin);

module.exports = router;