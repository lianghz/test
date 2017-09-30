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
var async = require('async');


///---定义schema model
var outletSchema = mongoose.Schema();
var activeSchema = mongoose.Schema();
var checkResultSchema = mongoose.Schema();
var salesSchema = mongoose.Schema();
var deliverSchema = mongoose.Schema();
var contractSchema = mongoose.Schema();
var versionResultSchema = mongoose.Schema();
var versionSchema = mongoose.Schema();

// var setArgeementModel = mongoose.model('setagreement', activeSchema);



var startPeriod = '';
var endPeriod = '';
var checkOutlets = {};//保存考核售点所对应售点的奖励金额合计、销量合计

function toJson(element) {
    return JSON.parse(JSON.stringify(element));
}

checkOutlets = toJson(checkOutlets);
// console.log('endPeriod='+endPeriod)
outletSchema.methods.getSales = function (cb) {
    salesModel.find({ $or: [{ 'MM售点': JSON.parse(JSON.stringify(this))['MM售点'], '周期': startPeriod }, { 'MM售点': JSON.parse(JSON.stringify(this))['MM售点'], '周期': endPeriod }] }, cb);
};

//上月销量
outletSchema.methods.getSalesPer = function (cb) {
    salesModel.find({ 'MM售点': JSON.parse(JSON.stringify(this))['MM售点'], '周期': startPeriod }, cb);
};


var salesModel = mongoose.model('case4sales', salesSchema, 'case4sales');
var versionResultModel = mongoose.model('case4versionResult2', versionResultSchema, 'case4versionResults');
var versionModel = mongoose.model('case4version', versionSchema, 'case4versions');
var versionModel2p = mongoose.model('case4version2p', versionSchema, 'case4versions2ps');
var outletModel = mongoose.model('case4outlet2', outletSchema, 'case4outlets');//schema关联要放在方法定义后面，否则使用的时候找不到方法。
var packageModel = mongoose.model('case4package2', salesSchema, 'case4packages');

function getCalcResult(req, res,dataType, cb) {
    getCalcResultDate(req, res, 'grid', '1p', function (docs) {
        if (dataType != 'save') {
            var total = docs.length;
            docs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"
        }
        cb(docs);
    });
}
function getCalcResult2p(req, res, dataType,cb) {
    getCalcResultDate(req, res, 'grid', '2p', function (docs) {
        if (dataType != 'save') {
            var total = docs.length;
            docs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"
        }
        cb(docs);
    });
}

///获取导出到excel的mongodb数据

function getDataForExcel(req, res, cb) {
    params.paramNoDb("case4calcResultExcel", function (result) {
        getCalcResultDate(req, res, 'excel', '1p', function (docs) {
            cb({ "excelHeader": result, "docs": docs });
        });
    })
}

function getDataForExcel2p(req, res, cb) {
    params.paramNoDb("case4calcResultExcel2p", function (result) {
        getCalcResultDate(req, res, 'excel', '2p', function (docs) {
            cb({ "excelHeader": result, "docs": docs });
        });
    })
}


