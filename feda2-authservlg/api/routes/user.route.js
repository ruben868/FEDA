const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const _ = require('lodash');
const crypto = require('crypto');
const Errors = require('../shared/errors.data');

let Usuarios = require('../models/usuario.model');

const UserCtrl = require('../controllers/user.controller');

router.route('/upsert').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      let response = await upsertUsuario(req.body);
      res.status(200).send(response);
    } catch (error){
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});

router.route('/getall').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      let response = await getAllUsuarios();
      res.status(200).send(response);
    } catch (error){
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

router.route('/getById/:id').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      let response = await getUsrById(req.params.id);
      res.status(200).send(response);
    } catch (error){
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

async function upsertUsuario (data) {
  // Validar que tenga id
  const _id =  _.isNull(_.get(data,'_id',null)) ? null : _.get(data,'_id');

  // Validar que el correo sea único
  let hasUnique = false;
  data.mail = data.mail.toLowerCase();

  if ( _.isNull(_id) ) {
    // Es nuevo
    data._id = mongoose.Types.ObjectId();
  }

  // Tranformaciones de datos
  let selAttrs = {
    nom: null,
    appat: null,
    apmat: null,
    mail: null,
    hpwd: null,
    fecnac: null,
    docInfo: null,
    sexo: null,
    lstChanges: null
  };

  if (!_.isNil(data.pwd)) {
    data.hpwd = crypto.createHash('sha256').update(data.pwd).digest('base64');
  }

  let result = _.pick(data, _.keys(selAttrs));

  // console.log(result);
  //let usuario = new Usuarios(result);
  //console.log(usuario);

  let resp = await Usuarios.findOneAndUpdate({_id: data._id}, result, {
    new: true,
    upsert: true // Make this update into an upsert
  });
  // console.log(resp);

  return {
    data: resp,
    error: '',
    errorCode: 0
  };
}

async function getAllUsuarios () {
  let resp = await Usuarios.find({'docInfo.isActive': true});
  return resp;
}

async function getUsrById (id) {
  let resp = await Usuarios.find({_id: id});
  return resp;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/mailAlreadyExists/:mail').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      let response = await UserCtrl.mailExists(req.params.mail);
      res.status(200).send({
        alreadyExists: response
      });
    } catch (error){
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/upsertUser').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      let response = await UserCtrl.upsertNewUser(req.body);
      res.status(200).send(response);
    } catch (error){
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

module.exports = router;
