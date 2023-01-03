// ENTIDADES FEDERATVIAS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let EntFedsModel = new Schema({
  nom: {
    type: String
  },
  cveStr: {
    type: String
  },
  abr: {
    type: String
  },
  cve: {
    type: Number
  },
  tipo: {
    type: String
  },
  "anc-id":[{type: mongoose.Types.ObjectId}]
});

module.exports = mongoose.model('entidades-federativas', EntFedsModel);
