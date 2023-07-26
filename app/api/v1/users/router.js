const express = require('express');
const { activeUser, signUp, signIn, createCmsAdmin } = require('./controller');
const router = express();

router.get('/users', (req, res) => {
  const data = [
    {
      _id: 1,
      name: 'testing',
    },
    {
      _id: 2,
      name: 'mern',
    },
  ];
  res.status(200).json({
    data,
  })
});

router.post('/users/auth/signup', signUp);

router.post('/users/auth/signin', signIn);

router.post('/users/admin/create', createCmsAdmin);

router.put('/active', activeUser);


module.exports = router;