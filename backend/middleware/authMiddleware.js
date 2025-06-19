require("dotenv").config();
const { log } = require("../helpers/consoleTools");

const userAuthMiddleware = (req, res, next) => {
  if (process.env.AUTH_DISABLED === "true") {
    // used to make develoment easer by bypasing user auth.
    log({
      message: "USER AUTH MIDDLEWARE BYPASSED",
      color: "yellow",
      style: "bright",
    });
    return next();
  } else if (req.session && req.session.userId) {
    // session is checked first to prevent the server from crashing in the event of trying to read from a session that dose not exists.
    return next();
  }

  log({ message: "WARNING blocked unauthorized request", color: "yellow" });
  res.status(401).json({ message: "Unauthorized" });
};

module.exports = userAuthMiddleware;
