const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/v1/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        //get the user data from google
        const newUser = {
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
        };

        try {
          //find the user in our database
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            //If user present in our database.
            done(null, user);
          } else {
            // if user is not preset in our database save user data to database.
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/v1/auth/facebook/callback",
      },
      function (accessToken, refreshToken, profile, done) {
        console.log("PROFILE", profile);
        return done(null, profile);
      }
    )
  );

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });
};
