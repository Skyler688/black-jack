require("dotenv").config();

const express = require("express");
const app = express();
const PORT = 4000;

const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");

// Import functions
const { log } = require("./tools/consoleTools");

// middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "ElmTree",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: null,
    },
  })
);

app.use((req, res, next) => {
  log({
    message: `Request received, Route: ${req.url}, Method: ${req.method}`,
    color: "gray",
    style: "under",
  });

  next();
});

// Routes
const gamePlay = require("./routes/gameRoutes");
const userAuth = require("./routes/userRoutes");

app.use("/game", gamePlay);
app.use("/user", userAuth);

async function start() {
  await mongoose.connect(process.env.MONGO_URI).then(() => {
    log({ message: "MongoDB connected", style: "bright", color: "cyan" });
  });
  app.listen(PORT, () => {
    log({
      message: `Ready at http://localhost:${PORT}`,
      style: "bright",
      color: "cyan",
    });
  });

  if (process.env.AUTH_DISABLED === "true") {
    log({
      message: "USER AUTH MIDDLEWARE BYPASSED",
      color: "yellow",
      style: "bright",
    });
  }
}

start();
