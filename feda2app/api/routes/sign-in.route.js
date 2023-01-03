const express = require('express');
const router = express.Router();
const _ = require('lodash');
const mongoose = require('mongoose');

const AuthClientCtrl = require('../controllers/auth-client.ctrl');

// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/v1/endsession').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      console.log('INIT endsession - - - - - - - - - - - - - -');
      console.log(req.headers);
      const authData = AuthClientCtrl.getAuthHeadersInfo(req.headers);

      const response = await AuthClientCtrl.endAccountSession(authData);
      res.status(200).send(response);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR endsession - - - - - - - - - - - - - -');
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

module.exports = router;