function getCalcResultDate(req, res, dataType, resultType, cb) {
    var now = new Date();
    var period = (req.body.period) ? parseInt(req.body.period.substring(4, 7)) : now.getMonth() + 1;//月份，用于在表取淡旺季的目标
    var period2 = req.body.period;//当月的周期YYYYMM
    var page = parseInt(req.query.page);
    var rows = parseInt(req.query.rows);
    var skip = (page - 1) * rows;

    var loc = req.body.loc;
    var bu = req.body.bu;
    var outlet = req.body.outlet;
    var name = req.body.name;
    var period1 = '';//上月

    if (!req.body.period) {
        period = (req.query.period) ? parseInt(req.query.period.substring(4, 7)) : now.getMonth() + 1;
        period2 = req.query.period;
        loc = req.query.loc;
        outlet = req.query.outlet;
        name = req.query.name;
        bu = req.query.bu;
    }

    if (!period2) {
        var m = '0' + now.getMonth().toString();
        m = m.substr(m.length - 2, 2);
        period2 = now.getFullYear().toString() + m;
    }
    if (period2.substring(4, 7) == '01') {
        period1 = parseInt(period2) - 89;
    } else {
        period1 = parseInt(period2) - 1;
    }
    startPeriod = period1.toString();
    endPeriod = period2.toString();

    // console.log('p=' + endPeriod)

    var condition = "";
    if (bu) {
        condition += "'BU':/" + bu + "/";
    }
    if (loc) {
        if (condition) condition += ","
        condition += "'办事处':/" + loc + "/";
    }
    if (outlet) {
        if (condition) condition += ","
        condition += "'MM售点':/" + outlet + "/";
    }

    if (name) {
        if (condition) condition += ","
        condition += "'客户名称':/" + name + "/";
    }

    // console.log('outlet='+condition)
    condition = eval("({" + condition + "})");
    var outlets;
    var packagesW;//水
    var packagesC;//+C
    var packagesM;//魔抓
    var docs = [];
    var asyncFunc = {
        getOutlet: function (asycb, results) {
            outletModel.find(condition, function (err, outlet) {
                outlets = outlet;
                asycb();
            }).sort({ 'BU': -1, '办事处': -1, 'MM售点': -1 }).limit(rows).skip(skip);;
        },
        getPackage: function (asycb, results) {
            packageModel.find({}, function (err, package) {
                package = toJson(package);
                packagesW = _.where(package, { "包装": '纯悦' });
                packagesC = _.where(package, { "包装": '怡泉+C' });
                packagesM = _.where(package, { "包装": '魔爪' });
                asycb();
            });
        },
        calcResult: ['getOutlet', 'getPackage', function (asycb, results) {
            //当月的销量
            var outletnum = outlets.length
            var i = 0;
            outlets.map(function (outlet) {
                outlet.getSales(function (err, sales) {
                    outlet = getCalcResultViewModel(outlet, sales, packagesW, packagesC, packagesM, startPeriod, endPeriod, resultType);
                    docs.push(outlet);
                    i++;
                    if (i == outletnum) {
                        asycb();
                    }
                });
            });
        }],
        retrunResult: ['calcResult', function () {
            // if (dataType == 'grid') {
            //     var total = docs.length;
            //     docs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"
            //     cb(docs);
            // } else if (dataType == 'excel') {
            //     cb(docs);
            // }
            cb(docs);
        }]
    }
    async.auto(asyncFunc);
}

////////////////////////////////

