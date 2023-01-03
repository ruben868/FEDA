const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
const mongoose = require('mongoose');
const _ = require('lodash');

module.exports = {
  getStat: getStat,
  startCluster: startCluster,
  isJobRunning: isJobRunning,
  registerJob: registerJob,
  runJob: runJob,
  runFirstJob: runFirstJob
};

const BrickJobs = require('../models/brick-jobs.model');

// Get Estatus
// RETURN:
// string
async function getStat() {
  const url = process.env.BRICKS_BASE_URL_API
    + 'clusters/get?cluster_id='
    + process.env.BRICKS_CLUSTER_ID
  ;
  const token = process.env.BRICKS_TOKEN;

  try {
    // console.log(url);
    // console.log(token);
    const headers = {
      "Authorization": "Bearer " + token
    };
    const response = await axios({
      method: 'get',
      url: url,
      headers: headers
    });
    return response.data.state;
  } catch (e) {
    console.log('databricks.ctrl --> getStat : ERROR ######################');
    console.log(e);
    console.log('databricks.ctrl --> getStat : ERROR ######################');
    throw e;
  }
}


// Start cluster
// RETURN
// boolean
async function startCluster() {
  let isSuccess = true;
  const url = process.env.BRICKS_BASE_URL_API
    + 'clusters/start'
  ;
  const token = process.env.BRICKS_TOKEN;

  try {
    const res = await getStat();

    if (res === 'TERMINATED') {
      const headers = {
        "Authorization": "Bearer " + token
      };
      const data = {
        cluster_id: process.env.BRICKS_CLUSTER_ID
      };
      const response = await axios.post(url, data, {headers: headers});
      console.log(response.data);
    }
  } catch (e) {
    console.log(e);
    isSuccess = false;
  }

  return isSuccess;
}


// Run job
// RETURN :
// {
//    stat: boolean;
//    runId: string;
// }
async function runJob() {
  let runJobResult = {
    stat: false,
    runId: null
  };
  // let isSuccess = false;
  const url = process.env.BRICKS_BASE_URL_API
    + 'jobs/run-now'
  ;
  const token = process.env.BRICKS_TOKEN;

  try {
    const clusterStat = await getStat();

    if (clusterStat === 'TERMINATED') {
      await startCluster();
    } else if (clusterStat === 'RUNNING') {
      const jobRunning = await isJobRunning();

      if (!jobRunning) {
        // TODO: Ejecutar jobs
        const headers = {
          "Authorization": "Bearer " + token
        };
        const data = {
          job_id: process.env.BRICKS_EXT_JOB_ID
        };
        const response = await axios.post(url, data, {headers: headers});
        console.log(response.data);
        runJobResult.stat = true;
        runJobResult.runId = response.data.run_id;
      }
    }
  } catch (e) {
    console.log(e);
    runJobResult.stat = false;
  }

  return runJobResult;
}





// Get running jobs
// RETURN :
// boolean
//  true: job está corriendo
//  false: job no está corriendo
async function isJobRunning() {
  let jobRuning = true;
  const url = process.env.BRICKS_BASE_URL_API
    + 'jobs/runs/list?job_id=' + process.env.BRICKS_EXT_JOB_ID + '&active_only=true'
  ;
  const token = process.env.BRICKS_TOKEN;

  try {
    const headers = {
      "Authorization": "Bearer " + token
    };
    const response = await axios({
      method: 'get',
      url: url,
      headers: headers
    });
    // console.log(response.data);
    const jobsRunning = _.get(response.data, 'runs', []);
    if (jobsRunning.length <= 0) {
      jobRuning = false;
    }
  } catch (e) {
    console.log('isJobRunning >>>> ERROR ##########');
    console.log(e);
  }

  return jobRuning;
}


async function registerJob(cargaId) {
  let stat = false;
  try {
    let pendingJob = {
      _id: mongoose.Types.ObjectId(),
      cargaId: [],
      created: new Date(),
      modified: new Date(),
      stat: 'pending',
      jobId: null,
    };
    // Obtener si existen tareas pendientes
    const seekJob = await BrickJobs.aggregate(
      [
        {
          '$match': {
            'stat': 'pending'
          }
        }, {
        '$sort': {
          'created': -1
        }
      }
      ]
    );

    if (!_.isNil(seekJob) && seekJob.length > 0) {
      // Se añade en el job actual
      pendingJob = seekJob[0];
      // pendingJob.cargaId = (_.isNil(pendingJob.cargaId), [], pendingJob.cargaId);
      pendingJob.modified = new Date();
    }

    // Añadir el id de la carga
    pendingJob.cargaId.push(cargaId);

    // actualizar en la bd
    const res = await BrickJobs.findOneAndUpdate({_id: pendingJob._id}, pendingJob, {
      new: true,
      upsert: true // Make this update into an upsert
    });

    stat = true;
  } catch (e) {
      stat = false;
  }

  return stat;
}


// RETURN:
// {
//    stat: boolean;
//    run_id: string;
//    msg: string;
//    error: object;
// }
async function runFirstJob() {
  const rfjStat = {
    stat: false,
    run_id: null,
    msg: null,
    error: null,
    msgId: 0,
  };

  try {
    const seekJob = await BrickJobs.aggregate(
      [
        {
          '$match': {
            'stat': 'pending'
          }
        }, {
        '$sort': {
          'created': 1
        }
      }
      ]
    );

    let curJob = seekJob[0];
    if (_.isNil(curJob)) {
      rfjStat.msg = 'No se encontraron tareas por ejecutar.';
      rfjStat.msgId = 1;
    } else {
      // Correr job
      const runJobStat = await runJob();

      if (!_.isNil(runJobStat)) {
        if (runJobStat.stat) {
          curJob.stat = 'triggered';
          curJob.modified = new Date();
          curJob.runId = runJobStat.runId;

          // Guardar
          const res = await BrickJobs.findOneAndUpdate({_id: curJob._id}, curJob, {
            new: true,
            upsert: true // Make this update into an upsert
          });

          rfjStat.stat = true;
          rfjStat.msg = 'Se ejecutó un job.';
          rfjStat.msgId = 4;
          rfjStat.run_id = curJob.runId;
        } else {
          rfjStat.msg = 'No se ejecutó job alguno.';
          rfjStat.msgId = 2;
        }
      } else {
        rfjStat.msg = 'No se ejecutó job alguno.';
        rfjStat.msgId = 3;
      }
    }
  } catch (e) {
    rfjStat.stat = false;
    rfjStat.error = e;
    rfjStat.msg = 'Error inesperado';
    rfjStat.msgId = 5;
  }
  console.log('runFirstJob >>>>>>>>>>>>');
  console.log(rfjStat);
  return rfjStat;
}


function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}