/**
 * 生成临时的待计算售点清单表
 */

var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var Q = require('q');


var case5outletSchema = mongoose.Schema();
var case5outletModel = mongoose.model('case5outletCheckResult', case5outletSchema, 'case5outlets');
var case5outletTempSchema = mongoose.Schema();
var case5outletTempModel = mongoose.model('case5outlettemp', case5outletTempSchema);

//outle model 关联其它documents
var case5checkResultSchema = mongoose.Schema();

case5checkResultSchema.methods.getOutlet = function (cb) {
    return case5outletModel.find({ '售点': JSON.parse(JSON.stringify(this))['MM售点'] }, cb).select('-_id -__v');
};
var case5checkResultModel = mongoose.model('case5checkResultOutlet', case5checkResultSchema, 'case5contracts');//改为与合同检查关联

function createTempOutlet(cb) {
    ///find  
   
    params.paramNoDb("case5outlet", function (result) {
        case5outletTempSchema.add(eval("(" + result + ")"));
        case5checkResultModel.find({}, function (err, checkResults) {
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
                case5outletTempModel.remove({}, function (err, result) {
                    docs.map(function (doc) {
                        doc = JSON.parse(JSON.stringify(doc))[0];//格式化doc很重要，一般先JSON.stringify(doc))输出看看格式是怎么样的，发现原来这里是个数组，导致一直保存不了
                          if (doc) {
                            case5outletTempModel.update({ '售点': doc['售点'] },
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