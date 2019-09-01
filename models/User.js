const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  nickName: {
    type: String,
    required: true
  },
  // googleId: {
  //   type: String
  // },
  email: {
    type: String,
  },
  password: {
    type: String
  }
});

module.exports = mongoose.model('users', UserSchema);
