const mongoose = require("mongoose");

const UserInfo = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 20,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  money: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("user", UserInfo);
