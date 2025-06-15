const express = require("express");
const app = express();

const PORT = 4000;

// Import functions
const { log } = require("./helpers/consoleTools");

// middleware
app.use(express.json());

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

app.use("/game", gamePlay);

app.listen(PORT, () => {
  log({
    message: `Ready at http://localhost:${PORT}`,
    style: "bright",
    color: "cyan",
  });
});
