// userController.js

const User = require("../models/user");
const Post = require("../models/post");
const { body, check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const async = require("async");

exports.user_create_get = function (req, res, next) {
  res.render("sign-up", { title: "Members Clubhouse - Sign up" });
};

exports.user_create_post = [
  body("firstname", "You must provide a first name.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastname").trim().escape(),
  body("email", "You must provide a valid email address.")
    .isEmail()
    .normalizeEmail(),
  body("password", "Your password must contain at least 6 characters.")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  body("confirm", "Your passwords must match.").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Your passwords must match.");
    }
    return true;
  }),
  async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);

    let user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      // because passport.authenticate requires "username" field
      username: req.body.email,
      password: req.body.password,
      isMember: false,
      isAdmin: false,
    });
    if (!errors.isEmpty()) {
      res.render("sign-up", {
        title: "Members Clubhouse - Sign Up",
        user: user,
        errors: errors.array(),
      });
    } else {
      let userResult = await User.findOne({ email: user.email });
      // if (err) {
      //   return next(err);
      // }
      if (userResult) {
        res.render("sign-up", {
          title: "Members Clubhouse - Sign Up",
          user: user,
          errors: [{ msg: "Email already exists." }],
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
          if (err) {
            return next(err);
          }
          user.password = hashedPassword;
          user.save(function (err) {
            if (err) {
              console.log(err);
              return next(err);
            }
            res.redirect("/log-in");
          });
        });
      }
    }
  },
];

exports.user_login_get = function (req, res, next) {
  Post.find({}, "author").exec(function (err, posts) {
    if (err) {
      return next(err);
    }
    res.render("log-in", { title: "Members Clubhouse - Log in", posts: posts });
  });
};

exports.user_login_post = [
  body("username", "You must enter a valid email address.")
    .isEmail()
    .normalizeEmail(),

  (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);

    let username = req.body.username;
    let password = req.body.password;

    if (!errors.isEmpty()) {
      res.render("log-in", {
        title: "Members Clubhouse - Log in",
        username: username,
        errors: errors.array(),
      });
    } else {
      User.findOne({ username: username }).exec(function (err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          res.render("log-in", {
            title: "Members Clubhouse - Log in",
            username: username,
            errors: [{ msg: "Email not found." }],
          });
        } else {
          bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
              console.error(err);
              return done(null, false, { message: "Password problem." });
            }
            if (result) {
              next();
            } else {
              res.render("log-in", {
                title: "Members Clubhouse - Log in",
                username: username,
                errors: [{ msg: "Your password is incorrect." }],
              });
            }
          });
        }
      });
    }
  },
];
