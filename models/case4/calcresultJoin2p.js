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

outletSchema.methods.getSales = function (cb) {
    salesModel.find({ 'MM售点': JSON.parse(JSON.stringify(this))['售点'], '周期': endPeriod }, cb);
};

//上月销量
outletSchema.methods.getSalesPer = function (cb) {
    salesModel.find({ 'MM售点': JSON.parse(JSON.stringify(this))['售点'], '周期': startPeriod }, cb);
};


var salesModel = mongoose.model('case4sales2p', salesSchema, 'case4sales');
var versionResultModel = mongoose.model('case4versionResult2p', versionResultSchema, 'case4versionResults');
var versionModel = mongoose.model('case4version2p', versionSchema, 'case4versions');
var outletModel = mongoose.model('case4outlet2p', outletSchema, 'case4outlettemps');//schema关联要放在方法定义后面，否则使用的时候找不到方法。
var packageModel = mongoose.model('case4package2p', salesSchema, 'case4packages');

function getCalcResult(req, res, cb) {
    getCalcResultDate(req, res, 'grid', cb);
}

///获取导出到excel的mongodb数据

function getDataForExcel(req, res, cb) {
    params.paramNoDb("case4calcResultExcel", function (result) {
        getCalcResultDate(req, res, 'excel', function (docs) {
            cb({ "excelHeader": result, "docs": docs });
        });
    })
}


function getCalcResultDate(req, res, dataType, cb) {
    var now = new Date();
    var period = (req.body.period) ? parseInt(req.body.period.substring(4, 7)) : now.getMonth() + 1;//月份，用于在表取淡旺季的目标
    var period2 = req.body.period;//当月的周期YYYYMM

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

    // console.log('p=' + startPeriod)

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
        condition += "'售点':/" + outlet + "/";
    }

    if (name) {
        if (condition) condition += ","
        condition += "'客户名称':/" + name + "/";
    }

    // console.log('outlet='+condition)
    condition = eval("({" + condition + "})");
    checkOutlets = {};

    outletModel.count(condition, function (err, count) {
        var total = count;
        ///find  
        outletModel.find(condition, function (err, outlets) {
            //console.log(outlets);
            var docs = [];
            var rowId = 0;
            var promises = outlets.map(function (outlet) {
                var checkResult, sales, active, contract;
                return Q.Promise(function (resolve, reject) {
                    outlet.getCheckResult(function (err, checkResult) {
                        outlet.getSales(function (err, sales) {
                        });
                    });
                });
            });

            Q.all(promises).then(function () {
                var totalDocs = JSON.stringify(docs);
                if (dataType == 'grid') {
                    cb(totalDocs);
                } else if (dataType == 'excel') {
                    cb(docs);
                }
            });
        }).select('-_id -__v').sort({ '售点': 1 });
        // }).sort({'考核销量售点':1}).limit(rows).skip(skip);
        ///end find
    });
}

////////////////////////////////

