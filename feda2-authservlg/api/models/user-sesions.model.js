
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSession = new Schema({
  clientId: {
    type: String
  },
  userId: {
    type: Schema.ObjectId
  },
  secret: {
    type: String
  },
  type: {
    type: String
  },

  sesions: [{
    pkce: {type: String},
    pkce_method: {type: String},
    expirationTime: {type: Number}, // In Seconds
    created: {type: Date},
    authCodeData: {
      authCode: {type: String},
      created: {type: Date},
      expirationTime: {type: Number}, // In Seconds
    },
    tokenData: {
      token: {type: String},
      refreshToken: {type: String},
      prevRefreshToken: {type: String},
      created: {type: Date},
      expirationTime: {type: Number}, // In Seconds
    },
    isActive: {type: Boolean},
    endSesion: {type: Date},
  }],
});

module.exports = mongoose.model('user-sessions', UserSession);
