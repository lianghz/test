/**
 *功能：保存产品类别信息（产品类别.xlsx）到sku文档中
 *保存后调用tempCollection.createTempsku，保存用于生成报表的售点到tempsku文档中
 *另外，在保存检查结果的代码中，也会更新tempsku文档
 */

var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var SchemaParams;
var schema = mongoose.Schema();
var dataModel = mongoose.model('case5active', schema);//(文档，schema)定义了一个model
var Q = require('q');

function removeSaveData(docs) {
    var removeDataModel = mongoose.model('case5active', schema);//(文档，schema)定义了一个model
    removeDataModel.remove({}, function (err, result) {
        saveData(docs);
    });
}

//传入检查结果的JSON数据，保存到数据库中
function saveData(docs) {
    // console.log('saveData='+docs)
    params.paramNoDb("case5active", function (result) {
        SchemaParams = eval("(" + result + ")");
        //console.log('saveData=' + result);
        schema.add(SchemaParams);
        // var dataModel = mongoose.model('case5active', schema);//(文档，schema)定义了一个model
        var promises = docs.map(function (doc) {//把键值的非法字符.转全角．
            for (var key in doc) {
                if (key.indexOf(".") > 0) {
                    key2 = key.replace(".", "．");
                    doc = JSON.parse(JSON.stringify(doc).replace(key, key2));
                }
            }
            dataModel.remove({ 'MM售点': doc['MM售点'] }, function () {
                dataModel.update({ 'MM售点': doc['MM售点'] },
                    doc,
                    { upsert: true },
                    function (err, docs) {
                        if (err) {
                            console.error(err.stack);
                        }
                    });
            });
        });
    });
}
///获取grid表头格式
function getGrid(cb) {
    params.paramNoDb("case5activeGrid", function (result) {
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
    if (outlet) {
        if (condition) condition += ","
        condition += "'MM售点':/" + outlet + "/";
    }
    // console.log("con1=" + condition);
    condition = eval("({" + condition + "})");
    params.paramNoDb("case5active", function (result) {
            dataModel.count(condition, function (err, count) {
            var total = count;
            dataModel.find(condition, function (err, docs) {
                var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"//如果直接加上docs原本是双引号的结果便成单引号，导致easyui grid不能显示。
                //res.send(totalDocs);
                //var totalDocs = JSON.stringify(docs);
                cb(totalDocs);
            }).sort('MM售点').limit(rows).skip(skip);
        });

    });
}

///获取导出到excel的mongodb数据
function getDataForExcel(req, res, cb) {
    var outlet = req.query.outlet;
    var condition = "";
    // console.log("ccsdsds1="+sku);
    if (outlet) {
        if (condition) condition += ","
        condition += "'MM售点':/" + outlet + "/";
    }
    condition = eval("({" + condition + "})");

    params.paramNoDb("case5activeExcel", function (result) {
        var excelHeader;
        excelHeader = result;
        params.paramNoDb("case5active", function (result) {
            SchemaParams = eval("(" + result + ")");//貌似查询的时候不用定义schema格式，返回所有字段
            schema.add(SchemaParams);
            // var dataModel = mongoose.model('case5active', schema);//(文档，schema)定义了一个model
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