///客户资料，协议设置，检查结果，MM销量，周期，行Id
function getCalcResultViewModel(outlet, checkResult, sales, active, contract, period, period2, rowId, deliver, deliverPer, salesPer) {
    // console.log('checkResult='+outlet);
    outlet = toJson(outlet);
    checkResult = toJson(checkResult);
    sales = toJson(sales);
    deliver = toJson(deliver);
    active = toJson(active);
    contract = toJson(contract);
    salesPer = toJson(salesPer);
    deliverPer = toJson(deliverPer);
    // console.log('deliverPer='+deliverPer)


    var seasonType = outlet['P' + period];//售点对应的淡旺季类型
    var uni = parseFloat(outlet['折扣标准元/PC']);//折扣标准
    var limitup = 0;//上限
    var limitlow = 0;//下限
    var ordernum = checkResult ? checkResult['抽查订单数(C)'] : 0;
    var outletnum = active ? active['Passed'] : 0;//活跃下家客户数
    var outlettype = outlet['合作伙伴类型'];
    var isOutletnumOK = 'N';//下家客户数是否达标
    var isCheck = 'N';//督导抽查是否有10个订单
    var isContract = contract ? contract['合同是否合格（Y/N)'] : '';//协议是否合格
    var bu = outlet['BU'];
    var startDate = outlet['启动时间']
    var city = outlet['市场区隔'];
    var award = 0;//奖励

    if (seasonType == '淡') {
        limitup = outlet['淡季上限(箱)'];
    } else {
        limitup = outlet['旺季上限(箱)'];
    }
    var limitlow = outlet['目标销量'];
    var type = outlet['机制类型'];
    var mmsales = sales ? parseFloat(sales['销量']) : 0;
    var deliverSales = deliver ? parseFloat(deliver['配送量']) : 0;
    var mmsalesPer = salesPer ? parseFloat(salesPer['销量']) : 0;
    mmsalesPer += mmsales;
    var deliverSalesPer = deliverPer ? parseFloat(deliverPer['配送量']) : 0;
    deliverSalesPer += deliverSales;
    var transRate1 = deliverSalesPer / mmsalesPer;
    var transRate2 = deliverSales / mmsales;



    //小型至少10家、中型至少30家进货量、大型至少50家
    //检查下家客户数是否达标isOutletnumOK
    if (bu == '粤东' && type != 'RB') {
        if (outlettype == '大型' && parseInt(outletnum) >= 50) {
            isOutletnumOK = 'Y';
        } else if (outlettype == '中型' && parseInt(outletnum) >= 30) {
            isOutletnumOK = 'Y';
        } else if (outlettype == '小型' && parseInt(outletnum) >= 10) {
            isOutletnumOK = 'Y';
        }
    } else if (bu == '粤西' && type != 'RB') {
        if (city == '城市') {
            if (outlettype == '小型' && parseInt(outletnum) >= 20) {
                isOutletnumOK = 'Y';
            } else if (outlettype == '中型' && parseInt(outletnum) >= 35) {
                isOutletnumOK = 'Y';
            } else if (outlettype == '大型' && parseInt(outletnum) >= 50) {
                isOutletnumOK = 'Y';
            }
        } else {//乡村
            if (outlettype == '小型' && parseInt(outletnum) >= 10) {
                isOutletnumOK = 'Y';
            } else if (outlettype == '中型' && parseInt(outletnum) >= 17) {
                isOutletnumOK = 'Y';
            } else if (outlettype == '大型' && parseInt(outletnum) >= 25) {
                isOutletnumOK = 'Y';
            }
        }
    }

    //订单抽查达标
    if (ordernum >= 10 && bu == '粤东') {
        isCheck = 'Y';
    } else if (ordernum >= 5 && bu == '粤西') {
        isCheck = 'Y';
    }



    if (type == 'RB') {
        if (bu == '粤东') {
            if (parseInt(outletnum) >= 10) {
                isOutletnumOK = 'Y';
            }
        } else {//粤西
            if (parseInt(period2) > parseInt(startDate.substring(0, 6))) {
                if (parseInt(outletnum) >= 30) isOutletnumOK = 'Y';
            } else if (parseInt(outletnum) >= 15) {
                isOutletnumOK = 'Y';
            }
        }
        if (isOutletnumOK == 'Y' && isContract == 'Y' && mmsales >= limitlow) {
            var mmsales2 = mmsales;
            if (mmsales > limitup) mmsales2 = limitup;
            award = mmsales2 * uni;
        }
    } else if (bu == '粤东') {//包装
        if (isOutletnumOK == 'Y' && isCheck == 'Y' && isContract == 'Y') {
            var mmsales2 = mmsales;
            if (mmsales > limitup) mmsales2 = limitup;
            award = mmsales2 * uni;
        }
    } else {//粤西包装
        if (isOutletnumOK == 'Y' && isCheck == 'Y' && isContract == 'Y') {
            var mmsales2 = mmsales;
            if (transRate1 < 1 || transRate2 < 1) mmsales2 = deliverSales//如果透明度小于1，按配送量计算返还
            if (mmsales2 > limitup) mmsales2 = limitup;
            award = mmsales2 * uni;
        }
    }
    //"机制", "BU", "办事处", "合作伙伴售点", "合作伙伴SAP售点", "名称", "启动时间", "合同签署开始时间", 
    //"合作伙伴类型", "本月下家客户数(≥10PC)",
    // "本月下家客户数是否达标", "淡旺季", "上限", "进货量", "督导抽查", "协议是否合格", " 返还结果 ", "备注"
    return _.extend(outlet, active, contract, {
        '目标销量': limitlow, '上限': limitup, '合同签署开始时间': contract['合同开始时间']
        , '2个月进货量': mmsalesPer, '2个月配送量': deliverSalesPer, '2个月透明度': (transRate1 * 100).toFixed(2) + '%', '进货量': mmsales, '配送量': deliverSales, '透明度': (transRate2 * 100).toFixed(2) + '%'
        , '合作伙伴售点': outlet['售点'], '合作伙伴SAP售点': outlet['SAP售点'], '本月下家客户数(≥10PC)': outletnum, '本月下家客户数是否达标': isOutletnumOK, '淡旺季': seasonType, '督导抽查': isCheck, '协议是否合格': isContract, '返还结果': award.toFixed(2), '备注': ''
    });
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
        nonKaModel = mongoose.model(collectionsaveName, salesSchema, collectionName);
        nonKaModel.remove({}, function (err, result) {
            getCalcResult(req, res, function (docs) {
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

///获取grid表头格式
function getGrid(cb) {
    params.paramNoDb("case4calcResultGrid", function (result) {
        cb(result);
    });
}

// cb({ "excelHeader": excelHeader, "docs": docs });
var methods = {
    'getCalcResult': getCalcResult,
    'savecase4Version': savecase4Version,
    'checkVersion': checkVersion,
    'getDataForExcel': getDataForExcel,
    'getGrid': getGrid
};
module.exports = methods;