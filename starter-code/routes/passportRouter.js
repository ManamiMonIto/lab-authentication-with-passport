const express        = require("express");
const passportRouter = express.Router();
// Require user model
const UserDb = require("../models/user");
// Add bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


// Add passport 
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");


passportRouter.get("/private", ensureLogin.ensureLoggedIn(), (req, res) => {
 
  res.render("passport/private", { user: req.user });
});

module.exports = passportRouter;


///// singup GET
passportRouter.get("/signup", (req, res) => {
  res.render("passport/signup");
});
///// login GET
passportRouter.get("/login", (req, res) => {
  res.render("passport/login", { errorMessage: req.flash("error") });
});


//// signup POST
passportRouter.post("/signup", (req, res) => {

  const { username, password } = req.body;

  if (!password || !username) {
    res.render("passport/signup", { errorMessage: "Both fields are required" });

    return;
  } else if (password.length < 8) {
    res.render("passport/signup", {
      errorMessage: "Password needs to be 8 characters min"
    });

    return;
  }
  UserDb.findOne({ username: username })
  .then(user => {
    if (user) {
      res.render("passport/signup", {
        errorMessage: "This username is already taken"
      });

      return;
    }
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(password, salt);

    return UserDb.create({
      username,
      password: hash
    }).then(data => {
      res.redirect("/");
    });
  })
  .catch(err => {
    res.render("passport/signup", { errorMessage: err._message });
  });
})

//// login POST
passportRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

///logout
passportRouter.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});