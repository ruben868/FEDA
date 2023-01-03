// Common = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const _ = require('lodash');
// const got = require('got');
const dotenv = require('dotenv');
dotenv.config();
// const FormData = require('form-data');
const queryString = require('query-string');
const axios = require('axios');
const ADLS = require("@azure/storage-file-datalake");


module.exports = {
  getDataLakeToken: getDataLakeToken,
  GetDataLakeServiceClient: GetDataLakeServiceClient,
  GetFile: GetFile,
  streamToRead: streamToRead,
};


async function getDataLakeToken() {
  const headers = {
    "Content-type": "application/x-www-form-urlencoded"
  };
  // const form = new FormData();
  // form.append('client_id', process.env.ADL_CLIENT_ID);
  // form.append('client_secret', process.env.ADL_CLIENT_SECRET);
  // form.append('scope', process.env.ADL_SCOPE);
  // form.append('grant_type', 'client_credentials');

  const postData = {
    'client_id': process.env.ADL_CLIENT_ID,
    'client_secret': process.env.ADL_CLIENT_SECRET,
    'scope': process.env.ADL_SCOPE,
    'grant_type': 'client_credentials',
  };
  const url = 'https://login.microsoftonline.com/' + process.env.ADL_TENANT_NAME + '/oauth2/v2.0/token';

  try {

    console.log('(1)');
    console.log(url);
    // const response = await got.post(url, {
    //   headers: headers,
    //   body: form,
    //   retry: 0,
    // }).json();
    const response = await axios({
      method: 'post',
      url: url,
      data: queryString.stringify(postData),
      headers: headers
    });
    console.log('(2)');
    console.log(response);
    console.log('(3)');
    console.log(response.data.access_token);
    const token  = _.get(response, 'data.access_token', null);

    if (_.isNil(token)) {
      throw new Error('NoTokenFound');
    }
    return token;
  } catch (e) {
    // ERROR
    console.log('ERROR - getDataLakeToken = = = = = = = = = = = = = =');
    console.log(e);
    // const response = _.get(e, 'response.request', null);
    // console.log(response);
  }
}


function GetDataLakeServiceClient() {

  const sharedKeyCredential =
    new ADLS.StorageSharedKeyCredential(process.env.ADL_STORAGE_ACCOUNT, process.env.ADL_ACCOUNT_KEY);

  const datalakeServiceClient = new ADLS.DataLakeServiceClient(
    `https://${process.env.ADL_STORAGE_ACCOUNT}.dfs.core.windows.net`, sharedKeyCredential);

  return datalakeServiceClient;
}

async function GetFile(datalakeServiceClient, fileSystem, fileName) {
  console.log('GetFile (1)');
  const fileSystemName = fileSystem;//"iphmov";
  const fileSystemClient = datalakeServiceClient.getFileSystemClient(fileSystemName);

  console.log('GetFile (2)');
  const fileClient = fileSystemClient.getFileClient(fileName);
  const downloadResponse = await fileClient.read();

  console.log('GetFile (3)');
  return downloadResponse;
}

async function streamToRead(readableStream, res) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      // console.log("DATA = = = = = = = = = = = = = = = = =");
      res.write(data);
    });
    readableStream.on("end", () => {
      // console.log("END = = = =  = = = = = = = = = = = = ");
      res.end();
    });
    readableStream.on("error", reject);
  });
}