///客户资料，协议设置，检查结果，MM销量，周期，行Id
function getCalcResultViewModel(outlet, sales2p, packagesW, packagesC, packagesM, startPeriod, endPeriod, resultType) {
    // console.log('sales='+sales);
    var outlet = toJson(outlet);
    var sales2p = toJson(sales2p);
    // console.log('deliverPer='+deliverPer)
    var sales = _.where(sales2p, { '周期': endPeriod });
    var salesSt = _.where(sales2p, { '周期': startPeriod });
    var pSt = parseInt(startPeriod.substring(4, 7));
    var p = parseInt(endPeriod.substring(4, 7));

    var seasonType = outlet['P' + p];//售点对应的淡旺季类型
    var seasonTypeSt = outlet['P' + pSt];//售点对应的淡旺季类型
    var uni = parseFloat(outlet['A项折扣标准元/PC']);//折扣标准
    var uniABC = parseFloat(outlet['ABC项折扣标准'])
    var uniABC2P = parseFloat(outlet['ABC项折扣标准(2P)'])
    var bu = outlet['BU'];
    var award = 0;//奖励
    var skuSalesTarget = outlet['每个SKU进货量'];
    var skuNumTarget = 0;//进货SKU数要求

    if (seasonType == '淡') {
        skuNumTarget = outlet['进货SKU数要求(淡季)'];
    } else {
        skuNumTarget = outlet['进货SKU数要求(旺季)'];
    }
    if (seasonTypeSt == '淡') {
        skuNumTargetSt = outlet['进货SKU数要求(淡季)'];
    } else {
        skuNumTargetSt = outlet['进货SKU数要求(旺季)'];
    }
    var limitlow = parseFloat(outlet['P' + p + '目标']);
    var limitlowSt = parseFloat(outlet['P' + pSt + '目标']);

    var salesW = 0;
    var salesC = 0;
    var salesM = 0;
    var salesSum = 0;
    var salesOther = 0;
    var rateSum = 0, rateW = 0, rateC = 0;//各项达成率
    var skuNum = 0;//sku达标数
    var isC = "N"//C项：淡旺季进货是否达标
    var amt = 0.0;//计算金额
    var amtM = 0.0;//魔抓计算金额

    var salesWSt = 0;
    var salesCSt = 0;
    var salesMSt = 0;
    var salesSumSt = 0;
    var salesOtherSt = 0;
    var rateSumSt = 0, rateWSt = 0, rateCSt = 0;//各项达成率
    var skuNumSt = 0;//sku达标数
    var isCSt = "N"//C项：淡旺季进货是否达标




    _.map(packagesW, function (item) {
        var temp = _.findWhere(sales, { '产品代码': item['产品代码'] });
        salesW += temp ? parseFloat(temp['销量']) : 0.0;
        rateW = salesW / parseFloat(item['目标销量']);

        temp = _.findWhere(salesSt, { '产品代码': item['产品代码'] });
        salesWSt += temp ? parseFloat(temp['销量']) : 0.0;
        rateWSt = salesWSt / parseFloat(item['目标销量']);
    })

    _.map(packagesC, function (item) {
        var temp = _.findWhere(sales, { '产品代码': item['产品代码'] });
        salesC += temp ? parseFloat(temp['销量']) : 0.0;
        rateC = salesC / parseFloat(item['目标销量']);

        temp = _.findWhere(salesSt, { '产品代码': item['产品代码'] });
        salesCSt += temp ? parseFloat(temp['销量']) : 0.0;
        rateCSt = salesC / parseFloat(item['目标销量']);
    })

    _.map(packagesM, function (item) {
        var temp = _.findWhere(sales, { '产品代码': item['产品代码'] });
        salesM += temp ? parseFloat(temp['销量']) : 0.0;

        temp = _.findWhere(salesSt, { '产品代码': item['产品代码'] });
        salesMSt += temp ? parseFloat(temp['销量']) : 0.0;
    })

    _.map(sales, function (item) {
        var temp = parseFloat(item['销量']);
        salesSum += temp;
        if (temp >= skuSalesTarget) {
            skuNum++;
        }
    })

    _.map(salesSt, function (item) {
        var temp = parseFloat(item['销量']);
        salesSumSt += temp;
        if (temp >= skuSalesTarget) {
            skuNumSt++;
        }
    })

    if (skuNum >= skuNumTarget) {
        isC = "Y"
    }

    if (skuNumSt >= skuNumTarget) {
        isCSt = "Y"
    }

    // console.log('skuSales='+outlet['MM售点']+":"+'SKU达标目标：'+skuNumTarget+'：SKU达标数量：'+skuSales)

    rateSum = salesSum / limitlow;
    if (rateSum < 1) uni = 0;
    if (rateSum < 1 || rateC < 1 || rateW < 1 || isC == "N") uniABC = 0;

    salesOther = salesSum - salesC - salesM - salesW;
    amt = (salesOther + salesC + salesW) * uni + (salesC + salesW) * uniABC;
    amtM = salesM * uni;

    rateSumSt = salesSumSt / limitlowSt;
    // if (rateSumSt < 1) uni = 0;
    if (rateSum < 1 || rateC < 1 || rateW < 1 || isC == "N" || rateSumSt < 1 || rateCSt < 1 || rateWSt < 1 || isCSt == "N") uniABC2P = 0;
    salesOtherSt = salesSumSt - salesCSt - salesMSt - salesWSt;
    var amt2P = 0
    var amtM2P = 0
    amt2P = (salesOther + salesC + salesW + salesOtherSt + salesCSt + salesWSt) * uniABC2P;
    amtM2P = (salesM + salesMSt) * uniABC2P;

    if (resultType == "1p") {
        return _.extend(outlet, {
            '经销商': outlet['客户名称'],
            '目标(PC)': limitlow, '淡旺季': seasonType, '其它产品': salesOther, '魔爪': salesM,
            'B项：纯悦': salesW, 'B项：怡泉+C': salesC, '合计': salesSum, '进货达标SKU数': skuNum, 'C项：淡旺季进货是否达标': isC,
            'A项：销量达成率': (rateSum * 100).toFixed(2) + '%', '折扣标准：销量完成≥100%': uni, '折扣标准：魔爪': uni, '折扣标准：A项、B项、C项': uniABC,
            '计算金额': amt, '魔爪计算金额': amtM, '合计金额': amt + amtM, '备注': ''
        });
    } else {
        return _.extend(outlet, {
            '经销商': outlet['客户名称'],
            '上月-目标(PC)': limitlowSt, '上月-淡旺季': seasonTypeSt, '上月-其它产品': salesOtherSt, '上月-魔爪': salesMSt, '上月-B项：纯悦': salesWSt,
            '上月-B项：上月-怡泉+C': salesCSt, '上月-合计': salesSumSt, '上月-进货达标SKU数': skuNumSt, '上月-C项：淡旺季进货是否达标': isCSt, '上月-A项：销量达成率': (rateSumSt * 100).toFixed(2) + '%',
            '目标(PC)': limitlow, '淡旺季': seasonType, '其它产品': salesOther, '魔爪': salesM, 'B项：纯悦': salesW,
            'B项：怡泉+C': salesC, '合计': salesSum, '进货达标SKU数': skuNum, 'C项：淡旺季进货是否达标': isC,
            'A项：销量达成率': (rateSum * 100).toFixed(2) + '%', '折扣标准：魔爪': uniABC2P, '折扣标准：A项、B项、C项': uniABC2P,
            '计算金额': amt2P, '魔爪计算金额': amtM2P, '合计金额': amt2P + amtM2P, '备注': ''
        });
    }
}


