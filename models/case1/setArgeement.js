/// 客户协议配置
var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var SchemaParams;
var schema = mongoose.Schema();

//先删除原数据，再更新
function removeSaveData(docs) {
    var removeDataModel = mongoose.model('setAgreement', schema);//(文档，schema)定义了一个model
    removeDataModel.remove({}, function (err, result) {
        saveData(docs);
    });
}

//传入检查结果的JSON数据，保存到数据库中
function saveData(docs) {
    // console.log('saveData='+docs)
    params.paramDb("agreements", "setAgreement", function (result) {
        SchemaParams = eval("(" + result + ")");
        // console.log('saveData=' + result);
        schema.add(SchemaParams);
        var dataModel = mongoose.model('setAgreement', schema);//(文档，schema)定义了一个model
        docs.forEach(function (doc) {//把键值的非法字符.转全角．
            for (var key in doc) {
                if (key.indexOf(".") > 0) {
                    key2 = key.replace(".", "．");
                    doc = JSON.parse(JSON.stringify(doc).replace(key, key2));
                }
            }
            dataModel.remove({ 'SAP售点': doc.SAP售点, '数据类型': doc.数据类型 }, function () {
                dataModel.update({ 'SAP售点': doc.SAP售点, '数据类型': doc.数据类型 },
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
    params.paramDb("agreements", "setAgreementGrid", function (result) {
        // console.log(result);
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
    // console.log("ccsdsds1=" + outlet);
    if (outlet) {
        if (condition) condition += ","
        condition += "'SAP售点':/" + outlet + "/";
        // console.log("ccsdsds=" + condition);
    }
    condition = eval("({" + condition + "})");
    params.paramDb("agreements", "setAgreement", function (result) {
        // SchemaParams = eval("(" + result + ")");貌似查询的时候不用定义schema格式，返回所有字段
        // CheckResultSchema.add(SchemaParams);
        var dataModel = mongoose.model('setAgreement', schema);//(文档，schema)定义了一个model
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
    if (outlet) {
        if (condition) condition += ","
        condition += "'SAP售点':/" + outlet + "/";
    }
    // console.log("cond1="+condition);
    condition = eval("({" + condition + "})");

    params.paramDb("agreements", "setAgreementExcel", function (result) {
        var excelHeader;
        excelHeader = result;
        params.paramDb("agreements", "setAgreement", function (result) {
            SchemaParams = eval("(" + result + ")");//貌似查询的时候不用定义schema格式，返回所有字段
            schema.add(SchemaParams);
            var dataModel = mongoose.model('setAgreement', schema);//(文档，schema)定义了一个model
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