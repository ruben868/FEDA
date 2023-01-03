const dotenv = require('dotenv');
dotenv.config();
const _ = require('lodash');
const request = require('request');
// const mongoose = require('mongoose');
const HdfsCtrl = require('./hdfs.ctrl');
const BrickJobs = require('../models/brick-jobs.model');

const HADOOP_NOTEBOOK_URL = process.env.HADOOP_NOTEBOOK_URL;

module.exports = {
    getNotebookStatus:getNotebookStatus,
    deamonExtorsionesFiles:deamonExtorsionesFiles,
};


/**
 * Función Wrapper que ejecuta la llamada al servicio para obtener estatus de un job en particular de Apache Zeppelin
 * @param {string} jobId Identificador del notebook
 * @returns {[objeto]} Misma estructura que la función wsCall_getNotebookStatus
 */
async function getNotebookStatus(jobId) {
    let res = await wsCall_getNotebookStatus(jobId);

    console.log("wsCall_getNotebookStatus REUSLT* * * * * * * * * * * ");
    console.log(res);

    try {
        if (res.data.isRunning) {
            console.log("JOB IS RUNNING!!!");
        } else {
            console.log("JOB IS NOT RUNNING!!!");
        }
    } catch (e) {
        console.log("ERROR!!!");
        console.log(e);
    }
    

    return res;
}


/**
 * Ejecuta llamada a la api de Zeppelin para obtener el estatus de un job (notebook) en particular.
 * @param {string} jobId Identificador del notebook
 * @returns {
 *      hasError    {boolean}   Indica si hay error o no
 *      httpCode    {number}    Código http, en caso de que se ocupe para un response
 *      errMsg      {string}    Mensaje de error (en caso de existir)
 *      data        {object}    Objeto que retorna el estatus del job. El atributo bandera isRunning indica si el job en general esta corriendo o se encuentra detenido.
 * } retorna 
 */
function wsCall_getNotebookStatus(jobId) {
    let promise = new Promise(function(resolve, reject) {
        let result = {
            hasError: false,
            httpCode: 200,
            errMsg: "",
            data: null,
        };

        let regex = new RegExp(escapeRegExp('$jobId'), 'g');
        let consumeUrl = HADOOP_NOTEBOOK_URL.replace(regex, jobId);

        let options = {
            method: 'get'
        };

        request(consumeUrl, options, function(err, httpResponse, body) {
            console.log('body: (ini) - - - - - - - - - - ');
            console.log(body);
            console.log(typeof body);
            console.log('body: (end) - - - - - - - - - - ');

            try {
                let tmpObj = JSON.parse(body);
                result.data = tmpObj.body;
            } catch (e) {
                console.log("ERROR ON JSON PARSING");
                console.log(e);
            }
            
            
            if (err) {
                result.hasError = true;
                result.statusCode = 400;
            }

            resolve(result);
        });
    });

    return promise;    
}

function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


async function deamonExtorsionesFiles() {
    // ID DEL JOB
    const rfjStat = {
        stat: false,
        run_id: null,
        msg: null,
        error: null,
        msgId: 0,
    };
    
    try {
        let jobId = process.env.HADOOP_NOTEBOOK_ID;
        let url = process.env.HADOOP_NOTEBOOK_URL;

        console.log('(1) - - - - - - - - - - - - - - - ');
        const seekJob = await BrickJobs.aggregate([
            {
                '$match': {
                    'stat': 'pending'
                }
            }, {
                '$sort': {
                    'created': 1
                }
            }
        ]);

        let curJob = seekJob[0];

        if (_.isNil(curJob)) {
            console.log('(2) - - - - - - - - - - - - - - - ');
            rfjStat.msg = 'No se encontraron tareas por ejecutar.';
            rfjStat.msgId = 1;
            return rfjStat;
        }

        // Validar estatus del job
        const jobStatus = await getNotebookStatus(jobId);
        console.log(jobStatus);

        console.log('(3) - - - - - - - - - - - - - - - ');

        // Existe un job en ejecución
        if (jobStatus.data.isRunning) {
            console.log('(4) - - - - - - - - - - - - - - - ');
            rfjStat.msg = 'Existe un job ya en ejecución';
            rfjStat.msgId = 2;
            return rfjStat;
        }

        // Ejecutar job
        if (!jobStatus.data.isRunning) {
            console.log('(5) - - - - - - - - - - - - - - - ');
            // Correr job
            const runJobStat = await HdfsCtrl.triggerJob(jobId, url);
            
            curJob.stat = 'triggered';
            curJob.modified = new Date();
            curJob.runId = -1;

            // Guardar
            const res = await BrickJobs.findOneAndUpdate({_id: curJob._id}, curJob, {
                new: true,
                upsert: true // Make this update into an upsert
            });

            rfjStat.stat = true;
            rfjStat.msg = 'Se ejecutó un job.';
            rfjStat.msgId = 4;
            rfjStat.run_id = curJob.runId;

            return rfjStat;
        }

    } catch (e) {
        console.log('(6) - - - - - - - - - - - - - - - ');
        rfjStat.stat = false;
        rfjStat.error = e;
        rfjStat.msg = 'Error inesperado';
        rfjStat.msgId = 5;
    }
      
    console.log('runFirstJob >>>>>>>>>>>>');
    console.log(rfjStat);
    return rfjStat;
}