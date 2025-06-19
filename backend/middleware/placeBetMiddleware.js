const { log } = require("../helpers/consoleTools");

const placeBetMiddleware = (req, res, next) => {
  if (req.session && req.session.placeBet) {
    return next();
  }

  log({ message: "WARNING blocked unauthorized request", color: "yellow" });
  res.status(401).json({ message: "Unauthorized" });
};

module.exports = placeBetMiddleware;