function savecase4Version(req, res, cb) {
    var period = req.body.period;
    var vno = req.body.vno;
    var vname = req.body.vname;
    var collectionName = 'case4result' + period + 'v' + vno;
    var collectionsaveName = 'case4saveresult' + period + 'v' + vno;
    var vdoc = { "周期": period, "版本": vno, "描述": vname, "保存时间": Date(), "修改时间": Date(), "操作人": "", "状态": 1 };
    vdoc = toJson(vdoc);
    // console.log('vdoc=' + vdoc);
    params.paramNoDb("versions", function (fields) {
        var SchemaParams = eval("(" + fields + ")");
        // console.log('scmm=' + fields)
        versionSchema.add(SchemaParams);
        var nonKaModel = mongoose.model(collectionsaveName, salesSchema, collectionName);
        nonKaModel.remove({}, function (err, result) {
            getCalcResult(req, res,'save', function (docs) {
                docs = JSON.parse(JSON.stringify(docs))
                docs = eval(docs);
                for (var key in docs) {
                    docs[key] = _.extend({ 'collname': 'body' }, docs[key]);
                }

                params.getHeader('case4', function (header) {
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

function savecase4Version2p(req, res, cb) {
    var period = req.body.period;
    var vno = req.body.vno;
    var vname = req.body.vname;
    var collectionName = 'case4result2p' + period + 'v' + vno;
    var collectionsaveName = 'case4saveresult2p' + period + 'v' + vno;
    var vdoc = { "周期": period, "版本": vno, "描述": vname, "保存时间": Date(), "修改时间": Date(), "操作人": "", "状态": 1 };
    vdoc = toJson(vdoc);
    // console.log('vdoc=' + vdoc);
    params.paramNoDb("versions", function (fields) {
        var SchemaParams = eval("(" + fields + ")");
        // console.log('scmm=' + fields)
        versionSchema.add(SchemaParams);
        var nonKaModel = mongoose.model(collectionsaveName, salesSchema, collectionName);
        nonKaModel.remove({}, function (err, result) {
            getCalcResult2p(req, res,'save', function (docs) {
                // console.log('dddddd='+docs)
                docs = JSON.parse(JSON.stringify(docs))
                docs = eval(docs);
                for (var key in docs) {
                    docs[key] = _.extend({ 'collname': 'body' }, docs[key]);
                }
                params.getHeader('case4', function (header) {
                    docs.unshift({ 'name': 'agreements', 'params': header.agreement });
                    docs.unshift({ 'collname': 'header', 'params': header });

                    nonKaModel.collection.insert(docs, function (err, d) {
                        if (err) {
                            cb('保存失败' + err);
                        } else {
                            versionModel2p.update({ '周期': period, '版本': vno },
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
        savecase4Version(req, res, cb);
    } else {
        versionModel.count({ '周期': period, '版本': vno }, function (err, count) {
            if (count == 0) {
                savecase4Version(req, res, cb);
            } else {
                cb("该版本已经存在,是否覆盖")
            }
        })
    }
}

function checkVersion2p(req, res, cb) {
    var period = req.body.period;
    var vno = req.body.vno;
    var over = req.body.over;
    if (over == 'ok') {
        savecase4Version2p(req, res, cb);
    } else {
        versionModel2p.count({ '周期': period, '版本': vno }, function (err, count) {
            if (count == 0) {
                savecase4Version2p(req, res, cb);
            } else {
                cb("该版本已经存在,是否覆盖")
            }
        })
    }
}

///获取grid表头格式
function getGrid(cb) {
    params.paramNoDb("case4calcResultGrid", function (result) {
        cb(result);
    });
}

function getGrid2p(cb) {
    params.paramNoDb("case4calcResultGrid2p", function (result) {
        cb(result);
    });
}

// cb({ "excelHeader": excelHeader, "docs": docs });
var methods = {
    'getCalcResult': getCalcResult,
    'getCalcResult2p': getCalcResult2p,
    'savecase4Version': savecase4Version,
    'savecase4Version2p': savecase4Version2p,
    'checkVersion': checkVersion,
    'checkVersion2p': checkVersion2p,
    'getDataForExcel': getDataForExcel,
    'getDataForExcel2p': getDataForExcel2p,
    'getGrid': getGrid,
    'getGrid2p': getGrid2p,
};
module.exports = methods;