// USUARIOS

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let Busqueda = new Schema({

  busqueda: {type: String},
  infoUser: {
    appat: {type: String},
    apmat: {type: String},
    nom: {type: String},
    mail: {type: String},
    entFed: { nom: {type: String} },
    org: { cveStr: {type: String}, nom: {type: String} }
  },
  fechaconsulta: {type: Date},
  encontrados: {type: Number}
});

module.exports = mongoose.model('busquedas', Busqueda);
