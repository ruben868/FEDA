const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const AuthCtrl = require('../shared/authorization.service');
const UserCtrl = require('../controllers/user.controller');

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/create-unattended').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      console.log('create-unattended');
      let response = await AuthCtrl.createUnatt(req.body);
      res.status(200).send(response);
    } catch (error){
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/delete-account').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      console.log('create-unattended');
      const data = req.body;
      let response = await UserCtrl.deleteAccount(data.userId, data.hardDelete);
      res.status(200).send(response);
    } catch (error){
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

module.exports = router;
