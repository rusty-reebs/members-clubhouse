const express = require("express");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const mongoDb = process.env.MONGO_URI;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Mongo connection error"));

const app = express();
app.set("views", __dirname + "views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.listen(process.env.PORT, () =>
  console.log("Listening on port ", process.env.PORT)
);
