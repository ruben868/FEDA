const Promise = require('promise');
const fs = require('fs');
const request = require('request');
const WebHDFS = require('webhdfs');
// const { all } = require('../routes/cargas.route');

const dotenv = require('dotenv');
dotenv.config();

// VARIABLES
const WEBHDFS_HOSTNAME = process.env.WEBHDFS_HOSTNAME;
const WEBHDFS_PORT = process.env.WEBHDFS_PORT;
const WEBHDFS_ROOTPATH = process.env.WEBHDFS_ROOTPATH;
const WEBHDFS_INPUTFILESPATH = process.env.WEBHDFS_INPUTFILESPATH;
const WEBHDFS_VOUCHERS_URL = process.env.WEBHDFS_VOUCHERS_URL;
const UPLOADEXTFILESPROC_LOCALTMPPATH = process.env.UPLOADEXTFILESPROC_LOCALTMPPATH;


const sendFile = (fileName) => {
    let promise = new Promise(function(resolve, reject) {
        // console.log("sendFile (1) - - - - - - - - - - - -");
        // let result = {
        //     hasError: false,
        //     statusCode: 200,
        //     errMsg: ""
        // };

        // let fileNameWithPath = `${filePath}/${fileName}`;
        // console.log("sendFile (2) - - - - - - - - - - - -");
        // console.log(fileNameWithPath);
        // let tmpdata = fs.readFileSync(fileNameWithPath, 'utf8');
        // let options = {
        //     method: 'put',
        //     body: tmpdata,
        // };

        // request(hdfsURL, options, function(err, httpResponse, body) {
        //     console.log("sendFile (3) - - - - - - - - - - - -");
        //     // console.log(httpResponse.statusCode);
        //     // CÓDIGO 201 indica que si se cargó correctamente
        //     // CÓDIGO 401 indica error. Suele pasar cuando override es false
      
        //     if ( err ) {
        //         console.log("sendFile (4) - - - - - - - - - - - -");
        //         console.log('err', err);
        //         result.hasError = true;
        //         result.statusCode = 401;
        //         result.errMsg = err.toString();
        //     } else {
        //         console.log("sendFile (5) - - - - - - - - - - - -");
        //         try {
        //           if (httpResponse.statusCode !== 201 && httpResponse.statusCode !== 200) {
        //             console.log("sendFile (6) - - - - - - - - - - - -");
        //               result.statusCode = httpResponse.statusCode;
        //               result.hasError = true;
        //           }
        //           console.log(body);
        //           // body = JSON.parse(body);
        //         } catch(e) {
        //           console.log("sendFile (7) - - - - - - - - - - - -");
        //           console.log(e);
        //         }
        //     }
            
        //     resolve(result);
        // });

        console.log(WEBHDFS_HOSTNAME);

        let result = {
            hasError: false,
            statusCode: 200,
            errMsg: ""
        };

        let hdfs = WebHDFS.createClient(
            {
                host: WEBHDFS_HOSTNAME,
                port: WEBHDFS_PORT,
                path: WEBHDFS_ROOTPATH
            }
        );
    
        let localPath = UPLOADEXTFILESPROC_LOCALTMPPATH; //"/sitepub/bnext-app/src/bnextapp/api/tmp";
        let remotePath = WEBHDFS_INPUTFILESPATH; //"mnt/baseproduccion";
        let filename = fileName;
    
        let localFileStream = fs.createReadStream(`${localPath}/${filename}`);
        let remoteFS = hdfs.createWriteStream(`${remotePath}/${filename}`);
        
        localFileStream.pipe(remoteFS);
    
        remoteFS.on('error', function onError (err) {
            console.log("ERROR EN EL ENVÍO DEL ARCHIVO A HDFS");
            console.log(err);
            result.hasError = true;
            result.statusCode = 580;
            resolve(result);
        });
          
        remoteFS.on('finish', function onFinish () {
            console.log("FISHIESDFASDFASDFSADFASDF");
            resolve(result);
        });
    }); 
    return promise;
}

const triggerJob = (jobId, hdfsJobURLWithPlaceHolders) => {
    let result = {
        hasError: false,
        httpCode: 200,
        errMsg: "",
    };

    let promise = new Promise(function(resolve, reject) {
        let regex = new RegExp(escapeRegExp('$jobId'), 'g');
        let consumeUrl = hdfsJobURLWithPlaceHolders.replace(regex, jobId);
        let options = {
            method: 'post'
        };

        request(consumeUrl, options, function(err, httpResponse, body) {
            console.log('body');
            console.log(body);
            if (err) {
                result.hasError = true;
                result.statusCode = 400;
            }

            resolve(result);
        });
    });
    return promise;
};

function downloadVoucher (fileName, res) {
    console.log(`[downloadVoucher] - INICIO`);

    let result = {
        hasError: false,
        httpCode: 200,
        errMsg: "",
        data: {},
    };

    try {
        let hdfs = WebHDFS.createClient(
            {
                host: WEBHDFS_HOSTNAME,
                port: WEBHDFS_PORT,
                path: WEBHDFS_ROOTPATH
            }
        );

        let remoteFileStream = hdfs.createReadStream(WEBHDFS_VOUCHERS_URL + fileName);

        remoteFileStream.on('error', (data) => {
            result.hasError = true;
            result.httpCode = 520;

            console.log(`[downloadVoucher] - ERROR - ${result.httpCode}`);
            console.log(`[downloadVoucher] - ERROR:MSG - ${data.toString()}`);
            // res.status(result.httpCode).send(result.data);  
            res.status(result.httpCode).send(result.data);
        });

        remoteFileStream.on('data', (data) => {
            res.write(data);
        });

        remoteFileStream.on('finish', (data) => {
            console.log(`[downloadVoucher] - FINISH - ${result.httpCode}`);
            // res.write(data);
            // res.status(result.httpCode).send(result.data); 
            res.end();
        });

    } catch(e) {
        result.hasError = true;
        result.httpCode = 530;
        console.log(`[downloadVoucher] - ERROR - ${result.httpCode}`);
        console.log(`[downloadVoucher] - ERROR:MSG=${e.toString()}`);
        res.status(result.httpCode).send(result.data);
    }

    return;
}

function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

//curl -XPOST "http://hadoop:8090/api/notebook/job/2G4C75VQE"

module.exports = {
    sendFile: sendFile,
    triggerJob: triggerJob,
    downloadVoucher: downloadVoucher,
};


// git fetch --all; git reset --hard; git merge '@{u}'