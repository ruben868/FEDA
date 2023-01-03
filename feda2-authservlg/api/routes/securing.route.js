const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const _ = require('lodash');
const crypto = require('crypto');
const Errors = require('../shared/errors.data');
const dotenv = require('dotenv');
dotenv.config();
const request = require('request');

const clientId = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const authAPIUri = process.env.AUTHAPIURI;

function checkToken(req, res, next) {
  let token = req.headers['authorization']; // Express headers are auto converted to lowercase

  if (_.isNil(token)) {
    res.status(401).send({msg: 'Invalid Token'});
    return;
  }

  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
  console.log(token);
  if (token) {
   console.log(token);
   request.post(authAPIUri+`/checkToken`, {
     json: {
       clientId: clientId,
       token: token,
       clientSecret: clientSecret
     }
   }, (error, res2, body) => {
     console.log('Response >>>>>>>>');
     let responseData = body;
     console.log(responseData);

     if (error) {
       console.error(error);
       return;
     }

     console.log(res2.statusCode);
     if (res2.statusCode === 401) {
       res.status(401).send({msg: 'Invalid Token'});
       return;
     }

     next();
   });
  } else {
    return res.json({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
}

module.exports = {
  checkToken: checkToken
}
