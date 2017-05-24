///检查结果数据处理

var params = require("../modules/params.js");
var mongoose = require('mongoose');



var SchemaParams;
var CalcResultSchema = mongoose.Schema();

//传入检查结果的JSON数据，保存到数据库中
function saveData(resultDocs) {
    params.paramDb("agreements", "CalcResult", function (result) {
        SchemaParams = eval("(" + result + ")");
        CalcResultSchema.add(SchemaParams);
        var CalcResult = mongoose.model('CalcResult', CalcResultSchema);//(文档，schema)定义了一个model
        resultDocs.forEach(function (resultDoc) {
            for (var key in resultDoc) {
                if (key.indexOf(".") > 0) {
                    key2 = key.replace(".", "．");
                    resultDoc = JSON.parse(JSON.stringify(resultDoc).replace(key, key2));
                }
            }
            //resultDoc = resultDoc.replace(".", "/.");
            CalcResult.update({ 'SAP售点': resultDoc.SAP售点 },
                resultDoc,
                { upsert: true },
                function (err, docs) {
                    if (err) {
                        console.error(err.stack);
                    }
                });
        });
    });
}
///获取检查结果的grid表头格式
function getGrid(cb) {
    params.paramDb("agreements", "calcResultGrid", function (result,result2) {
        // console.log("rs="+result);
        cb(result,result2);
    });
}

///从数据库获取检查结果
function getData(req, res) {
    var page = parseInt(req.query.page);
    var rows = parseInt(req.query.rows);
    var skip = (page - 1) * rows;
    var bu = req.query.bu;
    var loc = req.query.loc;
    var outlet = req.query.outlet;
    var name = req.query.name;
    var condition = "";
    if (bu) {
        condition += "'BU':/" + bu + "/";
    }
    if (loc) {
        if (condition) condition += ","
        condition += "'办事处':/" + loc + "/";
    }
    if (outlet) {
        if (condition) condition += ","
        condition += "'SAP售点':/" + outlet + "/";
    }
    if (name) {
        if (condition) condition += ","
        condition += "'店名':/" + name + "/";
    }
    condition = eval("({" + condition + "})");
    params.paramDb("agreements", "CalcResult", function (result) {
        SchemaParams = eval("(" + result + ")");//貌似查询的时候不用定义schema格式，返回所有字段
        CalcResultSchema.add(SchemaParams);
        var CalcResult = mongoose.model('CalcResult', CalcResultSchema);//(文档，schema)定义了一个model
        CalcResult.count(condition, function (err, count) {
            var total = count;
            CalcResult.find(condition, function (err, docs) {
                var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"//如果直接加上docs原本是双引号的结果便成单引号，导致easyui grid不能显示。
                res.send(totalDocs);
            }).limit(rows).skip(skip);
        });

    });
}

///获取导出到excel的mongodb数据
function getDataForExcel(req, res, cb) {
    var bu = req.query.bu;
    var loc = req.query.loc;
    var outlet = req.query.outlet;
    var name = req.query.name;
    var condition = "";
    if (bu) {
        condition += "'BU':/" + bu + "/";
    }
    if (loc) {
        if (condition) condition += ","
        condition += "'办事处':/" + loc + "/";
    }
    if (outlet) {
        if (condition) condition += ","
        condition += "'SAP售点':/" + outlet + "/";
    }
    if (name) {
        if (condition) condition += ","
        condition += "'店名':/" + name + "/";
    }
    // console.log("cond1="+condition);
    condition = eval("({" + condition + "})");
    params.paramDb("agreements", "CalcResultExcel", function (result) {
        var excelHeader;
        excelHeader = result;
        params.paramDb("agreements", "CalcResult", function (result) {
            SchemaParams = eval("(" + result + ")");//貌似查询的时候不用定义schema格式，返回所有字段
            CalcResultSchema.add(SchemaParams);
            var CalcResult = mongoose.model('CalcResult', CalcResultSchema);//(文档，schema)定义了一个model
            CalcResult.count(condition, function (err, count) {
                var total = count;
                CalcResult.find(condition, function (err, docs) {
                    // console.log("excdoc="+docs);
                    cb({ "excelHeader": excelHeader, "docs": docs });
                });
            });
        });
    });

}

var methods = { 'saveData': saveData, 'getGrid': getGrid, 'getData': getData, 'getDataForExcel': getDataForExcel };
module.exports = methods;