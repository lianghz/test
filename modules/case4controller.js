var jsonObj = require("../models/excel.js");
var outlet = require("../models/case4/outlet.js");
var package = require("../models/case4/package.js");
var sales = require("../models/case4/sales.js");
var calcresultJoin = require('../models/case4/calcresultJoin.js');
var history = require('../models/case4/history.js');

///--------------------------------------------------------
///上传检查结果excel文件，把excel转JSON，把JSON保存到mongodb
function checkResultSave(rse, fileName, fields) {
    var checkResultDocs = jsonObj.ExcelToJson(fileName, "督导抽查结果");
    var cbrm = fields.cbrm;
    if (cbrm == 'on') {
        checkResult.removeSaveData(checkResultDocs);
    }
    else {
        checkResult.saveData(checkResultDocs);
    }
    rse.send("数据上传更新完成！");
}

///下载checkresult结果
function checkResultToExcel(req, res) {
    checkResult.getResultForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "督导抽查结果" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

///获取检查结果JSON
function checkResultGetData(req, res) {
    checkResult.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function checkResultGrid(req, res) {
    checkResult.getGrid(function (docs) {
        // console.log(docs);
        res.render('case4checkresult', { layout: null, params: docs });
    });
}

///----------------------

///----outlet-----
function outletSaveData(rse, fileName, fields) {
    var docs = jsonObj.ExcelToJson(fileName, "客户资料");
    var cbrm = fields.cbrm;
    if (cbrm == 'on') {
        outlet.removeSaveData(docs);
    }
    else {
        outlet.saveData(docs);
    }
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

function outletGrid(req, res) {
    outlet.getGrid(function (docs) {
        //console.log("d1=" + docs);
        res.render('case4outlet', { layout: null, params: docs });
    });
}
///------------


///----package-----
function packageSaveData(rse, fileName, fields) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "合同检查");
    var cbrm = fields.cbrm;
    if (cbrm == 'on') {
        package.removeSaveData(docs);
    }
    else {
        package.saveData(docs);
    }
    rse.send("数据上传更新完成！");
}

function packageDataToExcel(req, res) {
    package.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "合同检查" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

function packageGetData(req, res) {
    package.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function packageGrid(req, res) {
    package.getGrid(function (docs) {
        //console.log("d1=" + docs);
        res.render('case4package', { layout: null, params: docs });
    });
}
///------------
///----sales-----
function salesSaveData(rse, fileName, fields) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "MM销量");
    var cbrm = fields.cbrm;
    if (cbrm == 'on') {
        sales.removeSaveData(docs);
    }
    else {
        sales.saveData(docs);
    }

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

function salesGrid(req, res) {
    sales.getGrid(function (docs) {
        //console.log("d1=" + docs);
        res.render('case4sales', { layout: null, params: docs });
    });
}
///------------

///----calc
function calcResultGrid(req, res) {
    calcresultJoin.getGrid(function (docs) {
        // console.log("d1=" + docs);
        res.render('case4calcResult', { layout: null, params: docs });
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

function calcResultDataToExcel(req, res) {
    calcresultJoin.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "计算结果" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        // console.log("docs="+docs);
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

//histroy
function versionsGrid(req, res) {
    history.getGrid(req, res, function (result, result2) {//result:版本清单表头，result2：历史结果表头
        // console.log("d1=" + result);
        // console.log("d2=" + result2);
        res.render('case4history', { layout: null, params: result, paramsv1: result2 });
    });
}

function versionsGetHistory(req, res) {
    history.getDataHistory(req, res, function (docs) {
        res.send(docs);
    });
}

function versionsGetData(req, res) {
    history.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function versionsGetHistoryToExcel(req, res) {
    history.getDataHistoryForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "计算结果" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

//// methods-----------------
var methods = {
    'outletSaveData': outletSaveData,
    'outletDataToExcel': outletDataToExcel,
    'outletGetData': outletGetData,
    'outletGrid': outletGrid,
    'salesSaveData': salesSaveData,
    'salesDataToExcel': salesDataToExcel,
    'salesGetData': salesGetData,
    'salesGrid': salesGrid,
    'calcResultGrid': calcResultGrid,
    'getCalcResultView': getCalcResultView,
    'checkVersion': checkVersion,
    'versionsGrid': versionsGrid,
    'versionsGetHistory': versionsGetHistory,
    'versionsGetData': versionsGetData,
    'calcResultDataToExcel': calcResultDataToExcel,
    'versionsGetHistoryToExcel': versionsGetHistoryToExcel,
    'packageSaveData': packageSaveData,
    'packageDataToExcel': packageDataToExcel,
    'packageGetData': packageGetData,
    'packageGrid': packageGrid,
};

module.exports = methods;