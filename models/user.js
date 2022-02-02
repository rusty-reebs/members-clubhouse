const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: { type: String, required: true, maxlength: 100 },
  lastname: { type: String, maxlength: 100 },
  email: { type: String, required: true, maxlength: 100 },
  username: { type: String, required: true, maxlength: 100 },
  password: { type: String, required: true, maxlength: 100 },
  isMember: { type: Boolean, required: true },
  isAdmin: { type: Boolean, required: true },
});

module.exports = mongoose.model("User", UserSchema);
