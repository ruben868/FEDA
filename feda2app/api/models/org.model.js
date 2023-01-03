const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Model = new Schema({
  cveStr: {type: String},
  nom: {type: String},      //
  abr: {type: String},      //
  anc: [{type: String}],
  area: {                   //
    cveStr: {type: String}, //
    nom: {type: String},    //
    abr: {type: String},    //
  },                        //
  eval: {type: Boolean},
  backgroundUpdatedCons: {type: Number},
});

module.exports = mongoose.model('orgs', Model);
