///检查结果数据处理

var params = require("../modules/params.js");
var tempColl = require("./tempCollection.js");
var mongoose = require('mongoose');
var Q = require('q');

var SchemaParams;
var CheckResultSchema = mongoose.Schema();

//传入检查结果的JSON数据，保存到数据库中
function saveResult(resultDocs) {
    params.paramDb("agreements", "checkResult", function (result) {
        SchemaParams = eval("(" + result + ")");
        CheckResultSchema.add(SchemaParams);
        var checkResult = mongoose.model('CheckResult', CheckResultSchema);//(文档，schema)定义了一个model
        //var promises = resultDocs.forEach(function (resultDoc) {
        var promises = resultDocs.map(function (resultDoc) {
            // console.log('resultDoc='+JSON.stringify(resultDoc));
            for (var key in resultDoc) {
                if (key.indexOf(".") > 0) {
                    key2 = key.replace(".", "．");
                    resultDoc = JSON.parse(JSON.stringify(resultDoc).replace(key, key2));
                }
            }
            //resultDoc = resultDoc.replace(".", "/.");
            return Q.Promise(function (resolve, reject) {
                checkResult.update({ 'SAP售点': resultDoc.SAP售点 },
                    resultDoc,
                    { upsert: true },
                    function (err, docs) {
                        if (err) {
                            console.error(err.stack);
                        };
                        resolve();
                    });
            })
        });
        Q.all(promises).then(function () {
            // console.log('ppp=')
            tempColl.createTempOutlet(function (msg) {

            })
        });
    });
}
///获取检查结果的grid表头格式
function getResultGrid(res) {
    params.paramDb("agreements", "checkResultGrid", function (result) {
        //console.log("result=" + result);
        var now = new Date();
        res.render('checkresult', { layout: null, params: result });
    });
}

///从数据库获取检查结果
function getResultData(req, res) {
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
    params.paramDb("agreements", "checkResult", function (result) {
        // SchemaParams = eval("(" + result + ")");貌似查询的时候不用定义schema格式，返回所有字段
        // CheckResultSchema.add(SchemaParams);
        var checkResult = mongoose.model('CheckResult', CheckResultSchema);//(文档，schema)定义了一个model
        checkResult.count(condition, function (err, count) {
            var total = count;
            checkResult.find(condition, function (err, docs) {
                var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"//如果直接加上docs原本是双引号的结果便成单引号，导致easyui grid不能显示。
                res.send(totalDocs);
            }).limit(rows).skip(skip);
        });

    });
}

///获取导出到excel的mongodb数据
function getResultForExcel(req, res, cb) {
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
    params.paramDb("agreements", "checkResultExcel", function (result) {
        var excelHeader;
        excelHeader = result;
        params.paramDb("agreements", "checkResult", function (result) {
            SchemaParams = eval("(" + result + ")");//貌似查询的时候不用定义schema格式，返回所有字段
            CheckResultSchema.add(SchemaParams);
            var checkResult = mongoose.model('CheckResult', CheckResultSchema);//(文档，schema)定义了一个model
            checkResult.count(condition, function (err, count) {
                var total = count;
                checkResult.find(condition, function (err, docs) {
                    // console.log("excdoc="+docs);
                    cb({ "excelHeader": excelHeader, "docs": docs });
                });
            });
        });
    });

}

var methods = { 'saveResult': saveResult, 'getResultGrid': getResultGrid, 'getResultData': getResultData, 'getResultForExcel': getResultForExcel };
module.exports = methods;