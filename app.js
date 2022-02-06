const express = require("express");
const path = require("path");
const createError = require("http-errors");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const indexController = require("./controllers/indexController");
const userController = require("./controllers/userController");
const User = require("./models/user");

const mongoDb = process.env.MONGO_URI;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Mongo connection error"));

const MongoStore = require("connect-mongo")(session);
const sessionStore = new MongoStore({
  mongooseConnection: db,
  collection: "sessions",
});

const app = express();
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
// app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);
passport.use(
  new localStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        console.error(err);
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Email not found." });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) {
          console.error(err);
          return done(null, false, { message: "Password problem." });
        }
        if (res) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password." });
        }
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    if (err) {
      return done(err);
    }
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

const authenticated = (req, res, next) => {
  console.log("AUTHENTICATION", req.isAuthenticated());
  req.isAuthenticated() ? next() : res.redirect("/");
};

app.get("/", indexController.index);
app.post("/", indexController.delete_post);
app.get("/sign-up", userController.user_create_get);
app.post("/sign-up", userController.user_create_post);
app.get("/log-in", userController.user_login_get);
app.post(
  "/log-in",
  userController.user_login_post,
  passport.authenticate("local", {
    successRedirect: "/",
    // failureRedirect: "/log-in",
    failureMessage: true,
  })
);

app.get("/new-post", authenticated, indexController.new_post_get);
app.post("/new-post", authenticated, indexController.new_post_post);

app.get("/join", authenticated, indexController.join_get);
app.post("/join", authenticated, indexController.join_post);

app.get("/admin", authenticated, indexController.admin_get);
app.post("/admin", authenticated, indexController.admin_post);

app.get("/log-out", (req, res) => {
  req.logout();
  res.redirect("/");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(process.env.PORT, () =>
  console.log("Listening on port ", process.env.PORT)
);
