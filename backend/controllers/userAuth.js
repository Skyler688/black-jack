const UserInfo = require("../models/user");
const { log, err } = require("../helpers/consoleTools");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");

const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPass = await bcrypt.hash(password, 10);
    const user = {
      username: username,
      password: hashedPass,
      money: 0,
    };

    let newUser;
    try {
      newUser = await UserInfo.create(user);
    } catch (error) {
      if (error.code === 11000) {
        log({ message: "WARNING username already taken", color: "yellow" });
        return res.status(409).json({ message: "Username taken" });
      }
    }

    req.session.userId = newUser._id;

    log({ message: "User successfully created", color: "green" });
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    err({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserInfo.findOne({ username });
    if (!user) {
      log({ message: "Warning invalid username", color: "yellow" });
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passCorrect = await bcrypt.compare(password, user.password);
    if (!passCorrect) {
      log({ message: "WARNING invalid password", color: "yellow" });
      return res.status(401).json({ message: "Invalid username or password" });
    }

    req.session.userId = user._id;

    log({ message: "User successfully loged in", color: "magenta" });
    res.status(200).json({ message: "User found and password correct" });
  } catch (error) {
    err(error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = [
  authMiddleware,
  async (req, res) => {
    try {
      const { username } = req.body;

      const user = await UserInfo.findOneAndDelete({ username: username });
      if (!user) {
        log({ message: "WARNING user not found", color: "yellow" });
        return res.status(404).json({ message: "User not found" });
      }

      req.session.destroy((error) => {
        if (error) {
          err({ message: "Failed to destroy session cookie" });
          return res
            .status(500)
            .json({ message: "Error ending session cookie" });
        }
      });

      log({ message: "User deleted sucsessfully", color: "magenta" });
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      err(error.message);
      res.status(500).json({ message: error.message });
    }
  },
];

module.exports = { createUser, login, deleteUser };
