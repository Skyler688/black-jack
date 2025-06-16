const UserInfo = require("../models/user");
const { log, err } = require("../helpers/consoleTools");

const createUser = (req, res) => {
  try {
  } catch (error) {
    err({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};
