/**
 * 生成临时的待计算售点清单表
 */

var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var Q = require('q');


var case2outletSchema = mongoose.Schema();
var case2outletModel = mongoose.model('case2outletCheckResult', case2outletSchema, 'case2outlets');
var case2outletTempSchema = mongoose.Schema();
var case2outletTempModel = mongoose.model('case2outlettemp', case2outletTempSchema);

//outle model 关联其它documents
var case2checkResultSchema = mongoose.Schema();

case2checkResultSchema.methods.getOutlet = function (cb) {
    return case2outletModel.find({ '售点': JSON.parse(JSON.stringify(this))['售点'] }, cb).select('-_id -__v');
};
var case2checkResultModel = mongoose.model('case2checkResultOutlet', case2checkResultSchema, 'case2checkresults');

function createTempOutlet(cb) {
    ///find  
   
    params.paramNoDb("case2outlet", function (result) {
        // console.log("sm=" + result)
        case2outletTempSchema.add(eval("(" + result + ")"));
        case2checkResultModel.find({}, function (err, checkResults) {
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

                case2outletTempModel.remove({}, function (err, result) {
                    // console.log('docs='+docs)

                    docs.map(function (doc) {
                        // console.log("doc=" + doc);
                        // doc = eval(doc);
                        doc = JSON.parse(JSON.stringify(doc))[0];//格式化doc很重要，一般先JSON.stringify(doc))输出看看格式是怎么样的，发现原来这里是个数组，导致一直保存不了
                        // console.log("doc=" + JSON.stringify(doc))
                        if (doc) {
                            case2outletTempModel.update({ '售点': doc['售点'] },
                                doc,
                                { upsert: true },
                                function (err, doc) {
                                    if (err) {
                                        console.error(err.stack);
                                    };
                                    // console.log("uuu")
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