const { fstat } = require('fs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { has } = require('lodash');

const createDiskStorage = path2 => multer.diskStorage({
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

const createExcelFileFilter = () => (req, file, cb) => {
    console.log("createExcleFileFilter (2)");
    if (!file.originalname.match(/\.(xls|xlsx|xlb)$/)) {
        console.log("createExcleFileFilter (2)");
        const msg = 'Only valid Excel files!';
        req.fileValidationError = msg;
        return cb(new Error(msg), false);
    }
    cb(null, true);
};

const validateFileUpload = (req, err) => {
    let hasError = false;
    let result = {
        hasError: false,
        fileName: "",
    };    

    try {
        if (req.fileValidationError) {
            hasError = true;
        }
        else if (!req.file) {
            hasError = true;
        }
        else if (err instanceof multer.MulterError) {
            hasError = true;
        }

        let tmpFileName = req.file.path;
        console.log(" * * * * * * * * * * * * * * * * * * *");
        console.log(tmpFileName);
        let tmparr = tmpFileName.split('/');
        console.log(tmparr[tmparr.length - 1]);
        result.fileName = tmparr[tmparr.length - 1];
        console.log(" * * * * * * * * * * * * * * * * * * *");
    } catch (e) {
        hasError = true;
        console.log("Error: validateFileUpload(1)");
        console.log(e);
    }

    result.hasError = hasError;
    return result;
};

const createMulterExcel = () => multer({ storage: createDiskStorage("./tmp"), fileFilter: createExcelFileFilter() });

const removeFile = (fileName, filePath) => {
    return new Promise(function(resolve, reject) {
        console.log("removeFile (1) - - - - - - - - - - - - - - -");
        let result = {
            hasError: false,
        };
        let fileNameAndPath = path.join(filePath, fileName);
        console.log(fileNameAndPath);
        fs.unlink(fileNameAndPath, err => {
            console.log("removeFile (2) - - - - - - - - - - - - - - -");
            if (err) {
                console.log("removeFile (3) - - - - - - - - - - - - - - -");
                console.log(err);
                result.hasError = true;
            }

            console.log("removeFile (4) - - - - - - - - - - - - - - -");
            resolve(result);
        });
    });
};





module.exports = {
    createExcelFileFilter: createMulterExcel,
    validateFileUpload: validateFileUpload,
    removeFile: removeFile,
};