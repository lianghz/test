/**
 * 功能：计算返还结果，保存结果；
 * 通过客户资料（tempoutlet），关联协议文档、检查结果文档、销量文档，根据计算逻辑计算结果；
 * 通过保存功能，把计算结果保存起来；
 * 每个结果按版本信息保存到一个独立的文档中；
 * 每个版本结果作为历史记录，可以翻查。
 * case 2
 */

var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var Q = require('q');
var _ = require('underscore');

var skus,packagesSkus;

///---定义schema model
var outletSchema = mongoose.Schema();
var setArgeementSchema = mongoose.Schema();
var checkResultSchema = mongoose.Schema();
var salesSchema = mongoose.Schema();
var skuSchema = mongoose.Schema();
var packageSchema = mongoose.Schema();
var versionResultSchema = mongoose.Schema();
var versionSchema = mongoose.Schema();

// var setArgeementModel = mongoose.model('setagreement', setArgeementSchema);




var checkOutlets = {};//保存考核售点所对应售点的奖励金额合计、销量合计

function toJson(element) {
    return JSON.parse(JSON.stringify(element));
}

checkOutlets = toJson(checkOutlets);

outletSchema.methods.getCheckResult = function (cb) {
     checkResultModel.findOne({ '售点': JSON.parse(JSON.stringify(this))['售点'] }, cb);
};
outletSchema.methods.getSales = function (cb) {
     salesModel.find({ '售点': JSON.parse(JSON.stringify(this))['售点'] }, cb);
};

salesSchema.methods.getSku = function (cb) {
     skuSchema.findOne({ '产品代码': JSON.parse(JSON.stringify(this))['产品代码'] }, cb);
};

salesSchema.methods.getPackage = function (cb) {
     packageSchema.findOne({ '产品代码': JSON.parse(JSON.stringify(this))['产品代码'] }, cb);
};

var salesModel = mongoose.model('case2sales', salesSchema, 'case2sales');
var checkResultModel = mongoose.model('case2checkresult2', checkResultSchema,'case2checkresults');
var packageModel = mongoose.model('case2package2', packageSchema, 'case2packages');
var skuModel = mongoose.model('case2sku', skuSchema, 'case2skus');
var versionResultModel = mongoose.model('case2versionResult2', versionResultSchema,'case2versionResults');
var versionModel = mongoose.model('case2version', versionSchema, 'case2versions');
var outletModel = mongoose.model('case2outlet2', outletSchema, 'case2outlettemps');//schema关联要放在方法定义后面，否则使用的时候找不到方法。



