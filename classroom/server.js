const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const app = express();  

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(
  session({
    secret: "mysecretsuperstring",
    resave: false,             
    saveUninitialized: true,  
  })
);

app.use(flash());

app.get("/register", (req, res) => {
  let { name } = req.query;
  req.session.name = name;
  req.flash("success", "user registered successfully");
  res.redirect("/greet");
});

app.get("/greet", (req, res) => {
  res.render("page.ejs", { 
    name: req.session.name, 
    msg: req.flash("success")   
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
