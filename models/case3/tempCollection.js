/**
 * 生成临时的待计算售点清单表
 */

var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var Q = require('q');


var case3outletSchema = mongoose.Schema();
var case3outletModel = mongoose.model('case3outletCheckResult', case3outletSchema, 'case3outlets');
var case3outletTempSchema = mongoose.Schema();
var case3outletTempModel = mongoose.model('case3outlettemp', case3outletTempSchema);

//outle model 关联其它documents
var case3checkResultSchema = mongoose.Schema();

case3checkResultSchema.methods.getOutlet = function (cb) {
    return case3outletModel.find({ '售点': JSON.parse(JSON.stringify(this))['MM售点'] }, cb).select('-_id -__v');
};
var case3checkResultModel = mongoose.model('case3checkResultOutlet', case3checkResultSchema, 'case3contracts');//改为与合同检查关联

function createTempOutlet(cb) {
    ///find  
   
    params.paramNoDb("case3outlet", function (result) {
        case3outletTempSchema.add(eval("(" + result + ")"));
        case3checkResultModel.find({}, function (err, checkResults) {
            // console.log('checkResults='+checkResults)
            var docs = [];
            var promises = checkResults.map(function (checkResult) {
                return Q.Promise(function (resolve, reject) {
                    checkResult.getOutlet(function (err, outlet) {
                        docs.push(outlet);
                        resolve();
                    })
                });
            });
            Q.all(promises).then(function () {
                case3outletTempModel.remove({}, function (err, result) {
                    docs.map(function (doc) {
                        doc = JSON.parse(JSON.stringify(doc))[0];//格式化doc很重要，一般先JSON.stringify(doc))输出看看格式是怎么样的，发现原来这里是个数组，导致一直保存不了
                          if (doc) {
                            case3outletTempModel.update({ '售点': doc['售点'] },
                                doc,
                                { upsert: true },
                                function (err, doc) {
                                    if (err) {
                                        console.error(err.stack);
                                    };
                                });
                        }
                    });
                })
            })
        })
    });
}

var methods = { 'createTempOutlet': createTempOutlet };
module.exports = methods;