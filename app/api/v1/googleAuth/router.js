const express = require('express');
const passport = require('passport');
const router = express();
const session = require('express-session');
const { UnauthenticatedError } = require('../../../errors');
const oauthHandler = require('./controller');

router.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
passport.initialize();
router.use(passport.session());

router.get('/auth/google',
  passport.authenticate('google', {
    scope:
      ['profile', 'email']
  }
  ));

router.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/api/v1/auth/google/success',
    failureRedirect: '/api/v1/auth/google/failure'
  }));

router.get('/auth/google/success', oauthHandler)

router.get('/auth/google/failure', (req, res) => {
  throw new UnauthenticatedError('login google is failed');
})


module.exports = router;
