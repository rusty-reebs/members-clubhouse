// userController.js

const User = require("../models/user");
const { body, check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs/dist/bcrypt");

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
  body(
    "password",
    "Your password must contain at least 6 characters including: 1 lowercase letter, 1 uppercase letter, and 1 number."
  )
    .trim()
    .isLength({ min: 6 })
    .escape(),
  body("confirm", "Your passwords must match.").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Your passwords must match.");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);

    let user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
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
      return;
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
  },
];

exports.user_login_get = function (req, res, next) {
  res.render("log-in", { title: "Members Clubhouse - Log in" });
};
