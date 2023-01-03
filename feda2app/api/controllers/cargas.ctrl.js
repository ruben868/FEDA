// Common = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const _ = require('lodash');
const got = require('got');
const moment = require('moment');
moment.locale('es');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

// DB MODELS -----------------------------------------------------------
const Periods = require('../models/periods.model.js');
const Cargas = require('../models/cargas.model');
const Usuario = require('../models/usuario.model');
const WSCarga = require('../models/wscarga.model');
const WSCargaInfo = require('../models/wscarga-info.model');
const EntidadesModel = require('../models/entidades-federativas.model');

module.exports = {
  createPeriods: createPeriods,
  insertPeriods: insertPeriods,
  getCargas: getCargas,
  getCargasById: getCargasById,
  upsertCarga: upsertCarga,
  updateProceso: updateProceso,
  getPeriodByYear: getPeriodByYear,
  wscarga: wscarga,
  updateWSCarga: updateWSCarga,
  createNewAppError: createNewAppError,
  isInstanceOfAppError: isInstanceOfAppError,
  newAppErrObj: newAppErrObj,
  getCurrentStatWSCarga: getCurrentStatWSCarga,
};


function createPeriods(year, startDate) {
  moment.updateLocale("en", { week: {
      dow: 1, // First day of week is Monday
      doy: 4  // First week of year must contain 4 January (7 + 1 - 4)
    }});
  // const initYear = moment(year.toString()+'-01-01');
  const initYear = moment(startDate);

  // Localizar el primer lunes
  let onYear = true;
  let weekNum = 1;
  let periodData = null;
  let periods = [];
  while(onYear) {
    if (initYear.format('d') == 1) { // Lunes
      let wnTemp = '0'+weekNum;
      wnTemp = year.toString() + '-' + wnTemp.substring(wnTemp.length-2, wnTemp.length);

      periodData = {};
      periodData.start = initYear.toDate();
      periodData.startNum = initYear.format('YYYYMMDD');
      periodData.weekNum = weekNum;
      periodData.weekLabel = 'S'+weekNum;
      periodData.year = year;
      periodData.yearWeek = wnTemp;
      weekNum = weekNum + 1;

      if (initYear.toDate() >= startDate) {
        periodData.isActive = true;
      } else {
        periodData.isActive = false;
      }
    }

    if (initYear.format('d') == 0 && !_.isNil(periodData)) { // Domingo
      periodData.end = initYear.toDate();
      periodData.endNum = initYear.format('YYYYMMDD');
      periods.push(periodData);
      periodData = null;
    }

    initYear.add(1, 'd');
    if (initYear.year() > year) {
      onYear = false;
    }
  }

  console.log(periods);
  return periods;
}

async function insertPeriods(year, periodList) {
  console.log('insertPeriods - - - - - - ');
  let result = false;
  try {
    // Borrar todas las cargas !!!!!!
    // await Cargas.deleteMany({'periodo.year': year});

    // Eliminar el anio
    console.log('Before delete- - - - - - ');
    const respDelete = await Periods.deleteMany({year: year});
    console.log('After delete- - - - - - ');
    // Insertar varios
    console.log('Before insert- - - - - - ');
    const respInsert = await Periods.insertMany(periodList);
    console.log('After insert- - - - - - ');
    result = true;
  } catch (e) {
    console.log('insertPeriods ERROR- - - - - - ');
    console.log(e);
    throw e;
  }
  return result;
}


// ================================================================================================
async function getCargas(fecha, authUserId, cveEntFed, cveOrg) {
  const fechaNum = +moment(fecha).format('YYYYMMDD');
  console.log(fechaNum);
  try {
    const periodosList = await Periods.aggregate([
      {
        '$match': {
          'startNum': {
            '$lte': fechaNum
          }
        }
      }, {
        '$sort': {
          'startNum': -1
        }
      }
    ]);
    const cargasList = await Cargas.aggregate([{
      '$match': {
        // 'authUserId': mongoose.Types.ObjectId(authUserId),
        'periodo.startNum': {'$lte': fechaNum},
        'entfed.cve': +cveEntFed,
        'org.cveStr': cveOrg,
      }
    }]);
    return {
      periodos: periodosList,
      cargas: cargasList
    };
  } catch (e) {
    console.log(e);
  }
  return null;
}

