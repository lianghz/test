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

var skus, packagesSkus;

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
var checkResultModel = mongoose.model('case2checkresult2', checkResultSchema, 'case2checkresults');
var packageModel = mongoose.model('case2package2', packageSchema, 'case2packages');
var skuModel = mongoose.model('case2skucal', skuSchema, 'case2skus');
var versionResultModel = mongoose.model('case2versionResult2', versionResultSchema, 'case2versionResults');
var versionModel = mongoose.model('case2version', versionSchema, 'case2versions');
var outletModel = mongoose.model('case2outlet2', outletSchema, 'case2outlettemps');//schema关联要放在方法定义后面，否则使用的时候找不到方法。



function getCalcResult(req, res, cb) {
    var now = new Date();
    var period = (req.body.period) ? parseInt(req.body.period.substring(4, 7)) : now.getMonth() + 1;
    // console.log('p=' + period)
    var loc = req.body.loc;
    var outlet = req.body.outlet;
    var name = req.body.name;

    if (!req.body.period) {
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
    //    console.log('condition=' + condition);
    condition = eval("({" + condition + "})");
    checkOutlets = {};



    var promisesSku = skuModel.find(function (err, skus2) {
        return Q.Promise(function (resolve, reject) {

            skus = skus2;
            //console.log('sku='+skus);
            resolve();
        })
    });

    var promisesPackagesSkus = packageModel.find(function (err, packagesSkus2) {
        return Q.Promise(function (resolve, reject) {
            packagesSkus = packagesSkus2;
            resolve();
        })

    });
    outletModel.count(condition, function (err, count) {
        var total = count;
        ///find  
        outletModel.find(condition, function (err, outlets) {
            //console.log(outlets);
            var docs = [];
            var rowId = 0;
            var promises = outlets.map(function (outlet) {
                var checkResult, sales, sku;
                return Q.Promise(function (resolve, reject) {
                    outlet.getCheckResult(function (err, checkResult) {
                        outlet.getSales(function (err, sales) {

                            // params.paramDb("agreements", "agreement", function (agreements) {
                            outlet = getCalcResultViewModel(outlet, checkResult, sales, period, rowId, skus, packagesSkus);
                            rowId++;
                            docs.push(outlet);
                            resolve();
                            // });
                        });
                    });
                });
            });

            Q.all(promises, promisesSku, promisesPackagesSkus).then(function () {

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
function getCalcResultViewModel(outlet, checkResult, sales, period, rowId, skus, packagesSkus) {
    outlet = toJson(outlet);
    checkResult = toJson(checkResult);
    sales = toJson(sales);
    skus = toJson(skus);


    //售点对应的淡旺季类型
    var targetSales = outlet['P' + period];

    //计算必备包装的销量
    var packagesSales = [];
    _.map(packagesSkus, function (item) {
        var packages = toJson(item);
        var skusales = _.findWhere(sales, { '产品代码': packages['产品代码'] });
        skusales = _.pick(skusales, '销量');
        packages = _.extend(packages, skusales);
        packagesSales.push(packages);
    });

    //按包装类型小计销量，判断是否达标
    packagesSales = _.groupBy(packagesSales, '序号');//该函数得到的结果是[1:{a:1,b:2},2:{a:2,b:3}]这种形式
    var isPackage = 'Y';//必备包装是否达标
    for (var item in packagesSales) {
        var idx = item[0]["序号"];
        var sumSales = 0.0;
        _.map(item, function (item2) {
            sumSales = sumSales + parseFloat((item2['销量'] ? item2['销量'] : 0));
            //  console.log('item='+idx + ';sss='+ sumSales);
        })
        if (sumSales < 10) {
            isPackage = 'N'
            break;
        }
    }


    //计算总销量
    var actualSales = 0.0;
    var aSales = 0.0;
    var bSales = 0.0;
    var nSales = 0.0;
    var overSales= 0.0;
    var overAward = 0.0;
    for (var key in sales) {
        var item = sales[key];
        actualSales += parseFloat(item['销量']);
        var skutype = _.findWhere(skus, { '产品代码': item['产品代码']});
        // console.log('aaaa='+JSON.stringify(skus));
        skutype = skutype ? skutype['产品分类'] : '无申请费用';
        if(skutype=="A"){
            aSales += parseFloat(item['销量']);
        }else if(skutype=="B"){
            bSales += parseFloat(item['销量']);
        }else{
            nSales += parseFloat(item['销量']);
        }
        //console.log(skutype);
        _.extend(item, { '产品类型': skutype, '折扣标准（元）': 0, '返还金额': 0 });
    }

    rate = actualSales / targetSales;



    //计算奖励标准 A B(以后用配置表，暂时写死)
    //rate:100%-200%	2.6 1.55
    //rate:70%-99.9%	2.3 1.25
    //常备包装:0.3 0.15
    //冰柜盘点表:0.3 0.15
    //下家分销表:0.3 0.15
    var awardA = 0.0;
    var awardB = 0.0;
    if (rate >= 0.7 && rate < 1) {

        awardA = 2.3
        awardB = 1.25
        // console.log('aa='+awardA)
    } else if (rate >= 1 && rate <= 2) {
        // console.log(2.6)
        awardA = 2.6
        awardB = 1.55
    } else if (rate >= 2) {
        // console.log(2.6)
        awardA = 2.6
        awardB = 1.55
    }

    if (isPackage == 'Y') {
        awardA += 0.3
        awardB += 0.15
    }
    if (checkResult['冰柜盘点表'] == 'Y') {
        awardA += 0.3
        awardB += 0.15
    }
    if (checkResult['下家分销表'] == 'Y') {
        awardA += 0.3
        awardB += 0.15
    }
    // console.log('bb='+awardA)

    //计算折扣标准、返还金额
    var awardSum = 0.0;
    for (var key in sales) {
        var item = sales[key];
        var skutype = item['产品类型'];
        //console.log(skutype);
        if (skutype == 'A') {
            item['折扣标准（元）'] = awardA.toFixed(2);
            item['返还金额'] = (awardA * item['销量']).toFixed(2);
            awardSum += awardA * item['销量']
        } else if (skutype == 'B') {
            item['折扣标准（元）'] = awardB.toFixed(2);
            item['返还金额'] = (awardB * item['销量']).toFixed(2);
            awardSum += awardB * item['销量']
        }

    }

    if(rate>2){
        overSales = actualSales - 2*targetSales;
        if(overSales<=aSales)
        {
            overAward = overSales*awardA;
        }else
        {
            overAward = aSales*awardA;
            if(overSales>=(aSales+bSales)){
                overAward = awardA*aSales+awardB*bSales;
            }else{
                overAward = overAward + (overSales-aSales)*awardB;
            }
        }
    }

// console.log('aSales='+aSales)
// console.log('bSales='+bSales)
// console.log('overAward='+overAward)
    return _.extend(outlet, { 'MM销量': sales, '常备包装的达成100%': isPackage, '目标销量': targetSales, '实际销量': actualSales, '销量达成率': (rate*100).toFixed(2)+'%', '返还金额': awardSum.toFixed(2),'超额销量':overSales.toFixed(2),'超额折扣':overAward.toFixed(2),'实际返还':(awardSum-overAward).toFixed(2) }, checkResult);
}

function saveCase2Version(req, res, cb) {
    var period = req.body.period;
    var vno = req.body.vno;
    var vname = req.body.vname;
    var collectionName = 'case2result' + period + 'v' + vno;
    var collectionsaveName = 'case2saveresult' + period + 'v' + vno;
    var vdoc = { "周期": period, "版本": vno, "描述": vname, "保存时间": Date(), "修改时间": Date(), "操作人": "", "状态": 1 };
    vdoc = toJson(vdoc);
    // console.log('vdoc=' + vdoc);
    params.paramNoDb("versions", function (fields) {
        var SchemaParams = eval("(" + fields + ")");
        // console.log('scmm=' + fields)
        versionSchema.add(SchemaParams);
        nonKaModel = mongoose.model(collectionsaveName, salesSchema, collectionName);
        nonKaModel.remove({}, function (err, result) {
            getCalcResult(req, res, function (docs) {
                docs = JSON.parse(JSON.stringify(docs))
                docs = eval(docs);
                for (var key in docs) {
                    docs[key] = _.extend({ 'collname': 'body' }, docs[key]);
                }

                params.getHeader('case2', function (header) {
                    docs.unshift({ 'name': 'agreements', 'params': header.agreement });
                    docs.unshift({ 'collname': 'header', 'params': header });
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
            })
        });
    })
}

function checkVersion(req, res, cb) {
    var period = req.body.period;
    var vno = req.body.vno;
    var over = req.body.over;
    if (over == 'ok') {
        saveCase2Version(req, res, cb);
    } else {
        versionModel.count({ '周期': period, '版本': vno }, function (err, count) {
            if (count == 0) {
                saveCase2Version(req, res, cb);
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

    if (!req.body.period) {
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
    //    console.log('condition=' + condition);
    condition = eval("({" + condition + "})");
    checkOutlets = {};



    var promisesSku = skuModel.find(function (err, skus2) {
        return Q.Promise(function (resolve, reject) {

            skus = skus2;
            //console.log('sku='+skus);
            resolve();
        })
    });

    var promisesPackagesSkus = packageModel.find(function (err, packagesSkus2) {
        return Q.Promise(function (resolve, reject) {
            packagesSkus = packagesSkus2;
            resolve();
        })

    });
    params.paramNoDb("case2calcResultExcel", function (result) {
        var excelHeader;
        excelHeader = result;
        // console.log("rrrr="+result);
        outletModel.find(condition, function (err, outlets) {
            //console.log(result);
            var docs = [];
            var rowId = 0;
            var promises = outlets.map(function (outlet) {
                var checkResult, sales, sku;
                return Q.Promise(function (resolve, reject) {
                    outlet.getCheckResult(function (err, checkResult) {
                        outlet.getSales(function (err, sales) {

                            // params.paramDb("agreements", "agreement", function (agreements) {
                            outlet = getCalcResultViewModel(outlet, checkResult, sales, period, rowId, skus, packagesSkus);
                            rowId++;
                            docs.push(outlet);
                            resolve();
                            // });
                        });
                    });
                });
            });
            Q.all(promises, promisesSku, promisesPackagesSkus).then(function () {
                // var totalDocs = JSON.stringify(docs);
                // console.log("rrrr="+excelHeader);
                cb({ "excelHeader": excelHeader, "docs": docs });
            });
        }).select('-_id -__v').sort({ '考核销量售点': 1 });
    });
}

///获取grid表头格式
function getGrid(cb) {
    params.paramNoDb("case2calcResultGrid", function (result) {
        cb(result);
    });
}

// cb({ "excelHeader": excelHeader, "docs": docs });
var methods = {
    'getCalcResult': getCalcResult,
    'saveCase2Version': saveCase2Version,
    'checkVersion': checkVersion,
    'getDataForExcel': getDataForExcel,
    'getGrid': getGrid
};
module.exports = methods;