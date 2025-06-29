const UserInfo = require("../models/user");
const { log, err } = require("../tools/consoleTools");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");
const changePassMiddleware = require("../middleware/changePassMiddleware");

// used to delete the users maped gameState. this is done in the logout function to
// ovoid the users game state from sitting in ram while not activly playing. This prevents
// possible memory overflow.
const { gameState } = require("./gamePlay");

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

    req.session.user = newUser.username;

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
      return res
        .status(401)
        .json({ message: "Invalid username or password", access: false });
    }

    const passCorrect = await bcrypt.compare(password, user.password);
    if (!passCorrect) {
      log({ message: "WARNING invalid password", color: "yellow" });
      return res
        .status(401)
        .json({ message: "Invalid username or password", access: false });
    }

    req.session.user = user.username;

    log({ message: "User successfully loged in", color: "magenta" });
    res
      .status(200)
      .json({ message: "User found and password correct", access: true });
  } catch (error) {
    err(error.message);
    res.status(500).json({ message: error.message });
  }
};

const cookieCheck = (req, res) => {
  try {
    if (req.session && req.session.user) {
      log({ message: "Cookie valid", color: "magenta" });
      return res.status(200).json({ message: "Cookie valid" });
    }

    log({ message: "WARNING invalid or missing cookie", color: "yellow" });
    return res.status(401).json({ message: "Unautorised" });
  } catch (error) {
    err(error.message);
    res.status(500).json({ message: error.message });
  }
};

const changePassValidation = [
  authMiddleware,
  async (req, res) => {
    try {
      const { username, oldPassword } = req.body;

      const userCheck = await UserInfo.findOne({ username: username });
      if (!userCheck) {
        log({ message: "WARNING invalid username", color: "yellow" });
        return res.status(404).json({ message: "Invalid username" });
      }

      const passCheck = await bcrypt.compare(oldPassword, userCheck.password);
      if (!passCheck) {
        log({ message: "WARNING invalid password", color: "yellow" });
        return res.status(404).json({ message: "Invalid password" });
      }

      req.session.userPassVal = true;

      log({
        message: "Correct password entered, validation session created",
        color: "green",
      });
      res
        .status(200)
        .json({ message: "Correct password, validation session created" });
    } catch (error) {
      err(error.message);
      res.status(500).json({ message: error.message });
    }
  },
];

const changePass = [
  changePassMiddleware,
  async (req, res) => {
    try {
      const { username, newPassword } = req.body;

      const user = await UserInfo.findOne({ username: username });
      if (!user) {
        log({ message: "WARNING invalid username", color: "yellow" });
        return res.status(404).json({ message: "Invalid username" });
      }

      const hashedPass = await bcrypt.hash(newPassword, 10);
      const updatedUserObj = {
        username: user.username,
        password: hashedPass,
        money: user.money,
      };

      const updateUser = await UserInfo.findOneAndReplace(
        { _id: user._id },
        updatedUserObj,
        { new: true, runValidators: true }
      );
      if (!updateUser) {
        log({
          message: "WARNING failed to find and update user",
          color: "yellow",
        });
        return res
          .status(404)
          .json({ message: "Failed to find and update user" });
      }

      delete req.session.userPassVal; // delete the users password change validation after change if successfull.

      log({ message: "User password updated successfully", color: "magenta" });
      res.status(200).json({ message: "User password updated successfully" });
    } catch (error) {
      err(error.message);
      res.status(500).json({ message: error.message });
    }
  },
];

const logout = [
  authMiddleware,
  (req, res) => {
    try {
      gameState.delete(req.session.user); // remove users game instance from memory, imported from the /controllers/gamePlay.js file.

      req.session.destroy((error) => {
        // destroy all sessions the user may have
        if (error) {
          err({ message: "Failed to destroy session cookie", color: "red" });
          return res
            .status(500)
            .json({ message: "Error ending session cookie" });
        }
      });

      res.clearCookie("connect.sid"); // clear the clients cookie
      res.status(200).json({ message: "User loged out successfully" });
    } catch (error) {
      err(error);
      res.status(500).json({ message: error.message });
    }
  },
];

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
        // distroy all session data for user
        if (error) {
          err({ message: "Failed to destroy session cookie", color: "red" });
          return res
            .status(500)
            .json({ message: "Error ending session cookie" });
        }
      });

      log({
        message: "User deleted sucsessfully and session destroyed",
        color: "magenta",
      });

      delete req.session.user;

      res.clearCookie("connect.sid");
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      err(error.message);
      res.status(500).json({ message: error.message });
    }
  },
];

module.exports = {
  createUser,
  login,
  cookieCheck,
  changePassValidation,
  changePass,
  logout,
  deleteUser,
};
