
const dotenv = require('dotenv');
dotenv.config();

const expect = require('chai').expect;


const hdfsCtrl = require('./hdfs.ctrl');

describe('HDFS Controller Test', function () {
    this.timeout(90000);
    // it('should load file to hdfs', async () => {
    //     let filename = "0109090004230920211725302020-522020122199.xlsx";
    //     let filePath = `/sitepub/bnext-app/src/bnextapp/api/tmp`;
    //     let putURL = `http://hadoop:50070/webhdfs/v1/mnt/baseproduccion/${filename}?op=CREATE&overwrite=false`;

    //     let result = await hdfsCtrl.sendFile(filename, filePath, putURL);

    //     console.log(result);

    //     expect(result.hasError).to.be.equal(false);
    // });

    it('should trigger spark job', async () => {
        let jobId = "2G4C75VQE";
        let hdfsJobUrl = "http://hadoop:8090/api/notebook/job/$jobId";

        let result = await hdfsCtrl.triggerJob(jobId, hdfsJobUrl);
        console.log("[TEST] * * * * * * *  * * *");
        console.log(result);
        console.log("[TEST] * * * * * * *  * * *");

        expect(result.hasError).to.be.equal(false);
    });


    it('should load file with webhdfs library (test02)', async() => {
        //ARRANGE
        const fileName = "prueba-02.xlsx";

        //ACT
        let result = await hdfsCtrl.sendFile(fileName);

        //ARRANGE
        expect(result.hasError).to.be.equal(false);
    });
});