async function getCargasById(idPeriodo, authUserId, cveEntFed, orgCveStr) {
  try {
    console.log('getCargasById >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log(idPeriodo);
    console.log(authUserId);
    console.log(cveEntFed);
    const periodo = await Periods.findOne({yearWeek: idPeriodo});
    const carga = await Cargas.findOne({'periodo.yearWeek': idPeriodo, 'entfed.cve': +cveEntFed, 'org.cveStr': orgCveStr});
    console.log(carga);
    return {
      periodo: periodo,
      carga: carga
    };
  } catch (e) {
    console.log(e);
  }
  return null;
}


// ================================================================================================
// '/upsert-carga'
async function upsertCarga(cargaData) {
  try {
    const dbCarga = await Cargas.findOne({
      'entfed.cve': cargaData.entfed.cve,
      'periodo.yearWeek': cargaData.periodo.yearWeek,
      'org.cveStr': cargaData.org.cveStr,
    });

    if (!_.isNil(dbCarga)) {
      dbCarga.authUserId = cargaData.authUserId;
      dbCarga.fechaCarga = cargaData.fechaCarga;
      dbCarga.nomArchivoOrg = cargaData.nomArchivoOrg;
      dbCarga.intentos = cargaData.intentos;
      dbCarga.estatus = cargaData.estatus;
      dbCarga.genFileName = cargaData.genFileName;
      dbCarga.fileId = cargaData.fileId;
      dbCarga.periodo = cargaData.periodo;
      dbCarga.isActive = cargaData.isActive;
      dbCarga.entfed = cargaData.entfed;
      dbCarga.org = cargaData.org;

      if (!_.isNil(cargaData.proceso)) {
        dbCarga.proceso = cargaData.proceso;
      }
      cargaData = dbCarga;
    }

    cargaData._id = _.get(cargaData, '_id', mongoose.Types.ObjectId());
    cargaData._id = _.isNil(cargaData._id) ? mongoose.Types.ObjectId() : cargaData._id;
    cargaData.isActive = _.get(cargaData, 'isActive', true);

    const res = await Cargas.findOneAndUpdate({_id: cargaData._id}, cargaData, {
      new: true,
      upsert: true // Make this update into an upsert
    });
    return res;
  } catch (e) {
    console.log('CARGAS.CTRL --> upsertCarga = = = = = = = = = = = = = = = = = = = = = = = = = = =');
    console.log(e);
  }
  return null;
}


// ================================================================================================
//  {
//    fileId: string; nombre del archivo
//    registros: number; // registros cargados
//    calificacion: number; // calificacion general
//    suministro: number;
//    oportunidad: number;
//    integridad: number;
//    fechaFin: Date; // Fecha de fin del proceso
//  }

async function updateProceso(data) {
  try {
    const res = await Cargas.findOne({fileId: data.fileId});
    res.proceso = {
      registros: data.registros,
      calificacion: data.calificacion,
      suministro: data.suministro,
      oportunidad: data.oportunidad,
      integridad: data.integridad,
      fechaFin: data.fechaFin,
    };
    res.estatus = 'finalizado';
    await res.save();
    return res._id;
  } catch (e) {
    console.log('CARGAS.CTRL --> upsertCarga = = = = = = = = = = = = = = = = = = = = = = = = = = =');
    console.log(e);
    throw e;
  }
  return null;
}

async function updateWSCarga(data) {
  try {
    // Buscar por periodo y por entidad
    let res = await Cargas.findOne({
      'periodo.yearWeek': data.yearWeek,
      'entfed.cve': data.entfed,
      'org.cveStr': data.orgCveStr,
    });

    // Obtener el dato de entidad federativa
    console.log(data);
    const entidad = await EntidadesModel.findOne({cveStr: data.entfed});
    console.log(entidad);

    // Si es vacio, crear dato
    if (_.isNil(res)) {
      const periodo = await Periods.findOne({
        yearWeek: data.yearWeek,
      });

      res = {
        estatus: 'pendiente',
        periodo: periodo,
        entfed: entidad,
        isActive: true,
      };
    }

    res.wscarga = {
      registros: data.registros,
      calificacion: data.calificacion,
      suministro: data.suministro,
      oportunidad: data.oportunidad,
      integridad: data.integridad,
      fechaFin: data.fechaFin,
      numprocs: _.get(res, 'wscarga.numprocs', 0) + 1,
      stat: data.stat,
      comprobante: data.comprobante,
    };

    const insertRes = await Cargas.findOneAndUpdate(
      {
        'periodo.yearWeek': data.yearWeek,
        'entfed.cve': entidad.cve,
        'org.cveStr': data.orgCveStr,
      },
      res,
      {
        new: true,
        upsert: true // Make this update into an upsert
    });

    return insertRes._id;
  } catch (e) {
    console.log('CARGAS.CTRL --> updateWSCarga = = = = = = = = = = = = = = = = = = = = = = = = = = =');
    console.log(e);
    throw e;
  }
}

async function getPeriodByYear(year) {
  try {
    const periods = await Periods.find({year: year});
    return periods;
  } catch (e) {
    throw e;
  }
}


// DATA PUEDE SER UN ARREGLO
// ERRORS
const errors_wscarga = {
  dataEmpty: 'DataEmpty',
  invalidUser: 'InvalidUser',
  maxQuotaReached: 'MaxQuotaReached',
  missingRequiredField: 'MissingRequiredField',
  errorOnData: 'ErrorOnData',
  unknownError: 'UnknownError',
};
async function wscarga(data, idAuthId, ipCarga) {
  console.log('wscarga > > > > > > > > > > > > > > > > > > > > > > > >');
  let numItem = 0;

  console.log(idAuthId);
  const fechaCarga = new Date();
  const wscargaInfo = {
    clientId: idAuthId,
    fechaCarga: fechaCarga,
    ipCarga: ipCarga,
    registros: 0,
    estatus: 0,
    fechaFin: fechaCarga,
    entFed: null,
    periodoCarga: null,
  };
  const dbWscargaInfo = new WSCargaInfo(wscargaInfo);
  await dbWscargaInfo.save();

  // Obtener información del usuario
  const userData = await Usuario.findOne({"authInfo.clientId": idAuthId, 'authInfo.tipo': 'unattended'});
  if (_.isNil(userData)) {
    throw new Error('AccountNotFound');
  }
  console.log(userData);
  dbWscargaInfo.entFed = userData.entFed;
  dbWscargaInfo.org = userData.org;

  try {
    if (_.isNil(data) || _.get(data, 'length', 0 ) <= 0) {
      dbWscargaInfo.estatus = 2;
      dbWscargaInfo.fechaFin = new Date();
      dbWscargaInfo.errorStrCode = errors_wscarga.dataEmpty;
      await dbWscargaInfo.save();
      throw new Error(errors_wscarga.dataEmpty);
    }

    if (data.length > process.env.MAX_ROWS_PER_CALL) {
      dbWscargaInfo.estatus = 2;
      dbWscargaInfo.fechaFin = new Date();
      dbWscargaInfo.errorStrCode = errors_wscarga.maxQuotaReached;
      await dbWscargaInfo.save();
      throw new Error(errors_wscarga.maxQuotaReached);
    }

    const newData = [];
    let periodoFechaCarga = await wscarga_getPeriodFromDate(fechaCarga);
    let logRequired = [];
    if (_.isNil(periodoFechaCarga)) {
      throw new Error('PeriodNotFound');
    }

    dbWscargaInfo.periodoCarga = periodoFechaCarga.yearWeek;

    const camposCompletos = [
      'TELEFONO',
      'COD_TIPO_TELEFONO',
      'COD_MEDIO',
      'MEDIO_OTRO',
      'COD_IDENTIDAD',
      'IDENTIDAD_OTRO',
      'COD_ENT',
      'COD_MUN',
      'COD_TIPO_EXTORSION',
      'TIPO_EXTORSION_OTRO',
      'DIA_EXTORSION',
      'MES_EXTORSION',
      'ANIO_EXTORSION',
      'HORA_EXTORSION',
      'MINUTO_EXTORSION',
      'RELATO_HECHOS',
      'EDAD',
      'COD_SEXO',
      'COD_BIEN_ENTREGADO',
      'BIEN_ENTREGADO_DES',
      'VALOR_BIEN',
      'BANCO',
      'NO_CUENTA',
      'COD_DENUNCIANTE',
      'COD_INSTITUCION',
      'FOLIO_INTERNO',
      'DIA_DENUNCIA',
      'MES_DENUNCIA',
      'ANIO_DENUNCIA',
      'HORA_DENUNCIA',
      'MINUTO_DENUNCIA'
    ];

    let insertData = {};
    for(let item of data) {
      insertData = {};
      logRequired = [];
      logRequired = wscarga_validateRequired(item);
      if (logRequired.length > 0) {
        dbWscargaInfo.estatus = 2;
        dbWscargaInfo.fechaFin = new Date();
        dbWscargaInfo.errorStrCode = errors_wscarga.missingRequiredField;
        await dbWscargaInfo.save();
        throw new AppError(
          'Faltan uno o varios campos obligatorios en la linea : ' + numItem.toString(),
          logRequired,
          errors_wscarga.missingRequiredField
        );
      }

      for(let i=0; i < camposCompletos.length; i++) {
        insertData[camposCompletos[i]] = _.get(item, camposCompletos[i], null);
      }

      newData.push(new WSCarga({
        clientId: idAuthId,
        usr: userData,
        periodo: periodoFechaCarga,
        fechaCarga: fechaCarga,
        d: insertData
      }));

      numItem = numItem + 1;
    }// end for

    try {
      await WSCarga.insertMany(newData);
    } catch (e) {
      dbWscargaInfo.estatus = 2;
      dbWscargaInfo.fechaFin = new Date();
      dbWscargaInfo.errorStrCode = errors_wscarga.errorOnData;
      dbWscargaInfo.registros = numItem;
      await dbWscargaInfo.save();
      throw new AppError(
        'Error al insertar en la base de datos',
        e,
        errors_wscarga.errorOnData
      );
    }

    dbWscargaInfo.estatus = 1;
    dbWscargaInfo.fechaFin = new Date();
    dbWscargaInfo.registros = numItem;
    await dbWscargaInfo.save();

    return dbWscargaInfo;
  } catch (e) {
    dbWscargaInfo.estatus = 2;
    dbWscargaInfo.fechaFin = new Date();
    dbWscargaInfo.errorStrCode = errors_wscarga.unknownError;
    // dbWscargaInfo.registros = numItem;
    await dbWscargaInfo.save();
    console.log('CARGAS.CTRL --> upsertCarga = = = = = = = = = = = = = = = = = = = = = = = = = = =');
    console.log(e);
    throw e;
  }
}


async function wscarga_getPeriodFromDate(fechaCarga) {
  let periodo = null;

  try {
    const periodos = await Periods.aggregate([
      {
        '$match': {
          '$and': [
            {
              'start': {
                '$lte': fechaCarga
              }
            },
            {
              'end': {
                '$gte': fechaCarga
              }
            }
          ]
        }
      },
    ]);

    periodo = periodos[0];
    return periodo;
  } catch (e) {
    console.log(e);
  }

  return periodo;
}

function wscarga_validateRequired(item) {
  let periodo = null;
  let log = [];

  const required = ['TELEFONO', 'COD_TIPO_TELEFONO', 'COD_MEDIO', 'COD_IDENTIDAD', 'COD_ENT', 'COD_MUN', 'COD_TIPO_EXTORSION', 'DIA_EXTORSION', 'MES_EXTORSION', 'ANIO_EXTORSION', 'HORA_EXTORSION', 'MINUTO_EXTORSION', 'RELATO_HECHOS', 'EDAD', 'COD_SEXO', 'COD_BIEN_ENTREGADO', 'COD_DENUNCIANTE', 'COD_INSTITUCION', 'FOLIO_INTERNO', 'DIA_DENUNCIA', 'MES_DENUNCIA', 'ANIO_DENUNCIA', 'HORA_DENUNCIA', 'MINUTO_DENUNCIA'];
  let tempVal = '';

  for(let i = 0; i < required.length; i++) {
    tempVal = required[i];

    if (_.isNil(item[tempVal])) {
      log.push('El campo obligatorio "' + tempVal + "] está vacio.");
    }
  }

  return log;
}

function createNewAppError(message, data, strCode, code, module) {
  return new AppError(message, data, strCode, code, module);
}

function newAppErrObj(obj) {
  const msg = _.get(obj, 'msg', null);
  const data = _.get(obj, 'data', null);
  const strCode = _.get(obj, 'strCode', null);
  const code = _.get(obj, 'code', null);
  const module = _.get(obj, 'module', null);
  return new AppError(msg, data, strCode, code, module);
}

function isInstanceOfAppError(dataObj) {
  return dataObj instanceof AppError;
}

async function getCurrentStatWSCarga(cveEntFed, yearWeek, orgCveStr) {
  try {
    console.log('getCurrentStatWSCarga > > > > > > > > > > > > > > > >');
    console.log(cveEntFed);
    console.log(yearWeek);
    const data = await WSCargaInfo.aggregate([
      {
        '$match': {
          "$and": [
            {"periodoCarga": {"$eq": yearWeek}},
            {"entFed.cve": {"$eq": +cveEntFed}},
            {"org.cveStr": {"$eq": orgCveStr}}
          ]
        }
      },
      {
        '$group': {
          '_id': {
            'entFed': '$entFed',
            'periodoCarga': '$periodoCarga'
          },
          'registros': {
            '$sum': '$registros'
          },
          'ultimaFechaCarga': {
            '$max': '$fechaCarga'
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'entFed': '$_id.entFed',
          'periodoCarga': '$_id.periodoCarga',
          'registros': '$registros',
          'ultimaFechaCarga': '$ultimaFechaCarga'
        }
      }
    ]);
    console.log(data);
    return data[0];
  } catch (e) {
    throw e;
  }
}


class AppError extends Error {
  constructor(message, data, strCode, code, module) {
    super(message);
    this.message = message;
    this.data = data;
    this.strCode = strCode;
    this.code = code;
    this.module = module;
  }
}



// const sendFile = (fiename, filePath, putURL) => {
//   let filename = "0109090004230920211743452020-522020122199.xlsx";
//   let filePath = `/sitepub/bnext-app/src/bnextapp/api/tmp/${filename}`;
//   let putURL = `http://hadoop:50070/webhdfs/v1/mnt/baseproduccion/${filename}?op=CREATE&overwrite=false`;
//   let tmpdata = fs.readFileSync(filePath, 'utf8') ;tmpdata

//   var options = {
//     method: 'put',
//     body: tmpdata,
//   };

//   request(putURL, options, function(err, httpResponse, body) {
//     console.log(httpResponse.statusCode);
//     // CÓDIGO 201 indica que si se cargó correctamente
//     // CÓDIGO 401 indica error. Suele pasar cuando override es false

//     if ( err ) {
//         console.log('err', err);
//     } else {
//         try {
//           console.log(body);
//           body = JSON.parse(body);
//         } catch(e) {
//           console.log(e);
//         }
//     }  
//   });
// };