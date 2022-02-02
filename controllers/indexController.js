// indexController.js
const {
  body,
  validatationResult,
  validationResult,
} = require("express-validator");
const Message = require("../models/message");

exports.index = function (req, res, next) {
  res.render("index", { title: "Members Clubhouse - Home" });
};

exports.new_post_get = function (req, res, next) {
  res.render("new-post", { title: "Members Clubhouse - New Post" });
};

exports.new_post_post = [
  body("title", "Post must have a title.").trim().isLength({ min: 1 }).escape(),
  body("content", "Post must have content.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);

    let message = new Message({
      title: req.body.title,
      content: req.body.content,
      user: currentUser,
      timestamp: new Date(),
    });
    if (!errors.isEmpty()) {
      res.render("new-post", {
        title: "Members Clubhouse - New Post",
        message: message,
        errors: errors.array(),
      });
      return;
    } else {
      message.save(function (err) {
        if (err) {
          console.log(err);
          return next(err);
        }
        res.redirect("/");
      });
    }
  },
];
