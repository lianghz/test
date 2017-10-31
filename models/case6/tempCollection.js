/**
 * 生成临时的待计算售点清单表
 */

var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var Q = require('q');


var case6outletSchema = mongoose.Schema();
var case6outletModel = mongoose.model('case6outletCheckResult', case6outletSchema, 'case6outlets');
var case6outletTempSchema = mongoose.Schema();
var case6outletTempModel = mongoose.model('case6outlettemp', case6outletTempSchema);

//outle model 关联其它documents
var case6checkResultSchema = mongoose.Schema();

case6checkResultSchema.methods.getOutlet = function (cb) {
    return case6outletModel.find({ '售点': JSON.parse(JSON.stringify(this))['MM售点'] }, cb).select('-_id -__v');
};
var case6checkResultModel = mongoose.model('case6checkResultOutlet', case6checkResultSchema, 'case6contracts');//改为与合同检查关联

function createTempOutlet(cb) {
    ///find  
   
    params.paramNoDb("case6outlet", function (result) {
        case6outletTempSchema.add(eval("(" + result + ")"));
        case6checkResultModel.find({}, function (err, checkResults) {
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
                case6outletTempModel.remove({}, function (err, result) {
                    docs.map(function (doc) {
                        doc = JSON.parse(JSON.stringify(doc))[0];//格式化doc很重要，一般先JSON.stringify(doc))输出看看格式是怎么样的，发现原来这里是个数组，导致一直保存不了
                          if (doc) {
                            case6outletTempModel.update({ '售点': doc['售点'] },
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