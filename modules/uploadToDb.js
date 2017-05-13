var jsonObj = require("../models/excel.js");
var checkResult = require("../models/checkResult.js");

function uploadCheckResult(rse,fileName){
    var checkResultDocs = jsonObj(fileName);
    checkResult.saveResult(checkResultDocs);
    rse.send(checkResultDocs);
}
var methods={'uploadCheckResult':uploadCheckResult};
module.exports=methods;