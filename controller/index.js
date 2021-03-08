const { getDb } = require("../util/db");
const { sendMail } = require("../middleware/sendMail");

exports.getHome = (req, res, next) => {
  if (req.user && req.user.username && req.user.displayName) {
    res.redirect("/promo");
  } else {
    res.render("index", {
      errorMessage: null,
    });
  }
};

exports.getPromo = (req, res, next) => {
  const db = getDb();

  const userdata = { name: req.user.displayName, username: req.user.username };

  db.collection("twitterUsers")
    .find({ username: req.user.username })
    .next()
    .then((user) => {
      res.render("promo", {
        dname: req.user.displayName,
        username: user.username,
        code: user.code,
        flasherror: req.flash("error"),
        error: null,
      });
    })
    .catch((err) => {
      res.render("promo", {
        dname: req.user.displayName,
        username: req.user.username,
        code: null,
        flasherror: null,
        error: ` ❌ Sorry, You weren't on the list, no sneaking in!`,
      });
    });
};

exports.postPromo = (req, res) => {
  const info = { ...req.body };
  sendMail(info)
    .then((result) => {
      return res.redirect("/success");
    })
    .catch((err) => {
      req.flash("error", "❌ Process Failed. Try again");
      return res.redirect("/promo");
    });
};

exports.success = (req, res) => {
  res.render("success");
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};
