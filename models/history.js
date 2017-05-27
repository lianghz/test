/// 客户协议配置
var params = require("../modules/params.js");
var mongoose = require('mongoose');
var SchemaParams;
var schema = mongoose.Schema();

///获取grid表头格式
function getGrid(cb) {
    params.paramNoDb("versionsGrid", function (result) {
        params.paramDb('agreements', 'calcResultGrid', function (result2, result3) {
            cb(result, result2, result3);
        })
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
            }).limit(rows).skip(skip);
        });

    });
}

///从数据库获取检查结果
function getDataHistory(req, res, cb) {
    var period = req.query.period;
    var vno = req.query.vno;
    var loc = req.query.loc;
    var outlet = req.query.outlet;
    var name = req.query.name;
    var condition = "";
    // if (period) {
    //     if (condition) condition += ","
    //     condition += "'周期':'" + period + "'";
    // }
    // if (vno) {
    //     if (condition) condition += ","
    //     condition += "'版本':'" + vno + "'";
    // }
    if (loc) {
        if (condition) condition += ","
        condition += "'办事处':/" + loc + "/";
    }
    if (outlet) {
        if (condition) condition += ","
        condition += "'考核销量售点':/" + outlet + "/";
    }
    if (name) {
        if (condition) condition += ","
        condition += "'客户名称':/" + name + "/";
    }
    var collection = 'nonka' + 201705 + 'v' + vno;

    // console.log("col=" + condition);
    condition = eval("({" + condition + "})");
    params.paramNoDb("calcResult", function (result) {
        // SchemaParams = eval("(" + result + ")");貌似查询的时候不用定义schema格式，返回所有字段
        // CheckResultSchema.add(SchemaParams);
        var dataModel = mongoose.model(collection, schema, collection);//(文档，schema)定义了一个model
            dataModel.find(condition, function (err, docs) {
                var totalDocs = JSON.stringify(docs)//如果直接加上docs原本是双引号的结果便成单引号，导致easyui grid不能显示。
                // console.log("c=" + totalDocs);
                cb(totalDocs);
            })
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
    'getDataHistory': getDataHistory
};
module.exports = methods;