const { log } = require("../helpers/consoleTools");

function hitStandMiddleware(req, res, next) {
  if (req.session && req.session.hitStand) {
    return next();
  }

  log({ message: "WARNING blocked unauthorized request", color: "yellow" });
  res.status(401).json({ message: "Unauthorized" });
}

module.exports = hitStandMiddleware;
