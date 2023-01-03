const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const nodeFileMngr = require("../controllers/node-file-mngr.ctrl");
const hdfsCtrl = require("../controllers/hdfs.ctrl");
const cargasCtrl = require("../controllers/cargas.ctrl");
const BrickJobs = require("../controllers/databricks.ctrl");


router.route('/upload-single').post([nodeFileMngr.createExcelFileFilter().single('uploadFile')], function (req, res, err) {
    processNewFile(req, res, err);
    // let response = {
    //     code: 200,
    //     msg: "Ok!",
    // };

    // let locUploadPath = "";
    // let locHdfsURL = "";
    
    // try {
    //     // 1) GUARDAR EL ARCHIVO EN EL SERVIDOR
    //     let resVFU = nodeFileMngr.validateFileUpload(req, res);
    //     if (resVFU.hasError) {
    //         // TODO: RETORNAR ERROR
    //         return;
    //     }

    //     // 2) ENVIAR A HDFS
    //     let resHdfs = await hdfsCtrl.sendFile(resVFU.fileName);
    //     if (resHdfs.hasError) {
    //         // TODO: RETORNAR ERROR
    //         return;
    //     }

    //     // 3) ELIMINAR ARCHIVO DEL SERVIDOR
    //     let resRemoveFile = await nodeFileMngr.removeFile(resVFU.fileName, locUploadPath);
    //     if (resRemoveFile.hasError) {
    //         // TODO: RETORNAR ERROR
    //         return;
    //     }
        
    //     // 4) DISPARAR JOB

    // } catch(e) {
    //     console.log(e);
    //     response.code = 401;
    //     response.msg = `Please, check error message: ${e.toString()}`;
    // }
    
    // res.status(response.code).send({msg: response.msg});
});

const processNewFile = async (req, res, err) => {
    let response = {
        hasError: false,
        code: 200,
        msg: "Ok!",
        procesoCarga: null,
    };

    let locUploadPath = "./tmp";
    let locHdfsURL = "";

    console.log(" * * * * *  * * * * * * * *");
    console.log(req.body.resultJSON);
    let tmp = JSON.parse(req.body.resultJSON);
    console.log(tmp);

    
    
    try {
        // 1) GUARDAR EL ARCHIVO EN EL SERVIDOR
        let resVFU = nodeFileMngr.validateFileUpload(req, res);
        if (resVFU.hasError) {
            // TODO: RETORNAR ERROR
            response.code = 401;
            response.hasError = true;
            response.msg = "Error (1);";
            res.status(response.code).send({msg: response.msg});
            return;
        }

        // 2) ENVIAR A HDFS
        let resHdfs = await hdfsCtrl.sendFile(resVFU.fileName);
        
        if (resHdfs.hasError) {
            // TODO: ELIMINAR EL ARCHIVO QUE SE CARGÓ
            response.code = 401;
            response.msg = "Error (2)";
            response.hasError = true;
            res.status(response.code).send({msg: response.msg});
            return;
        }

        // 3) ELIMINAR ARCHIVO DEL SERVIDOR
        let resRemoveFile = await nodeFileMngr.removeFile(resVFU.fileName, locUploadPath);
        if (resRemoveFile.hasError) {
            // TODO: RETORNAR ERROR
            response.code = 401;
            response.msg = "Error (3)";
            response.hasError = true;
            res.status(response.code).send({msg: response.msg});
            return;
        }
        
        // // 4) DISPARAR JOB
        // let jobId = process.env.HADOOP_NOTEBOOK_ID;//"2G4C75VQE";
        // let hdfsJobUrl = process.env.HADOOP_NOTEBOOK_URL; //"http://hadoop:8090/api/notebook/job/$jobId";
        // let triggerJobResult = await hdfsCtrl.triggerJob(jobId, hdfsJobUrl);
        // if (triggerJobResult.hasError) {
        //     response.code = 401;
        //     response.msg = "Error (4)";
        //     response.hasError = true;
        //     res.status(response.code).send({msg: response.msg});
        //     return;
        // }

        // // 5) GUGARDAR INFORMACION DE CARGA EN LA BBDD
        // // upsert carga
        // tmp.carga.estatus = 'cargando';
        // let upsertCargaResult = await cargasCtrl.upsertCarga(tmp.carga);
        // console.log(upsertCargaResult);
        // console.log(" * * * * *  * * * * * * * *");
        // tmp.carga = upsertCargaResult;
        // response.procesoCarga = tmp;

        
        // 4) GUARDAR INFORMACIÓN DEL ARCHIVO EN BBDD
        // upsert carga
        tmp.carga.estatus = 'cargando';
        let upsertCargaResult = await cargasCtrl.upsertCarga(tmp.carga);
        console.log(upsertCargaResult);
        console.log(" * * * * *  * * * * * * * *");
        tmp.carga = upsertCargaResult;
        response.procesoCarga = tmp;

        // 5) REGISTRAR TAREA DE JOB
        let registerJobResult = await BrickJobs.registerJob(upsertCargaResult._id);
    } catch(e) {
        console.log(e);
        response.code = 401;
        response.msg = `Please, check error message: ${e.toString()}`;
    }
    
    res.status(response.code).send(response);
};

// router.route('/upload-single').post(function (req, res) {
//     try {
//         console.log("INICIO (1)");
//         let ds = createDiskStorage('tmp/');
//         let upload = multer({ storage: ds, fileFilter: createExcleFileFilter }).single('uploadFile');

        
//         upload(req, res, function(err) {
//             console.log("INICIO (2)");
//             // req.file contains information of uploaded file
//             // req.body contains information of text fields, if there were any
    
//             if (req.fileValidationError) {
//                 console.log("INICIO (3)");
//                 return res.send(req.fileValidationError);
//             }
//             else if (!req.file) {
//                 console.log("INICIO (4)");
//                 return res.send('Please select an image to upload');
//             }
//             else if (err instanceof multer.MulterError) {
//                 console.log("INICIO (5)");
//                 return res.send(err);
//             }
//             else if (err) {
//                 console.log("INICIO (6)");
//                 return res.send(err);
//             }
    
//             console.log("INICIO (7)");
//             // Display uploaded image for user validation
//             res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
//         });
//     } catch(e) {
//         console.log(e);
//     }
// });



function createDiskStorage(path2) {
    return multer.diskStorage({
        destination: function(req, file, cb) {
            console.log("createDiskStorage (1)");
            cb(null, path2);
        },
    
        // By default, multer removes file extensions so let's add them back
        filename: function(req, file, cb) {
            console.log("createDiskStorage (2)");
            console.log(file);
            //cb(null, path.extname(file.originalname));
            cb(null, file.originalname);
        }
    });
}

function createExcleFileFilter() {
    console.log("createExcleFileFilter (1)");
    return (req, file, cb) => {
        console.log("createExcleFileFilter (2)");
        if (!file.originalname.match(/\.(xls|xlsx|xlb)$/)) {
            console.log("createExcleFileFilter (2)");
            const msg = 'Only valid Excel files!';
            req.fileValidationError = msg;
            return cb(new Error(msg), false);
        }
        cb(null, true);
    };
}

function createMulterExcel () {
    let ds = createDiskStorage('./tmp');
    let upload = multer({ storage: ds, fileFilter: createExcleFileFilter() });
    return upload;
}


module.exports = router;