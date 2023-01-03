const express = require('express');
const app = express();
const mongoose = require('mongoose');
const instRoute = express.Router();
const _ = require('lodash');

// Require Business model in our routes module
// let Usuarios = require('../models/usuario.model');

const models = {
  'usuario': {
    route: '../models/usuario.model',
  }
};

// Agregar y / o actualizar
instRoute.route('/upsert/:model').post(function (req, res) {
  const model = models[req.params.model];

  let dbModel = require(model.route);
  let instDbModel = new dbModel(req.body);

  // let usuarios = new Usuarios(req.body);

  if (!_.get(instDbModel,'_id',null)) {
    console.log('hasOwnProperty: true');

    let id = mongoose.Types.ObjectId();
    instDbModel._id = id;

  } else {
    console.log('hasOwnProperty: false');
  }

  // Buscar por ids
  let filter = {_id: instDbModel._id};

  // Agregar o actualizar
  Usuarios.findOneAndUpdate(filter, instDbModel, {
    new: true,
    upsert: true // Make this update into an upsert
  }).exec((err,data) => {
    if (!err) {
      res.status(200).json(data);
    } else {
      res.status(400).json(null);
    }
  });

});


module.exports = instRoute;