function getCalcResult(req, res, cb) {
    var now = new Date();
    var period = (req.body.period) ? parseInt(req.body.period.substring(4, 7)) : now.getMonth() + 1;
    // console.log('p=' + period)
    var loc = req.body.loc;
    var outlet = req.body.outlet;
    var name = req.body.name;
    if (!loc) {
        period = (req.query.period) ? parseInt(req.query.period.substring(4, 7)) : now.getMonth() + 1;
        loc = req.query.loc;
        outlet = req.query.outlet;
        name = req.query.name;
    }

    var condition = "";
    // if (bu) {
    //     condition += "'BU':/" + bu + "/";
    // }
    if (loc) {
        if (condition) condition += ","
        condition += "'办事处':/" + loc + "/";
    }
    if (outlet) {
        if (condition) condition += ","
        condition += "'售点':/" + outlet + "/";
    }
    if (name) {
        if (condition) condition += ","
        condition += "'名称':/" + name + "/";
    }
    // console.log('condition=' + condition);
    condition = eval("({" + condition + "})");
    checkOutlets = {};


    
    var promisesSku = skuModel.find(function(err,skus2){
        return Q.Promise(function (resolve, reject) {
            
            skus = skus2;
            //console.log('sku='+skus);
            resolve();
        })        
    });

    var promisesPackagesSkus = packageModel.find(function(err,packagesSkus2){
            return Q.Promise(function (resolve, reject) {
            packagesSkus = packagesSkus2;
            resolve();
        })    
        
    });    
    outletModel.count(condition, function (err, count) {
        var total = count;
        ///find  
        outletModel.find(condition, function (err, outlets) {
            var docs = [];
            var rowId = 0;
            var promises = outlets.map(function (outlet) {
                var checkResult, sales,sku;
                return Q.Promise(function (resolve, reject) {
                    console.log('checkResult2=');
                    outlet.getCheckResult(function (err, checkResult) {
                        outlet.getSales(function (err, sales) {
                            
                                // params.paramDb("agreements", "agreement", function (agreements) {
                                    outlet = getCalcResultViewModel(outlet, checkResult, sales, period, rowId);
                                    console.log("outletttt="+JSON.stringify(outlet));
                                    rowId++;
                                    docs.push(outlet);
                                    resolve();
                                // });
                        });
                    });
                });
            });
            
            Q.all(promises,promisesSku,promisesPackagesSkus).then(function () {
                //console.log("checkoutlet=" + JSON.stringify(checkOutlets));
                for (var key in checkOutlets) {
                    var rowId = checkOutlets[key]['rowId'];//rowid 指示了考核售点所在的行
                    var amt = checkOutlets[key]['奖励合计'];//总奖励金额
                    var actual = checkOutlets[key]['合计实际收入'];

                    //var targetSales = docs[rowId]['销量目标/元/月'];//目标收入
                    var targetSales = checkOutlets[key]['合计目标收入'];//目标收入

                    var rate = targetSales ? actual / targetSales : 0;

                    rate = rate < 0.5 ? 0 : rate;
                    rate = (rate > 0.5 && rate < 1) ? 0.5 : rate;
                    rate = rate >= 1 ? 1 : rate;
                    // console.log('rate2=' + rate)
                    // console.log("============================")
                    amt = amt * rate;
                    amt = amt.toFixed(2);
                    if (rowId > -1) {
                        docs[rowId]['计算结果合计（包含销量考核）'] = amt;
                        docs[rowId]['合计目标收入'] = targetSales;
                        docs[rowId]['合计实际收入'] = actual;
                    }
                    // console.log(rowId);
                    // console.log(amt);
                }
                docs = _.sortBy(docs, function (num) {
                    if (parseInt(num['考核销量售点']) - parseInt(num['SAP售点']) == 0) {
                        return '' + num['考核销量售点'] + 1;
                    } else {
                        return '' + num['考核销量售点'] + 2;
                    }
                })
                // var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"
                var totalDocs = JSON.stringify(docs);
                cb(totalDocs);
            });
        }).select('-_id -__v').sort({ '考核销量售点': 1 });
        // }).sort({'考核销量售点':1}).limit(rows).skip(skip);
        ///end find
    });
}

////////////////////////////////

///客户资料，协议设置，检查结果，MM销量，周期，行Id
function getCalcResultViewModel(outlet, checkResult, sales, period, rowId) {
    outlet = toJson(outlet);
    checkResult = toJson(checkResult);
    sales = toJson(sales);

    var targetSales = outlet['P' + period];//售点对应的淡旺季类型
   
    ///"销量目标/元/月", "折扣/月/元"
    // awardSum = eval("({'计算结果（元）（不含销量考核）':" + awardSum.toFixed(2) + ",'销量目标/元/月':" + salesTarget + ",'折扣/月/元':" + discTarget + ",})");
    return _.extend(outlet, { 'MM销量': sales, '常备包装100%': 10,'目标销量':targetSales },checkResult);
}

function saveNonKaVersion(req, res, cb) {
    var period = req.body.period;
    var vno = req.body.vno;
    var vname = req.body.vname;
    var collectionName = 'nonka' + period + 'v' + vno;
    var vdoc = { "周期": period, "版本": vno, "描述": vname, "保存时间": Date(), "修改时间": Date(), "操作人": "", "状态": 1 };
    vdoc = toJson(vdoc);
    // console.log('vdoc=' + vdoc);
    params.paramNoDb("versions", function (fields) {
        var SchemaParams = eval("(" + fields + ")");
        // console.log('scmm=' + fields)
        versionSchema.add(SchemaParams);
        nonKaModel = mongoose.model(collectionName, salesSchema, collectionName);
        nonKaModel.remove({}, function (err, result) {
            getCalcResult(req, res, function (docs) {
                docs = JSON.parse(JSON.stringify(docs))
                docs = eval(docs);
                nonKaModel.collection.insert(docs, function (err, d) {
                    if (err) {
                        cb('保存失败' + err);
                    } else {
                        versionModel.update({ '周期': period, '版本': vno },
                            vdoc,
                            { upsert: true },
                            function (err, docs) {
                                if (err) {
                                    console.error(err.stack);
                                    cb('保存失败版本' + err);
                                };
                                cb('保存成功');
                            });
                    }
                })
            })
        });
    })
}

