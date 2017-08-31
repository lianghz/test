/**
 *功能：保存售点考核结果（1、售点考核结果.xlsx）到case2checkresult文档中
 *保存后调用tempCollection.createTempOutlet，保存用于生成报表的售点到tempoutlet文档中
 *为什么要生成tempoutlet文档？因为outlet中有很多售点，有些可能是不需要计算的，因此调用createTempOutlet,把检查结果中存在的售点保存到tempoutlet中，tempoutlet与outlet文档格式一样
 *另外，在保存检查结果的代码中，也会更新tempoutlet文档
 */

var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var SchemaParams;
var schema = mongoose.Schema();
var dataModel = mongoose.model('case2checkresult', schema);//(文档，schema)定义了一个model
var tempColl = require("./tempCollection.js");
var Q = require('q');

function removeSaveData(docs) {
    var removeDataModel = mongoose.model('case2checkresult', schema);//(文档，schema)定义了一个model
    removeDataModel.remove({}, function (err, result) {
        saveData(docs);
    });
}

//传入检查结果的JSON数据，保存到数据库中
function saveData(docs) {
    // console.log('saveData='+docs)
    params.paramNoDb("case2checkresult", function (result) {
        SchemaParams = eval("(" + result + ")");
        //console.log('saveData=' + result);
        schema.add(SchemaParams);

        var promises = docs.map(function (doc) {//把键值的非法字符.转全角．
            for (var key in doc) {
                if (key.indexOf(".") > 0) {
                    key2 = key.replace(".", "．");
                    doc = JSON.parse(JSON.stringify(doc).replace(key, key2));
                }
            }
            // console.log('data1='+doc);
            return Q.Promise(function (resolve, reject) {
                dataModel.remove({ '售点': doc['售点'] }, function () {
                    dataModel.update({ '售点': doc['售点'] },
                        doc,
                        { upsert: true },
                        function (err, docs) {
                            if (err) {
                                console.error(err.stack);
                            }
                            resolve();
                        });
                });
            })
        });
        Q.all(promises).then(function () {
            tempColl.createTempOutlet(function (msg) {
            })
        });
    });
}
///获取grid表头格式
function getGrid(cb) {
    params.paramNoDb("case2checkresultGrid", function (result) {
        cb(result);
    });
}

///从数据库获取检查结果
function getData(req, res, cb) {
    var page = parseInt(req.query.page);
    var rows = parseInt(req.query.rows);
    var skip = (page - 1) * rows;
    var outlet = req.query.outlet;
    var condition = "";
    // console.log("ccsdsds1="+outlet);
    if (outlet) {
        if (condition) condition += ","
        condition += "'售点':/" + outlet + "/";
        // console.log("ccsdsds="+condition);
    }
    // console.log("con1=" + condition);
    condition = eval("({" + condition + "})");
    params.paramNoDb("case2checkresult", function (result) {
        // SchemaParams = eval("(" + result + ")");貌似查询的时候不用定义schema格式，返回所有字段
        // CheckResultSchema.add(SchemaParams);
        // var dataModel = mongoose.model('case2checkresult', schema);//(文档，schema)定义了一个model
        dataModel.count(condition, function (err, count) {
            var total = count;
            dataModel.find(condition, function (err, docs) {
                var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"//如果直接加上docs原本是双引号的结果便成单引号，导致easyui grid不能显示。
                //res.send(totalDocs);
                cb(totalDocs);
            }).limit(rows).skip(skip);
        });

    });
}

///获取导出到excel的mongodb数据
function getDataForExcel(req, res, cb) {
    var outlet = req.query.outlet;
    var condition = "";
    if (outlet && outlet != '') {
        if (condition) condition += ","
        condition += "'售点':/" + outlet + "/";
        //console.log("ccc=" + condition);
    }
    //console.log(condition);
    condition = eval("({" + condition + "})");

    params.paramNoDb("case2checkresultExcel", function (result) {
        var excelHeader;
        excelHeader = result;
        params.paramNoDb("case2checkresult", function (result) {
            SchemaParams = eval("(" + result + ")");//貌似查询的时候不用定义schema格式，返回所有字段
            schema.add(SchemaParams);
            // var dataModel = mongoose.model('case2checkresult', schema);//(文档，schema)定义了一个model
            //console.log(condition);
            dataModel.find(condition, function (err, docs) {
                cb({ "excelHeader": excelHeader, "docs": docs });
            });
        });
    });
}

var methods = {
    'saveData': saveData,
    'getGrid': getGrid,
    'getData': getData,
    'getDataForExcel': getDataForExcel,
    'removeSaveData': removeSaveData
};
module.exports = methods;