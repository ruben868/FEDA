
// Common = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// DB & Models = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const Usuario = require('../models/usuario.model');
const Gencode = require('../shared/gencode.service');

module.exports = {
  mailExists: mailExists,
  upsertNewUser: upsertNewUser,
  sendMail: sendMail,
  validateInvitationCode: validateInvitationCode,
  sendConfirmationCode: sendConfirmationCode,
  validatePin: validatePin,
  activateAccount: activateAccount,
  deleteAccount: deleteAccount,
};

async function mailExists (mail) {
  console.log('mailExists >>>>>>>>>>>>>>>>>>>>');
  // Obtener información del servidor auth
  try {

    const resp = await Usuario.find({
      mail: mail
    });
    console.log(resp);
    console.log(resp.length);

    console.log('mailExists <<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    if (!_.isNil(resp) && resp.length > 0) {
      return true;
    } else {
      return false;
    }

  } catch (e) {
    console.log('mailExists <<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    throw e;
  }
}


// router.route('/upsertUser')
async function upsertNewUser (data) {
  console.log('upsertNewUser >>>>>>>>>>>>>>>>>>>>');
  const opts = _.get(data, 'opts', null);
  console.log(data);
  console.log(opts);
  try {
    // data.hpwd = crypto.createHash('sha256').update(data.pwd).digest('base64');
    data._id = (_.isNil(data["_id"]) || _.isEmpty(data["_id"])) ? mongoose.Types.ObjectId() : mongoose.Types.ObjectId(data["_id"]);
    console.log('After id validation');
    console.log(data);

    if (_.isNil(data.docInfo)) {
      data.docInfo = {
        isActive: true
      };
    }

    // Establecer pwd si existe
    const pwd = _.get(data, 'pwd', null);
    if (!_.isNil(pwd)) {
      data.hpwd = crypto.createHash('sha256').update(pwd).digest('base64');
    }

    data.tipo = 'personal';

    const resp = await Usuario.findOneAndUpdate(
      {
        mail: data.mail
      },
      data,
      {
        new: true,
        upsert: true // Make this update into an upsert
    });

    if (!_.isNil(opts)) {
      console.log('no es nulo');
      if (opts.sendInvitation) {
        // Generar invitation code
        const baseCode = Gencode.makeid(50) + moment(new Date()).format('YYYYMMDDHHmmssSSS');
        resp.invitationCode = crypto.createHash('sha256').update(baseCode).digest('base64');
        await resp.save();
        // Mandar correo
        // toMail, redirectUrl, invitationCode, mode, appName
        await sendInvitationMail(resp.mail, opts.redirectUrl, resp.invitationCode, 0, opts.appName);
      }
    }

    return resp;
    // return {
    //   mail: resp.mail,
    //   _id: resp._id,
    // };
  } catch (e) {
    console.log(e);
    console.log('upsertNewUser <<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    throw e;
  }
}

// router.route('/send-mail')
async function sendMail (data) {
  console.log('sendMail >>>>>>>>>>>>>>>>>>>>');

  const mailerConf = {
    host: "smtpout.secureserver.net",
    secureConnection: true,
    port: 465,
    auth: {
      user: "admin@sesnsp-cni.app",
      pass: "D3vcn1r0b102015!"
    }
  };

  const mailOptions = {
    to: 'sadj85@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };

  const res = await wrapedSendMail(mailerConf, mailOptions);
  return res;
}

// //  Mandar información de la cuenta
// async function sendTempralAccountInfo(toMail, appUrl, temporalPass, appName) {
//   const url = `https://auth.sesnsp-cni.app/activacion/act/${mode}/${activationCode}`;
//   const res = await wrapedSendMail({}, {
//     to: toMail,
//     subject: 'Activación de cuenta para portal ['+ appName +']',
//     text: 'Ingrese al portal ' + appUrl + ' con la contraseña temporal ' + temporalPass +
//   });
//   return res;
// }

// Send activation mail
async function sendInvitationMail(toMail, redirectUrl, invitationCode, mode, appName) {
  const url = `${process.env.BASE_UI_URI}activation/act/${fixedEncodeURIComponent(mode)}/${fixedEncodeURIComponent(invitationCode)}/${fixedEncodeURIComponent(redirectUrl)}/${fixedEncodeURIComponent(appName)}`;
  const res = await wrapedSendMail({}, {
    to: toMail,
    subject: 'Activación de cuenta para portal ['+ appName +']',
    text: 'Ingrese a la siguiente dirección de internet para poder activar su cuenta ' + url,
  });
  return res;
}


function fixedEncodeURIComponent (str) {
  return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
}


// Validate activation from invitation code
async function validateInvitationCode(invitationCode) {
  try {
    const usr = await Usuario.findOne({invitationCode: invitationCode});
    if(!_.isNil(usr) && !_.isEmpty(usr) && usr.needsChangePwd) {
      return {
        mail: usr.mail,
        needsChangePwd: usr.needsChangePwd,
      };
    }
    return null;
  } catch (e) {
    throw e;
  }
}


// Validate activation from invitation code
async function sendConfirmationCode(invitationCode) {
  try {
    const usr = await Usuario.findOne({invitationCode: invitationCode});
    if(!_.isNil(usr) && !_.isEmpty(usr)) {
      const pin = Gencode.makeidNum(6);
      usr.pinCode = pin;
      usr.pinCodeGen = new Date();
      await usr.save();
      // return pin;

      // Mandar al correo
      const res = await wrapedSendMail({}, {
        to: usr.mail,
        subject: 'Pin de confirmación',
        text: 'Utilice el siguiente código para validar su cuenta ' + pin,
      });
      await wrapedSendMail(null, res);
    }
    return null;
  } catch (e) {
    throw e;
  }
}

// Validate activation from invitation code
async function validatePin(invitationCode, pin) {
  try {
    const usr = await Usuario.findOne({invitationCode: invitationCode, pinCode: pin});
    if(!_.isNil(usr) && !_.isEmpty(usr)) {
      // TODO: VALIDAR VIGENCIA DEL CODIGO
      return true;
    }
    return null;
  } catch (e) {
    throw e;
  }
}

// Validate activation from invitation code
async function activateAccount(invitationCode, pin, pwd) {
  try {
    console.log(invitationCode);
    console.log(pin);
    const usr = await Usuario.findOne({invitationCode: invitationCode, pinCode: pin});
    console.log(usr);
    if(!_.isNil(usr) && !_.isEmpty(usr)) {
      usr.hpwd = crypto.createHash('sha256').update(pwd).digest('base64');
      usr.isMailOwnershipConfirmed = true;
      usr.needsChangePwd = false;
      await usr.save();
      return true;
    }
    console.log('returning null');
    return null;
  } catch (e) {
    console.log(e);
    throw e;
  }
}


// // Send invitation
// async function activateAccountMail(toMail, portal, invitationCode, mode, appUrl, appName) {
//   const url = `https://auth.sesnsp-cni.app/activacion/act/${mode}/${invitationCode}/${appUrl}/${appName}`;
//   const res = await wrapedSendMail({}, {
//     to: toMail,
//     subject: 'Activación de cuenta para portal ['+ portal +']',
//     text: 'Ingrese a la siguiente dirección de internet para poder activar su cuenta ' + url,
//   });
//   return res;
// }

async function wrapedSendMail(mailerConf, mailOpts) {
  return new Promise((resolve,reject)=>{
    mailerConf = {
      host: "smtpout.secureserver.net",
      secureConnection: true,
      port: 465,
      auth: {
        user: "admin@sesnsp-cni.app",
        pass: "D3vcn1r0b102015!"
      }
    };

    mailOpts.from = mailerConf.auth.user;

    let transporter = nodemailer.createTransport(mailerConf);
    let resp=false;

    transporter.sendMail(mailOpts, function(error, info){
      if (error) {
        console.log("error is "+error);
        resolve(false); // or use rejcet(false) but then you will have to handle errors
      }
      else {
        console.log('Email sent: ' + info.response);
        resolve(true);
      }
    });
  })
}

async function deleteAccount(userId, hardDelete) {
  try {
    console.log('deleteAccount > > > > > > > > > > > > > > > > > > > > > > > > > > > >' );
    console.log(userId);
    console.log(hardDelete);
    let result = true;

    if (hardDelete) {
      const res = await Usuario.deleteOne({_id: mongoose.Types.ObjectId(userId)});
      console.log(res);
    } else {
      const user = await Usuario.find({_id: userId});
      user.docInfo.isActive = false;
      await user.save();
    }
    console.log('deleteAccount < < < < < < < < < < < < < < < < < < < < < < < < < < < < <' );
    return result;
  } catch (e) {
    console.log('deleteAccount < < < < < < < < < < < < < < < < < < < < < < < < < < < < <' );
    console.log(e);
  }
  console.log('deleteAccount < < < < < < < < < < < < < < < < < < < < < < < < < < < < <' );
  return false;
}