function checkVersion(req, res, cb) {
    var period = req.body.period;
    var vno = req.body.vno;
    var over = req.body.over;
    if (over == 'ok') {
        saveNonKaVersion(req, res, cb);
    } else {
        versionModel.count({ '周期': period, '版本': vno }, function (err, count) {
            if (count == 0) {
                saveNonKaVersion(req, res, cb);
            } else {
                cb("该版本已经存在,是否覆盖")
            }
        })
    }
}

///获取导出到excel的mongodb数据
function getDataForExcel(req, res, cb) {
    var now = new Date();
    var period = (req.body.period) ? parseInt(req.body.period.substring(4, 7)) : now.getMonth() + 1;
    // console.log('p=' + period)
    var loc = req.body.loc;
    var outlet = req.body.outlet;
    var name = req.body.name;
    if (!loc) {
        period = (req.query.period) ? parseInt(req.query.period.substring(4, 7)) : now.getMonth() + 1;
        loc = req.query.loc;
        outlet = req.query.outlet;
        name = req.query.name;
    }

    var condition = "";
    // if (bu) {
    //     condition += "'BU':/" + bu + "/";
    // }
    if (loc) {
        if (condition) condition += ","
        condition += "'办事处':/" + loc + "/";
    }
    if (outlet) {
        if (condition) condition += ","
        condition += "'考核销量售点':/" + outlet + "/";
    }
    if (name) {
        if (condition) condition += ","
        condition += "'店名':/" + name + "/";
    }
    // console.log('condition=' + condition);
    condition = eval("({" + condition + "})");
    checkOutlets = {};

    params.paramDb("agreements", "calcResultExcel", function (result,result2,result3) {
        var excelHeader,excelHeader2,argmentList;
        excelHeader = result;
        excelHeader2 = result2;
        argmentList = result3;
        outletModel.find(condition, function (err, outlets) {
            var docs = [];
            var rowId = 0;
            var promises = outlets.map(function (outlet) {
                var checkResult, sales;
                return Q.Promise(function (resolve, reject) {
                        outlet.getCheckResult(function (err, checkResult) {
                            outlet.getSales(function (err, sales) {
                                    outlet = getCalcResultViewModel(outlet, checkResult, sales, period, rowId);
                                    rowId++;
                                    docs.push(outlet);
                                    resolve(); 
                            });
                        });
                    });
                });
            });
            Q.all(promises).then(function () {
                //console.log("checkoutlet=" + JSON.stringify(checkOutlets));
                for (var key in checkOutlets) {
                    var rowId = checkOutlets[key]['rowId'];//rowid 指示了考核售点所在的行
                    var amt = checkOutlets[key]['奖励合计'];//总奖励金额
                    var actual = checkOutlets[key]['合计实际收入'];

                    //var targetSales = docs[rowId]['销量目标/元/月'];//目标收入
                    var targetSales = checkOutlets[key]['合计目标收入'];//目标收入

                    var rate = targetSales ? actual / targetSales : 0;

                    rate = rate < 0.5 ? 0 : rate;
                    rate = (rate > 0.5 && rate < 1) ? 0.5 : rate;
                    rate = rate >= 1 ? 1 : rate;
                    // console.log('rate2=' + rate)
                    // console.log("============================")
                    amt = amt * rate;
                    amt = amt.toFixed(2);
                    if (rowId > -1) {
                        docs[rowId]['计算结果合计（包含销量考核）'] = amt;
                        docs[rowId]['合计目标收入'] = targetSales;
                        docs[rowId]['合计实际收入'] = actual;
                    }
                    // console.log(rowId);
                    // console.log(amt);
                }
                docs = _.sortBy(docs, function (num) {
                    if (parseInt(num['考核销量售点']) - parseInt(num['SAP售点']) == 0) {
                        return '' + num['考核销量售点'] + 1;
                    } else {
                        return '' + num['考核销量售点'] + 2;
                    }
                })
                // var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"
                //var totalDocs = JSON.stringify(docs);
                //cb(totalDocs);
                // console.log('eee'+excelHeader2);
                 cb({ "excelHeader": excelHeader,"excelHeader2": excelHeader2,"argmentList": argmentList, "docs": docs });
            });
        }).select('-_id -__v').sort({ '考核销量售点': 1 });
}

///获取grid表头格式
function getGrid(cb) {
    params.paramNoDb("case2calcResultGrid", function (result) {
        cb(result);
    });
}

// cb({ "excelHeader": excelHeader, "docs": docs });
var methods = { 'getCalcResult': getCalcResult, 
'saveNonKaVersion': saveNonKaVersion, 
'checkVersion': checkVersion,
'getDataForExcel':getDataForExcel,
'getGrid':getGrid };
module.exports = methods;