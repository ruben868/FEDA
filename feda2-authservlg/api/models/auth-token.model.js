
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AuthToken = new Schema({
  clientId: {
    type: String
  },
  clientCode: {
    type: String
  },
  authCode: {
    type: String
  },
  prevToken: {
    type: String
  },
  token: {
    type: String
  },
  creation: {
    type: Date
  },
  lastCreation: {
    type: Date
  },
  user: {
    type: Object
  }
});

module.exports = mongoose.model('auth-token', AuthToken);
