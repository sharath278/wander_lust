const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
module.exports = mongoose.model("User", userSchema);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
});

// username + password will be handled by passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
