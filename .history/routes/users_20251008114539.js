const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// ------------------- SIGNUP -------------------
// Signup page
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs"); // ✅ Use signup.ejs template
});

// Signup POST
router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });

    // Register user
    const registeredUser = await User.register(user, password);

    // Auto-login after signup
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome! Registration successful");

      // Redirect to the page user originally wanted
      const redirectUrl = req.session.returnTo || "/listings";
      delete req.session.returnTo;
      res.redirect(redirectUrl);
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

// ------------------- LOGIN -------------------
// Login page
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// Login POST
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/listings";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

// ------------------- LOGOUT -------------------
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/listings");
  });
});

module.exports = router;
