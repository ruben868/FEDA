
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AuthCodeInfo = new Schema({
  clientId: {
    type: String
  },
  codeChallange: {
    type: String
  },
  codeChallangeMethod: {
    type: String
  },
  responseType: {
    type: String
  },
  scope: {
    type: String
  },
  redirectUrl: {
    type: String
  },
  createCodeDate: {
    type: Date
  },

  authCodeHash: {
    type: String
  },
  authCodeHashMethod: {
    type: String
  },
  authCode: {
    type: String
  },
  user: {
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
  }
});

module.exports = mongoose.model('auth-code-info', AuthCodeInfo);
