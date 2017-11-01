var jsonObj = require("../models/excel.js");
var outlet = require("../models/case4/outlet.js");
var package = require("../models/case4/package.js");
var sales = require("../models/case4/sales.js");
var calcresultJoin = require('../models/case4/calcresultJoin.js');
var history = require('../models/case4/history.js');
var history2p = require('../models/case4/history2p.js');

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
        res.render('case4/checkresult', { layout: null, params: docs });
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
        res.render('case4/outlet', { layout: null, params: docs });
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
        res.render('case4/package', { layout: null, params: docs });
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
        res.render('case4/sales', { layout: null, params: docs });
    });
}
///------------

///----calc
function calcResultGrid(req, res) {
    calcresultJoin.getGrid(function (docs) {
        // console.log("d1=" + docs);
        res.render('case4/calcResult', { layout: null, params: docs });
    });
}
function calcResultGrid2p(req, res) {
    calcresultJoin.getGrid2p(function (docs) {
        // console.log("d1=" + docs);
        res.render('case4/calcResult2p', { layout: null, params: docs });
    });
}
function getCalcResultView(req, res) {
    // CalcresultJoin = new calcresultJoin({});
    calcresultJoin.getCalcResult(req, res, 'paging',function (outlets) {
        res.send(outlets);
    });
}
function getCalcResultView2p(req, res) {
    // CalcresultJoin = new calcresultJoin({});
    calcresultJoin.getCalcResult2p(req, res, 'paging',function (outlets) {
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

function checkVersion2p(req, res) {
    calcresultJoin.checkVersion2p(req, res, function (msg) {
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
function calcResultDataToExcel2p(req, res) {
    calcresultJoin.getDataForExcel2p(req, res, function (docs) {
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
        res.render('case4/history', { layout: null, params: result, paramsv1: result2 });
    });
}

function versionsGrid2p(req, res) {
    history2p.getGrid(req, res, function (result, result2) {//result:版本清单表头，result2：历史结果表头
        // console.log("d1=" + result);
        // console.log("d2=" + result2);
        res.render('case4/history2p', { layout: null, params: result, paramsv1: result2 });
    });
}

function versionsGetHistory(req, res) {
    history.getDataHistory(req, res, function (docs) {
        res.send(docs);
    });
}

function versionsGetHistory2p(req, res) {
    history2p.getDataHistory(req, res, function (docs) {
        res.send(docs);
    });
}

function versionsGetData(req, res) {
    history.getData(req, res, function (docs) {
        res.send(docs);
    });
}
function versionsGetData2p(req, res) {
    history2p.getData(req, res, function (docs) {
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
function versionsGetHistoryToExcel2p(req, res) {
    history2p.getDataHistoryForExcel(req, res, function (docs) {
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
    'calcResultGrid2p': calcResultGrid2p,
    'getCalcResultView': getCalcResultView,
    'getCalcResultView2p': getCalcResultView2p,
    'checkVersion': checkVersion,
    'checkVersion2p': checkVersion2p,
    'versionsGrid': versionsGrid,
    'versionsGrid2p': versionsGrid2p,
    'versionsGetHistory': versionsGetHistory,
    'versionsGetHistory2p': versionsGetHistory2p,
    'versionsGetData': versionsGetData,
    'versionsGetData2p': versionsGetData2p,
    'calcResultDataToExcel': calcResultDataToExcel,
    'calcResultDataToExcel2p': calcResultDataToExcel2p,
    'versionsGetHistoryToExcel': versionsGetHistoryToExcel,
    'versionsGetHistoryToExcel2p':versionsGetHistoryToExcel2p,
    'packageSaveData': packageSaveData,
    'packageDataToExcel': packageDataToExcel,
    'packageGetData': packageGetData,
    'packageGrid': packageGrid,
};

module.exports = methods;