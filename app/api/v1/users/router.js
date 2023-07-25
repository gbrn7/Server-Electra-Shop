const express = require('express');
const { create, activeUser } = require('./controller');
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

router.post('/users', create);


router.put('/active', activeUser);


module.exports = router;