// CATALOGOS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let CatalogosModel = new Schema({
  cveStr: {
    type: String
  },
  cve: {
    type: Number
  },
  cat: {
    type: String
  },
  nom: {
    type: String
  }
});

module.exports = mongoose.model('catalogos', CatalogosModel);
