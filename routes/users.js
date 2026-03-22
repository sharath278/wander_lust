const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// Register page
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// Register POST
router.post("/signup", async (req, res, next) => {
  try {
    console.log("-> /signup POST HIT");
    const { username, password, email } = req.body;
    console.log("-> BODY parsed", { username, email });
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    console.log("-> User.register success", registeredUser);

    req.login(registeredUser, err => {
      if (err) return next(err);
      console.log("-> req.login success");
      req.flash("success", "Welcome! Registration successful");

      const redirectUrl = req.session.returnTo || "/listings";
      console.log("-> redirectUrl evaluated to:", redirectUrl);
      delete req.session.returnTo;
      req.session.save((err) => {
        if (err) return next(err);
        res.redirect(redirectUrl);
      });
    });
  } catch (e) {
    console.error("SIGNUP ERROR:", e);
    if (e.code === 11000 && e.message.includes("email")) {
      req.flash("error", "Email is already registered. Please login or use another email.");
    } else {
      req.flash("error", e.message);
    }
    res.redirect("/signup");
  }
});

// Login page
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// Login POST
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  (req, res, next) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/listings";
    delete req.session.returnTo;
    req.session.save((err) => {
      if (err) return next(err);
      res.redirect(redirectUrl);
    });
  }
);

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/listings");
  });
});

module.exports = router;
