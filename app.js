require("dotenv").config();

const express = require("express");
const passport = require("passport");
const TwitterStrategy = require("passport-twitter");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const flash = require("connect-flash");

const { mongoConnect } = require("./util/db");
const {
  getHome,
  getPromo,
  logout,
  postPromo,
  success,
} = require("./controller");
const { checkAuthenticated } = require("./middleware");

const app = express();

const PORT = process.env.PORT || 8080;

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "/oauth/callback",
    },
    function (token, tokenSecret, profile, cb) {
      return cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "promotions",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", getHome);
app.get("/promo", checkAuthenticated, getPromo);
app.get("/success", checkAuthenticated, success);
app.post("/promo", checkAuthenticated, postPromo);
app.get("/logout", checkAuthenticated, logout);

app.get("/login/twitter", passport.authenticate("twitter"));

app.get(
  "/oauth/callback",
  passport.authenticate("twitter", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/promo");
  }
);

//Not Found Route
app.use((req, res) => {
  res.render("404");
});

mongoConnect(() => {
  app.listen(PORT, () => {
    console.log(`listening - PORT:${PORT}`);
  });
});
