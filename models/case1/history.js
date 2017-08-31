/**
 * 功能：显示历史版本结果；
 * 保存版本的编号，描述；
 * 用于调用对应的历史结果文档，把结果显示
 */

var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var SchemaParams;
var schema = mongoose.Schema();
var _ = require('underscore');

//获取grid表头格式
// function getGrid(cb) {
//     params.paramNoDb("versionsGrid", function (result) {
//         params.paramDb('agreements', 'calcResultGrid', function (result2, result3) {
//             cb(result, result2, result3);
//         })
//     });
// }

function getGrid(cb) {
    params.paramNoDb("versionsGrid", function (result) {
        cb(result);
    });
}

//获取历史计算结果grid表头
function getHistGrid(req, res, cb) {
    var period = req.query.period;
    var vno = req.query.vno;
    var condition = "";
    var collection = 'nonka' + period + 'v' + vno;
    // console.log("con1=" + condition);
    condition = eval("({" + condition + "})");
    var dataModel = mongoose.model(collection, schema, collection);//(文档，schema)定义了一个model
    dataModel.find({ 'collname': 'header' }, function (err, header) {
        header.paramsModelName = 'p' + collection;
        header.paramsCollName = collection;
        // console.log('hhhh=' + JSON.stringify(header));
        // paramDbv(parameterName, resultName, caseheader, casenum, cb)
        params.paramDbv('agreements', 'calcResultGrid', header, 'case1', function (result1, result2) {
            // console.log('rrr=' + result1);
            cb(result1, result2);
        });
    });
}


///从数据库获取检查结果
function getData(req, res, cb) {
    var page = parseInt(req.query.page);
    var rows = parseInt(req.query.rows);
    var skip = (page - 1) * rows;
    var period = req.query.period;
    var vno = req.query.vno;
    var condition = "";
    if (period) {
        if (condition) condition += ","
        condition += "'周期':'" + period + "'";
    }
    if (vno) {
        if (condition) condition += ","
        condition += "'版本':'" + vno + "'";
    }

    // console.log("con1=" + condition);
    condition = eval("({" + condition + "})");
    params.paramNoDb("versions", function (result) {
        // SchemaParams = eval("(" + result + ")");貌似查询的时候不用定义schema格式，返回所有字段
        // CheckResultSchema.add(SchemaParams);
        var dataModel = mongoose.model('versions2', schema, 'versions');//(文档，schema)定义了一个model
        dataModel.count(condition, function (err, count) {
            var total = count;
            dataModel.find(condition, function (err, docs) {
                var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"//如果直接加上docs原本是双引号的结果便成单引号，导致easyui grid不能显示。
                cb(totalDocs);
            }).sort({ '修改时间': -1 }).limit(rows).skip(skip);
        });

    });
}

///获取历史版本的计算结果
function getDataHistory(req, res, cb) {
    var period = req.query.period;
    var vno = req.query.vno;
    var loc = req.query.loc;
    var outlet = req.query.outlet;
    var name = req.query.name;
    var condition = "";
    if (loc) {
        if (condition) condition += ","
        condition += "'办事处':/" + loc + "/";
    }
    if (outlet) {
        if (condition) condition += ","
        condition += "'考核销量售点':'" + outlet + "'";
    }
    if (name) {
        if (condition) condition += ","
        condition += "'客户名称':/" + name + "/";

    }
    // console.log(period);
    var collection = 'nonka' + period + 'v' + vno;
    condition = eval("({'collname':'body'," + condition + "})");
    // console.log('nnn=' + condition)
    var dataModel = mongoose.model(collection, schema, collection);//(文档，schema)定义了一个model
    dataModel.find(condition, function (err, docs) {
        // console.log('sss='+JSON.stringify(condition))
        cb(docs);
    })
}

function getDataHistoryForExcel(req, res, cb) {
    var period = req.query.period;
    var vno = req.query.vno;
    var loc = req.query.loc;
    var outlet = req.query.outlet;
    var name = req.query.name;
    var condition = "";
    if (loc) {
        if (condition) condition += ","
        condition += "'办事处':/" + loc + "/";
    }
    if (outlet) {
        if (condition) condition += ","
        condition += "'考核销量售点':'" + outlet + "'";
    }
    if (name) {
        if (condition) condition += ","
        condition += "'客户名称':/" + name + "/";

    }
    var collection = 'nonka' + period + 'v' + vno;
    var dataModel = mongoose.model(collection, schema, collection);//(文档，schema)定义了一个model
    dataModel.find({ 'collname': 'header' }, function (err, caseheader) {
        caseheader.paramsModelName = 'excel' + collection;
        caseheader.paramsCollName = collection;
        params.paramDbv("agreements", "calcResultExcel", caseheader, 'case1', function (result, result2, result3) {
            var excelHeader, excelHeader2, argmentList;
            excelHeader = result;
            excelHeader2 = result2;
            argmentList = result3;
            condition = eval("({'collname':'body'," + condition + "})");
            dataModel.find(condition, function (err, docs) {
                cb({ "excelHeader": excelHeader, "excelHeader2": excelHeader2, "argmentList": argmentList, "docs": docs });
            });
        });
    });
}


///获取导出到excel的mongodb数据
function getDataForExcel(req, res, cb) {
    var period = req.query.period;
    var vno = req.query.vno;
    var condition = "";
    // console.log("ccsdsds1="+outlet);
    if (period) {
        if (condition) condition += ","
        condition += "'周期':" + period;
        // console.log("ccsdsds="+condition);
    }
    if (vno) {
        if (condition) condition += ","
        condition += "'版本':" + vno;
    }
    //console.log(condition);
    condition = eval("({" + condition + "})");

    params.paramNoDb("versionsExcel", function (result) {
        var excelHeader;
        excelHeader = result;
        params.paramNoDb("versions", function (result) {
            SchemaParams = eval("(" + result + ")");//貌似查询的时候不用定义schema格式，返回所有字段
            schema.add(SchemaParams);
            var dataModel = mongoose.model('versions3', schema, 'versions');//(文档，schema)定义了一个model
            //console.log(condition);
            dataModel.find(condition, function (err, docs) {
                cb({ "excelHeader": excelHeader, "docs": docs });
            });
        });
    });
}

var methods = {
    'getGrid': getGrid,
    'getData': getData,
    'getDataForExcel': getDataForExcel,
    'getDataHistory': getDataHistory,
    'getHistGrid': getHistGrid,
    'getDataHistoryForExcel': getDataHistoryForExcel,
};
module.exports = methods;