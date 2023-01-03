// USUARIOS

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let AuthUserSubset = new Schema({
  _id: { type: mongoose.Types.ObjectId },              //
  nom: {                                                 //
    type: String                                         //
  },                                                     //
  appat: {                                               //
    type: String                                         //
  },                                                     //
  apmat: {                                               //
    type: String                                         //
  },                                                     //
  mail: {                                                //
    type: String,                                        //
    // required: true,                                   //
    // unique: true                                      //
  },                                                     //
  fecnac: {                                               //
    type: Date                                            //
  },                                                      //
  tipo: {                                                 //
    type: String,                                         //
    default: 'personal' // persona, unattended            //
  },                                                      //
  sexo: {                                                 //
    type: Object                                          //
  },                                                      //
  tipoCreacion: {                                         //
    cveStr: {type: String},                               //
    cve: {type: Number},                                  //
    cat: {type: String},                                  //
    nom: {type: String},                                  //
  },                                                      //
  entnac: {                                            //
    cve: {type: Number},                               //
    cveStr: {type: String},                            //
    nom: {type: String},                               //
    tipo: {type: String},                              //
  },                                                   //
  clientId: {type: String},                            //
  clientSecret: {type: String},                        //
  ancestors: [{type: mongoose.Types.ObjectId}],      //
});

module.exports = mongoose.model('auth-user-subset', AuthUserSubset);
