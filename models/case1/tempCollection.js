/**
 * 生成临时的待计算售点清单表
 */

var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var Q = require('q');


var outletSchema = mongoose.Schema();
var outletModel = mongoose.model('outletCheckResult', outletSchema, 'outlets');
var outletTempSchema = mongoose.Schema();
var outletTempModel = mongoose.model('outlettemp', outletTempSchema);

//outle model 关联其它documents
var checkResultSchema = mongoose.Schema();

checkResultSchema.methods.getOutlet = function (cb) {
    return outletModel.find({ 'SAP售点': JSON.parse(JSON.stringify(this))['SAP售点'] }, cb).select('-_id -__v');
};
var checkResultModel = mongoose.model('checkResultOutlet', checkResultSchema, 'checkresults');

function createTempOutlet(cb) {
    ///find  
   
    params.paramNoDb("outlet", function (result) {
        // console.log("sm=" + result)
        outletTempSchema.add(eval("(" + result + ")"));
        checkResultModel.find({}, function (err, checkResults) {
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

                outletTempModel.remove({}, function (err, result) {
                    // console.log('docs='+docs)

                    docs.map(function (doc) {
                        // console.log("doc=" + doc);
                        // doc = eval(doc);
                        doc = JSON.parse(JSON.stringify(doc))[0];//格式化doc很重要，一般先JSON.stringify(doc))输出看看格式是怎么样的，发现原来这里是个数组，导致一直保存不了
                        // console.log("doc=" + JSON.stringify(doc))
                        if (doc) {
                            outletTempModel.update({ 'SAP售点': doc['SAP售点'] },
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