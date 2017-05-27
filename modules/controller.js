var jsonObj = require("../models/excel.js");
var checkResult = require("../models/checkResult.js");
var setArgeement = require("../models/setArgeement.js");
var outlet = require("../models/outlet.js");
var sales = require("../models/sales.js");
var calcResult = require("../models/calcresult.js");
// var calcResultView = require("../models/calcresultView.js");
var calcresultJoin = require('../models/calcresultJoin.js');
var history = require('../models/history.js');

function uploadCheckResult(rse, fileName) {
    var checkResultDocs = jsonObj.ExcelToJson(fileName, "检查结果");
    checkResult.saveResult(checkResultDocs);
    rse.send("数据上传更新完成！");
}

function getCheckResultToExcel(req, res) {
    checkResult.getResultForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "检查结果" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}
////----argeement
function setArgeementSaveData(rse, fileName) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "协议配置");
    // console.log("docs1="+docs);
    setArgeement.saveData(docs);
    rse.send("数据上传更新完成！");
}

function setArgeementDataToExcel(req, res) {
    setArgeement.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "协议配置" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });
    })
}

function setArgeementgetData(req, res) {
    setArgeement.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function setArgeementgetGrid(req, res) {
    var docs = setArgeement.getGrid(function (docs) {
        // console.log(docs);
        res.render('setArgeement', { layout: null, params: docs });
    });
}
////----outlet
function outletSaveData(rse, fileName) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "客户资料");
    // console.log("docs1="+docs);
    outlet.saveData(docs);
    rse.send("数据上传更新完成！");
}

function outletDataToExcel(req, res) {
    outlet.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "客户资料" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

function outletGetData(req, res) {
    outlet.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function outletGetGrid(req, res) {
    outlet.getGrid(function (docs) {
        //console.log("d1=" + docs);
        res.render('outlet', { layout: null, params: docs });
    });
}

////----sales
function salesSaveData(rse, fileName) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "MM销量");
    // console.log("docs1="+docs);
    sales.saveData(docs);
    rse.send("数据上传更新完成！");
}

function salesDataToExcel(req, res) {
    sales.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "MM销量" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

function salesGetData(req, res) {
    sales.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function salesGetGrid(req, res) {
    sales.getGrid(function (docs) {
        //console.log("d1=" + docs);
        res.render('sales', { layout: null, params: docs });
    });
}

////----calcResult
function calcResultSaveData(rse, fileName) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "MM销量");
    // console.log("docs1="+docs);
    calcResult.saveData(docs);
    rse.send("数据上传更新完成！");
}

function calcResultDataToExcel(req, res) {
    calcResult.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "MM销量" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

function calcResultGetData(req, res) {
    calcResult.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function calcResultGetGrid(req, res) {
    calcResult.getGrid(function (docs, docs2) {
        //console.log("d1=" + docs);
        res.render('calcResult', { layout: null, params: docs, params2: docs2 });
    });
}

function getCalcResultView(req, res) {
    // CalcresultJoin = new calcresultJoin({});
    calcresultJoin.getCalcResult(req, res, function (outlets) {
        res.send(outlets);
    });
}
function saveNonKaVersion(req, res) {
    // CalcresultJoin = new calcresultJoin({});
    calcresultJoin.saveNonKaVersion(req, res, function (msg) {
        res.send(msg);
    });
}
function checkVersion(req, res) {
    calcresultJoin.checkVersion(req, res, function (msg) {
        res.send(msg);
    });
}
///======================================
function versionsDataToExcel(req, res) {
    history.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "MM销量" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

function versionsGetData(req, res) {
    history.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function versionsGetGrid(req, res) {
    history.getGrid(function (result,result2,result3) {
        // console.log("d1=" + result);
        // console.log("d2=" + result2);
        res.render('history', { layout: null, params: result,paramsv1:result2,paramsv2: result3});
    });
}

function versionsGetHistory(req, res) {
     history.getDataHistory(req, res, function (docs) {
        res.send(docs);
    });
}

//// methods-----------------
var methods = {
    'uploadCheckResult': uploadCheckResult,
    'getCheckResultToExcel': getCheckResultToExcel,
    'setArgeementSaveData': setArgeementSaveData,
    'setArgeementDataToExcel': setArgeementDataToExcel,
    'setArgeementgetData': setArgeementgetData,
    'setArgeementgetGrid': setArgeementgetGrid,
    'outletSaveData': outletSaveData,
    'outletDataToExcel': outletDataToExcel,
    'outletGetData': outletGetData,
    'outletGetGrid': outletGetGrid,
    'salesSaveData': salesSaveData,
    'salesDataToExcel': salesDataToExcel,
    'salesGetData': salesGetData,
    'salesGetGrid': salesGetGrid,
    'calcResultSaveData': calcResultSaveData,
    'calcResultDataToExcel': calcResultDataToExcel,
    'calcResultGetData': calcResultGetData,
    'calcResultGetGrid': calcResultGetGrid,
    'getCalcResultView': getCalcResultView,
    'saveNonKaVersion': saveNonKaVersion,
    'checkVersion': checkVersion,
    'versionsDataToExcel': versionsDataToExcel,
    'versionsGetData': versionsGetData,
    'versionsGetGrid': versionsGetGrid,
    'versionsGetHistory':versionsGetHistory,
};

module.exports = methods;