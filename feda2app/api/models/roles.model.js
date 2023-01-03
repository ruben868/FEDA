// ROLES
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let RolesModel = new Schema({
  nom: {
    type: String
  },
  cveStr: {
    type: String
  },
  isActive: {
    type: Boolean
  },
  paths: [{type: String}]
});

module.exports = mongoose.model('roles', RolesModel);
