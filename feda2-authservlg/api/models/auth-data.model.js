
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AuthData = new Schema({
  client: {
    clientId: {
      type: String
    }
  },
  pkce: {
    codeChallange: {
      type: String
    },
    codeChallangeMethod: {
      type: String
    },
    creationDate: {
      type: Date
    },
    expirationTime: { // Duración en minutos
      type: Number
    }
  },
  requestInfo: {
    responseType: {
      type: String
    },
    scope: {
      type: String
    },
    redirectUrl: {
      type: String
    },
  },
  authCode: {
    created: {
      type: Date
    },
    authCodeHash: {
      type: String
    },
    expirationTime: {
      type: Number
    }
  },
  userInfo: {
    id: {
      type: Schema.ObjectId
    },
    mail: {
      type: String
    },
    nom: {
      type: String
    },
    appat: {
      type: String
    },
    apmat: {
      type: String
    }
  },
  token: {
    jwt: {
      type: String
    },
    creation: {
      type: Date
    },
    renewTime: {
      type: Number
    },
    expirationTime: {
      type: Number
    },
  },
  logout: {
    when: {
      type: Date
    },
  },
  sesion: {
    id: { type: String },
    token: { type: String },
    isActive: { type: Boolean },
    logoutDate: { type: Date },
  },
  refreshToken: { type: String },
  isActive: {
    type: Boolean
  }
});

module.exports = mongoose.model('auth-data', AuthData);
