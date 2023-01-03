// DATPERS

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Datper = new Schema({
  noms: {type: String},
  appat: {type: String},
  apmat: {type: String},
  fecnac: {type: Date},
  sexo: {
    cve: {type: Number},
    nom: {type: String},
  },
  entNac: {
    cve: {type: String},
    nom: {type: String},
  },
  nac: {
    cve: {type: String},
    nom: {type: String},
  },
  titulo: {type: String},
  tituloAbr: {type: String},
});

module.exports = mongoose.model('datpers', Datper);
