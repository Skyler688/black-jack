require("dotenv").config();

const { log } = require("../tools/consoleTools");

const changePassMiddleware = (req, res, next) => {
  if (process.env.AUTH_DISABLED === "true") {
    return next();
  } else if (req.session && req.session.userPassVal) {
    return next();
  }

  log({ message: "WARNING blocked unauthorized request", color: "yellow" });
  res.status(401).json({ message: "Unauthorized" });
};

module.exports = changePassMiddleware;
