// indexController.js
const { body, validationResult } = require("express-validator");
const Post = require("../models/post");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const User = require("../models/user");
dayjs.extend(relativeTime);

exports.index = function (req, res, next) {
  Post.find({}, "title content author timestamp")
    .sort({ timestamp: -1 })
    .populate("author")
    .exec(function (err, posts) {
      if (err) {
        return next(err);
      }
      res.render("index", {
        title: "Members Clubhouse - Home",
        posts: posts,
      });
    });
};

exports.join_get = function (req, res, next) {
  res.render("join", { title: "Members Clubhouse - Join " });
};

exports.join_post = [
  body("code", "You must enter the code.").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    let inputCode = req.body.code;

    if (!errors.isEmpty()) {
      res.render("new-post", {
        title: "Members Clubhouse - New Post",
        code: inputCode,
        errors: errors.array(),
      });
      return;
    } else {
      if (inputCode === "MEMBER") {
        User.findByIdAndUpdate(
          req.user._id,
          { isMember: true },
          { new: true },
          function (err, user) {
            if (err) {
              return next(err);
            }
            res.redirect("/");
          }
        );
      }
    }
  },
];

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

    let post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user._id,
      timestamp: new dayjs(),
    });
    console.log(post);
    if (!errors.isEmpty()) {
      res.render("new-post", {
        title: "Members Clubhouse - New Post",
        message: message,
        errors: errors.array(),
      });
      return;
    } else {
      post.save(function (err) {
        if (err) {
          console.log(err);
          return next(err);
        }
        res.redirect("/");
      });
    }
  },
];
