var params = require("../modules/prams.js");
var mongoose = require('mongoose');
var SchemaParams;
var CheckResultSchema = mongoose.Schema();

//传入检查结果的JSON数据，保存到数据库中
function saveResult(resultDocs) {
    params("agreements", "checkResult", function (result) {
        //var s = "{'MM售点':String,'SAP售点':String,'BU':String,'办事处':String,'协议':String,'店名':String,'地址':String,'甲方冰柜':String,'乙方货架排面-全系列':String}";

        SchemaParams = eval("(" + result + ")");
        CheckResultSchema.add(SchemaParams);
        var checkResult = mongoose.model('CheckResult', CheckResultSchema);//(文档，schema)定义了一个model
        resultDocs.forEach(function (resultDoc) {
            for (var key in resultDoc) {
                if (key.indexOf(".") > 0) {
                    key2 = key.replace(".", "．");
                    resultDoc = JSON.parse(JSON.stringify(resultDoc).replace(key, key2));
                    console.log(resultDoc);
                }
            }
            //resultDoc = resultDoc.replace(".", "/.");
            checkResult.update({ 'SAP售点': resultDoc.SAP售点 },
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
function getResultGrid(res) {
    params("agreements", "checkResultGrid", function (result) {
        console.log("result=" + result);
        res.render('checkresult', { layout: null, params: result });
    });
}

///从数据库获取检查结果
function getResultData(res, page, rows) {
    var rows = parseInt(rows);
    var skip = (parseInt(page) - 1) * rows;
    params("agreements", "checkResult", function (result) {
        //var s = "{'MM售点':String,'SAP售点':String,'BU':String,'办事处':String,'协议':String,'店名':String,'地址':String,'甲方冰柜':String,'乙方货架排面-全系列':String}";
        // SchemaParams = eval("(" + result + ")");
        // CheckResultSchema.add(SchemaParams);//好像查询不受schema参数影响，可以返回所有字段，暂时屏蔽看看
        var checkResult = mongoose.model('CheckResult', CheckResultSchema);//(文档，schema)定义了一个model
          checkResult.count({}, function (err, count) {
            var total = count;
            checkResult.find({}, function (err, docs) {
                var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"//如果直接加上docs原本是双引号的结果便成单引号，导致easyui grid不能显示。
                res.send(totalDocs);
            }).limit(rows).skip(skip);
        });

    });
}
var methods = { 'saveResult': saveResult, 'getResultGrid': getResultGrid, 'getResultData': getResultData };
module.exports = methods;