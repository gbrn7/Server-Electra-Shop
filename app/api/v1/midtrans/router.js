const express = require('express');
const handlerWebhook = require('./controller');
const router = express();

router.post('/webhook', handlerWebhook);

module.exports = router;