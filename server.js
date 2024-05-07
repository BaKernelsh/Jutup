const express = require("express");
const app = express();
const path = require("path");
const http = require("http").createServer(app);

let isLoggedIn = false;

app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static(__dirname+ "/public"));
app.set("view engine", "ejs");

http.listen(3000, function () {
  console.log("Server started");

  app.get("/", function(req, res) {
    res.render("index", {isLoggedIn: isLoggedIn});
  });

  app.get("/register", function(req, res){
    res.render("register");
  })

  app.get("/login", function(req, res){
    isLoggedIn = true;
    res.render("login");
  })

});
