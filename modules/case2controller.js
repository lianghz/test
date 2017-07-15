var jsonObj = require("../models/excel.js");
var checkResult = require("../models/case2/checkResult.js");
// var setArgeement = require("../models/case2/setArgeement.js");
var outlet = require("../models/case2/outlet.js");
var sku = require("../models/case2/sku.js");
var package = require("../models/case2/package.js");
var sales = require("../models/case2/sales.js");
// var calcResult = require("../models/case2/calcresult.js");
// // var calcResultView = require("../models/calcresultView.js");
// var calcresultJoin = require('../models/case2/calcresultJoin.js');
// var history = require('../models/case2/history.js');

///--------------------------------------------------------
///上传检查结果excel文件，把excel转JSON，把JSON保存到mongodb
function checkResultSave(rse, fileName) {
    var checkResultDocs = jsonObj.ExcelToJson(fileName, "检查结果");
    checkResult.saveData(checkResultDocs);
    rse.send("数据上传更新完成！");
}

///下载checkresult结果
function checkResultToExcel(req, res) {
    checkResult.getResultForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "检查结果" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
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

function checkResultGetGrid(req, res) {
    checkResult.getGrid(function (docs) {
        // console.log(docs);
        res.render('case2checkresult', { layout: null, params: docs });
    });
}

///----------------------

///----outlet-----
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
        res.render('case2outlet', { layout: null, params: docs });
    });
}
///------------

///----sku-----
function skuSaveData(rse, fileName) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "产品类别");
    // console.log("docs1="+docs);
    sku.saveData(docs);
    rse.send("数据上传更新完成！");
}

function skuDataToExcel(req, res) {
    sku.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "产品类别" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

function skuGetData(req, res) {
    sku.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function skuGetGrid(req, res) {
    sku.getGrid(function (docs) {
        //console.log("d1=" + docs);
        res.render('case2sku', { layout: null, params: docs });
    });
}
///------------

///----package-----
function packageSaveData(rse, fileName) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "常备包装");
    // console.log("docs1="+docs);
    package.saveData(docs);
    rse.send("数据上传更新完成！");
}

function packageDataToExcel(req, res) {
    package.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "常备包装" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
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

function packageGetGrid(req, res) {
    package.getGrid(function (docs) {
        //console.log("d1=" + docs);
        res.render('case2package', { layout: null, params: docs });
    });
}
///------------

///----sales-----
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
        res.render('case2sales', { layout: null, params: docs });
    });
}
///------------

//// methods-----------------
var methods = {
    'checkResultSave': checkResultSave,
    'checkResultToExcel': checkResultToExcel,
    'checkResultGetData': checkResultGetData,
    'checkResultGetGrid': checkResultGetGrid,
    'outletSaveData': outletSaveData,
    'outletDataToExcel': outletDataToExcel,
    'outletGetData': outletGetData,
    'outletGetGrid': outletGetGrid,
    'skuSaveData': skuSaveData,
    'skuDataToExcel': skuDataToExcel,
    'skuGetData': skuGetData,
    'skuGetGrid': skuGetGrid,
    'packageSaveData': packageSaveData,
    'packageDataToExcel': packageDataToExcel,
    'packageGetData': packageGetData,
    'packageGetGrid': packageGetGrid,
    'salesSaveData': salesSaveData,
    'salesDataToExcel': salesDataToExcel,
    'salesGetData': salesGetData,
    'salesGetGrid': salesGetGrid,
};

module.exports = methods;