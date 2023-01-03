const express = require('express');
const router = express.Router();
const _ = require('lodash');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const CargaCtrl = require('../controllers/cargas.ctrl');
const AuthClientCtrl = require('../controllers/auth-client.ctrl');
const LogCtrl = require('../controllers/logs.ctrl');

// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/numex').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      console.log('numex  > > > > > > > > > > > > > > > > > > > > > > > >');
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const authData = AuthClientCtrl.getAuthHeadersInfo(req.headers);
      console.log(authData);
      const data = req.body;
      const response = await CargaCtrl.wscarga(data, authData.userId, ip);

      if ( !_.isNil(response) && response.estatus == 1) {
        res.status(201).send({id: response._id});
      } else {
        res.status(409).send({msg: 'No se pudo completar la carga'});
      }

    } catch (error) {
      console.log(error);
      res.status(400).send({msg: error.toString()});
    }
  };

  fnMain(req, res);
});

module.exports = router;
