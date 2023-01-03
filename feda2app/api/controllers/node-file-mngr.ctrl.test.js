const expect = require('chai').expect;

const nodeFileMngr = require('./node-file-mngr.ctrl');

describe('Node File Manager Test', function () {
    // it('should remove file', async () => {
    //     // let fileName = "0109090004240920211509032020-522020122199.xlsx";
    //     let fileName = "0109090004240920211508082020-522020122199.xlsx";
    //     let filePath = "./tmp";

    //     let result = await nodeFileMngr.removeFile(fileName, filePath);

    //     console.log(result);

    //     expect(result.hasError).to.be.equal(false);
    // });

    it('should get file name from a path', () => {
        let file = "tmp/0109090004260920212136332020-522020122199.xlsx";
        let tmp = file.split("/");
        console.log(tmp[tmp.length - 1]);
    });
});