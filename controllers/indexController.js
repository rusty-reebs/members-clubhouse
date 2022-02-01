// indexController.js

exports.index = function (req, res, next) {
  res.render("index", { title: "Members Clubhouse - Home" });
};
