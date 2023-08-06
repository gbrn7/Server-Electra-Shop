const passport = require('passport');
const { Google_Client_Id, Google_Client_Secret, Callback_Google_Url } = require('../config');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
  clientID: Google_Client_Id,
  clientSecret: Google_Client_Secret,
  callbackURL: Callback_Google_Url,
  passReqToCallback: true
},
  function (request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});