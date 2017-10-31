var jsonObj = require("../models/excel.js");
var outlet = require("../models/case6/outlet.js");
var standar = require("../models/case6/standar.js");
var contract = require("../models/case6/contract.js");
var sales = require("../models/case6/sales.js");
var calcresultJoin = require('../models/case6/calcresultJoin.js');
var history = require('../models/case6/history.js');
var deliver = require('../models/case6/deliver.js');

///--------------------------------------------------------
///上传检查结果excel文件，把excel转JSON，把JSON保存到mongodb
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
        res.render('case6outlet', { layout: null, params: docs });
    });
}
///------------

///----standar-----
function standarSaveData(rse, fileName, fields) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "折扣标准");
    var cbrm = fields.cbrm;
    if (cbrm == 'on') {
        standar.removeSaveData(docs);
    }
    else {
        standar.saveData(docs);
    }
    rse.send("数据上传更新完成！");
}

function standarDataToExcel(req, res) {
    standar.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "折扣标准" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

function standarGetData(req, res) {
    standar.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function standarGrid(req, res) {
    standar.getGrid(function (docs) {
        //console.log("d1=" + docs);
        res.render('case6standar', { layout: null, params: docs });
    });
}
///------------

///----contract-----
function contractSaveData(rse, fileName, fields) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "合同检查");
    var cbrm = fields.cbrm;
    if (cbrm == 'on') {
        contract.removeSaveData(docs);
    }
    else {
        contract.saveData(docs);
    }
    rse.send("数据上传更新完成！");
}

function contractDataToExcel(req, res) {
    contract.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "合同检查" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

function contractGetData(req, res) {
    contract.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function contractGrid(req, res) {
    contract.getGrid(function (docs) {
        //console.log("d1=" + docs);
        res.render('case6contract', { layout: null, params: docs });
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
        res.render('case6sales', { layout: null, params: docs });
    });
}
///------------
///----deliver-----
function deliverSaveData(rse, fileName, fields) {
    //console.log('setfilename=' + fileName);
    var docs = jsonObj.ExcelToJson(fileName, "MM销量");
    var cbrm = fields.cbrm;
    if (cbrm == 'on') {
        deliver.removeSaveData(docs);
    }
    else {
        deliver.saveData(docs);
    }

    rse.send("数据上传更新完成！");
}

function deliverDataToExcel(req, res) {
    deliver.getDataForExcel(req, res, function (docs) {
        var now = new Date();
        var fileName = "MM销量" + now.getFullYear() + now.getMonth() + now.getDate() + ".xlsx";
        jsonObj.JsonToExcel(docs, fileName, function cb(filepath) {
            res.send(filepath);
        });

    })
}

function deliverGetData(req, res) {
    deliver.getData(req, res, function (docs) {
        res.send(docs);
    });
}

function deliverGrid(req, res) {
    deliver.getGrid(function (docs) {
        //console.log("d1=" + docs);
        res.render('case6deliver', { layout: null, params: docs });
    });
}
///------------

///----calc
function calcResultGrid(req, res) {
    calcresultJoin.getGrid(function (docs) {
        // console.log("d1=" + docs);
        res.render('case6calcResult', { layout: null, params: docs });
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
        res.render('case6history', { layout: null, params: result, paramsv1: result2 });
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
    'standarSaveData': standarSaveData,
    'standarDataToExcel': standarDataToExcel,
    'standarGetData': standarGetData,
    'standarGrid': standarGrid,
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
    'contractSaveData': contractSaveData,
    'contractDataToExcel': contractDataToExcel,
    'contractGetData': contractGetData,
    'contractGrid': contractGrid,
    'deliverSaveData': deliverSaveData,
    'deliverDataToExcel': deliverDataToExcel,
    'deliverGetData': deliverGetData,
    'deliverGrid': deliverGrid,
};

module.exports = methods;