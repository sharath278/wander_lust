const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listingsRouter = require("./routes/listings");
const reviewsRouter = require("./routes/reviews");
const usersRouter = require("./routes/users");

// ✅ IMPORTANT CHANGE (DB connection)
const MONGO_URL =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";

mongoose.connect(MONGO_URL)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.error("DB Connection Error:", err));

// Settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session store configuration
const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SECRET || "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

// Session config
app.set("trust proxy", 1); // Trust Render proxy
app.use(session({
  store,
  secret: process.env.SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    // Render proxy handles https, so secure cookie is set ideally over HTTPS
    // Only set secure=true if you have https, or skip checking NODE_ENV if it's strictly Render HTTPS.
    // Leaving it as `true` might break local dev if process.env.NODE_ENV is set to "production" locally without HTTPS
    // Commonly checked with process.env.NODE_ENV:
    secure: process.env.NODE_ENV === "production" ? true : false
  }
}));

app.use(flash());
d
// Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for flash messages and current user
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Home route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Routers
app.use("/listings", listingsRouter);
app.use("/reviews", reviewsRouter);
app.use("/", usersRouter);

// Catch all 404 Error handler
app.all(/(.*)/, (req, res, next) => {
  const err = new Error("Page Not Found");
  err.status = 404;
  next(err);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).render("error.ejs", { err });
});

// ✅ IMPORTANT CHANGE (PORT)
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));