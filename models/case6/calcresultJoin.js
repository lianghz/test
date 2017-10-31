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
var salesSchema = mongoose.Schema();
var deliverSchema = mongoose.Schema();
var contractSchema = mongoose.Schema();
var standardSchema = mongoose.Schema();
var versionResultSchema = mongoose.Schema();
var versionSchema = mongoose.Schema();

var salesModel = mongoose.model('case6sales', salesSchema, 'case6sales');
var deliverModel = mongoose.model('case6deliver2', deliverSchema, 'case6delivers');
var contractModel = mongoose.model('case6contract2', contractSchema, 'case6contracts');
var standardModel = mongoose.model('case6standard2', standardSchema, 'case6standars');
var versionResultModel = mongoose.model('case6versionResult2', versionResultSchema, 'case6versionResults');
var versionModel = mongoose.model('case6version', versionSchema, 'case6versions');
var outletModel = mongoose.model('case6outlet2', outletSchema, 'case6outlets');//schema关联要放在方法定义后面，否则使用的时候找不到方法。



var startPeriod = '';
var endPeriod = '';
var checkOutlets = {};//保存考核售点所对应售点的奖励金额合计、销量合计

function toJson(element) {
    return JSON.parse(JSON.stringify(element));
}

checkOutlets = toJson(checkOutlets);

function getCalcResult(req, res, cb) {
    getCalcResultDate(req, res, 'grid', cb);
}

///获取导出到excel的mongodb数据

function getDataForExcel(req, res, cb) {
    params.paramNoDb("case6calcResultExcel", function (result) {
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
    var type = req.body.type;
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
        type = req.query.type;
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
    if (type) {
        if (condition) condition += ","
        condition += "'类型':/" + type + "/";
    }
    if (loc) {
        if (condition) condition += ","
        condition += "'办事处':/" + loc + "/";
    }
    if (outlet) {
        if (condition) condition += ","
        condition += "'售点编号':/" + outlet + "/";
    }

    if (name) {
        if (condition) condition += ","
        condition += "'客户名称':/" + name + "/";
    }

    // console.log('condition='+condition)
    condition = eval("({" + condition + "})");
    checkOutlets = {};
    var outlets;
    var mainOutlets;
    var sales;
    var delivers;
    var contracts;
    var standards;
    var asyncFunc = {
        getMainOutlets: function (asycb, results) {//获取考核销量售点
            outletModel.find(condition, function (err, docs) {
                outlets = docs;
                mainOutlets = _.pluck(toJson(outlets), 'MM售点');
                asycb();
            })
        },
        getStandards: ['getMainOutlets', function (asycb, results) {
            standardModel.find({}, function (err, docs) {
                standards = docs
                asycb();

            });
        }],
        getSales: ['getMainOutlets', function (asycb, results) {
            salesModel.find({ '周期': period2, 'MM售点': { $in: mainOutlets } }, function (err, docs) {
                sales = docs
                asycb();
            });
        }],
        getDelivers: ['getMainOutlets', function (asycb, results) {
            deliverModel.find({ '周期': period2, 'MM售点': { $in: mainOutlets } }, function (err, docs) {
                 delivers = docs
                asycb();
            });
        }],        
        getContracts: ['getMainOutlets', function (asycb, results) {
            contractModel.find({ 'MM售点': { $in: mainOutlets } }, function (err, docs) {
                contracts = docs;
                asycb();
            });
        }],
        getResults: ['getSales', 'getDelivers','getContracts', 'getStandards', function (asycb, results) {
            var docs = getCalcResultViewModel(outlets, sales,delivers, contracts, standards, period, period2);
            cb(docs);
        }],

    };
    async.auto(asyncFunc);
}

////////////////////////////////

function getCalcResultViewModel(outlets, sales,delivers, contracts, standards, period, period2) {
    var results = [];
    outlets = toJson(outlets);
    sales = toJson(sales);
    contracts = toJson(contracts);
    standards = toJson(standards);
    delivers = toJson(delivers);

    _.map(outlets, function (item) {
        var outletCondition = eval("(" + JSON.stringify(_.pick(item, 'MM售点')) + ")");
        var standardCondition = eval("(" + JSON.stringify(_.pick(item, 'BU', '渠道')) + ")");
        var sale = _.where(sales, outletCondition);
        var deliver = _.where(delivers, outletCondition);
        var contract = _.where(contracts, outletCondition);
        var standard = _.where(standards, standardCondition);
        var discount = toJson("{'销售折扣合计':''}");
        var type = '一次性';
        var outlet = _.extend(item,sale[0],deliver[0], contract[0], standard[0], discount,item);
        if (outlet['类型'] == '一次性') {
            type = '一次性折扣/PC';
        } else if (outlet['类型'] == 'RB') {
            type = 'RB折扣/PC';
        }
        outlet['进货量'] =outlet['销量'];
        outlet['标准'] =outlet[type];
        outlet['是否签署合同'] =outlet['合同是否合格（Y/N)'];
        if(outlet['是否签署合同']=='Y'){
            outlet['销售折扣合计'] = outlet['销量']?(parseFloat(outlet['销量']) * parseFloat(outlet['标准'])).toFixed(2):0.00;
            if(outlet['启动周期']>period2 && outlet['配送量']<=0)
            {
                outlet['销售折扣合计'] = 0;
                outlet['备注'] ='无配送量';
            }
        }

        // console.log('outletCondition=' + JSON.stringify(outlet));
        
        results.push(outlet);
    })
    return results;
}

function savecase6Version(req, res, cb) {
    var period = req.body.period;
    var vno = req.body.vno;
    var vname = req.body.vname;
    var collectionName = 'case6result' + period + 'v' + vno;
    var collectionsaveName = 'case6saveresult' + period + 'v' + vno;
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

                params.getHeader('case6', function (header) {
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
        savecase6Version(req, res, cb);
    } else {
        versionModel.count({ '周期': period, '版本': vno }, function (err, count) {
            if (count == 0) {
                savecase6Version(req, res, cb);
            } else {
                cb("该版本已经存在,是否覆盖")
            }
        })
    }
}

///获取grid表头格式
function getGrid(cb) {
    params.paramNoDb("case6calcResultGrid", function (result) {
        cb(result);
    });
}

// cb({ "excelHeader": excelHeader, "docs": docs });
var methods = {
    'getCalcResult': getCalcResult,
    'savecase6Version': savecase6Version,
    'checkVersion': checkVersion,
    'getDataForExcel': getDataForExcel,
    'getGrid': getGrid
};
module.exports = methods;