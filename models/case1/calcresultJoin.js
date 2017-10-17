/**
 * 功能：计算返还结果，保存结果；
 * 通过客户资料（tempoutlet），关联协议文档、检查结果文档、销量文档，根据计算逻辑计算结果；
 * 通过保存功能，把计算结果保存起来；
 * 每个结果按版本信息保存到一个独立的文档中；
 * 每个版本结果作为历史记录，可以翻查。
 * 
 */

var params = require("../../modules/params.js");
var mongoose = require('mongoose');
var Q = require('q');
var _ = require('underscore');
var async = require('async');

///---定义schema model
var setArgeementSchema = mongoose.Schema();
var checkResultSchema = mongoose.Schema();
var salesSchema = mongoose.Schema();
var nonKaSchema = mongoose.Schema();
var versionSchema = mongoose.Schema();

var setArgeementModel = mongoose.model('setagreement', setArgeementSchema);
var checkResultModel = mongoose.model('checkresult', checkResultSchema);
var salesModel = mongoose.model('salesmm2', salesSchema, 'salesmms');
var nonKaModel = mongoose.model('nonkaversion', nonKaSchema);
var versionModel = mongoose.model('versions', versionSchema, 'versions');

var checkOutlets = {};//保存考核售点所对应售点的奖励金额合计、销量合计

function toJson(element) {
    return JSON.parse(JSON.stringify(element));
}

checkOutlets = toJson(checkOutlets);

//outle model 关联其它documents
var outletSchema = mongoose.Schema();
outletSchema.methods.getSetArgeement = function (cb) {
    setArgeementModel.find({ 'SAP售点': JSON.parse(JSON.stringify(this))['SAP售点'] }, cb);
};
outletSchema.methods.getCheckResult = function (cb) {
    checkResultModel.findOne({ 'SAP售点': JSON.parse(JSON.stringify(this))['SAP售点'] }, cb);
};
outletSchema.methods.getSales = function (cb) {
    salesModel.findOne({ 'SAP售点': JSON.parse(JSON.stringify(this))['SAP售点'] }, cb);
};
var outletModel = mongoose.model('outlet2', outletSchema, 'outlettemps');

function getCalcResult(req, res, cb) {
    var now = new Date();
    var period = (req.body.period) ? parseInt(req.body.period.substring(4, 7)) : now.getMonth() + 1;
    // console.log('p=' + period)
    var loc = req.body.loc;
    var outlet = req.body.outlet;
    var name = req.body.name;
    var rows = parseInt(req.body.rows);
    var page = parseInt(req.body.page);
    if (!req.body.period) {
        period = (req.query.period) ? parseInt(req.query.period.substring(4, 7)) : now.getMonth() + 1;
        loc = req.query.loc;
        outlet = req.query.outlet;
        name = req.query.name;
        rows = parseInt(req.query.rows);
        page = parseInt(req.query.page);
    }
    var skip = (page - 1) * rows;

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

    var arr = [{ $match: condition }, { $sort: { "考核销量售点": -1 } }, { $group: { "_id": "$考核销量售点" } }, { $skip: skip }, { $limit: rows }];
    if (!rows)
        arr = [{ $match: condition }, { $sort: { "考核销量售点": -1 } }, { $group: { "_id": "$考核销量售点" } }];

    var asyncFunc = {
        getMainOutlets: function (asycb, results) {//获取考核销量售点
            outletModel.aggregate(arr, function (err, outlets) {
                asycb(err, outlets);
            })
        },
        getAgreements: function (asycb, results) {
            params.paramDb("agreements", "agreement", function (agreements) {
                //  console.log('agreements='+agreements);
                asycb(null, agreements);
            })
        },
        loopMainOutlets: ['getMainOutlets', 'getAgreements', function (asycb, results) {//遍历考核售点
            // console.log('results[id]=' + JSON.stringify(results));
            // console.log('loopMainOutlets-loopMainOutlets');
            var i = 0;
            var mainOutlets = results['getMainOutlets'];
            var agreements = results['getAgreements'];
            //  console.log('agreements1='+agreements);
            var outletCount = mainOutlets.length;
            var docs = [];
            mainOutlets.map(function (mainOutlet) {//遍历考核售点
                asyncFunc = {
                    getOutlets: function (asycb, results) {//取客户资料
                        outletModel.find({ '考核销量售点': mainOutlet['_id'] }, function (err, docs) {
                            outlets = docs;
                            sapOutlets = _.map(docs, function (mainOutlet) {
                                return toJson(mainOutlet)['SAP售点'];
                            });
                            // console.log('loopMainOutlets-getOutlets');
                            asycb(null, mainOutlet, sapOutlets, docs);
                        })
                    },
                    getSetArgeement: ['getOutlets', function (asycb, results) {//取协议配置
                        setArgeementModel.find({ 'SAP售点': { $in: results['getOutlets'][1] } }, function (err, docs) {
                            // console.log('loopMainOutlets-getSetArgeement');
                            asycb(null, docs);
                        })
                    }],
                    getCheckResult: ['getOutlets', function (asycb, results) {//取生动化检查结果
                        checkResultModel.find({ 'SAP售点': { $in: results['getOutlets'][1] } }, function (err, docs) {
                            // console.log('loopMainOutlets-getCheckResult');
                            asycb(null, docs);
                        })
                    }],
                    getSales: ['getOutlets', function (asycb, results) {//取销量
                        salesModel.find({ 'SAP售点': { $in: results['getOutlets'][1] } }, function (err, docs) {
                            // console.log('loopMainOutlets-getSales');
                            asycb(null, docs);
                        })
                    }],
                    calcResult: ['getSetArgeement', 'getCheckResult', 'getSales', function (asycb, results) {//计算结果
                        i++;
                        // console.log('loopMainOutlets-calcResult='+JSON.stringify(results));
                        var result = getCalcResultViewModel2(period, results['getOutlets'][0]['_id'], toJson(results['getOutlets'][2]),
                            toJson(results['getSetArgeement']), toJson(results['getCheckResult']), toJson(results['getSales']), agreements);
                        docs.push(result);
                        if (i == outletCount) {
                            // ReturnResult(i);
                            //var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"
                            var totalDocs = JSON.stringify(docs);
                            cb(totalDocs);
                        }
                    }]
                };
                async.auto(asyncFunc);
            })
            // asycb();
        }]
    };
    async.auto(asyncFunc);
    // outletModel.find(condition, function (err, outlets) {
    //     var docs = [];
    //     var rowId = 0;
    //     var promises = outlets.map(function (outlet) {//这是号称魔鬼金字塔的回调嵌套开始，想办法解决
    //         var setArgeement, checkResult, sales;
    //         return Q.Promise(function (resolve, reject) {
    //             outlet.getSetArgeement(function (err, setArgeement) {
    //                 outlet.getCheckResult(function (err, checkResult) {
    //                     outlet.getSales(function (err, sales) {
    //                         params.paramDb("agreements", "agreement", function (agreements) {
    //                             outlet = getCalcResultViewModel(outlet, setArgeement, checkResult, sales, period, rowId, agreements);
    //                             rowId++;
    //                             docs.push(outlet);
    //                             resolve();
    //                         })
    //                     });
    //                 });
    //             });
    //         });
    //     });

    //     Q.all(promises).then(function () {
    //         //console.log("checkoutlet=" + JSON.stringify(checkOutlets));
    //         for (var key in checkOutlets) {
    //             var rowId = checkOutlets[key]['rowId'];//rowid 指示了考核售点所在的行
    //             var amt = checkOutlets[key]['奖励合计'];//总奖励金额
    //             var actual = checkOutlets[key]['合计实际收入'];

    //             //var targetSales = docs[rowId]['销量目标/元/月'];//目标收入
    //             var targetSales = checkOutlets[key]['合计目标收入'];//目标收入

    //             var rate = targetSales ? actual / targetSales : 0;//收入达成率

    //             //达成率小于0.5不奖励，0.5到1，奖励一半，大于等于1，全部奖励
    //             rate = rate < 0.5 ? 0 : rate;
    //             rate = (rate > 0.5 && rate < 1) ? 0.5 : rate;
    //             rate = rate >= 1 ? 1 : rate;
    //             // console.log('rate2=' + rate)
    //             // console.log("============================")
    //             amt = amt * rate;//计算实际奖励
    //             amt = amt.toFixed(2);
    //             if (rowId > -1) {
    //                 var disc = docs[rowId]['折扣/月/元'];//奖励目标
    //                 if (!disc) disc = 0;
    //                 // console.log('disc='+disc);
    //                 if (amt > disc) amt = disc;//如果奖励比目标多则取目标

    //                 docs[rowId]['计算结果合计（包含销量考核）'] = amt;//通过rowId更新考核售点所对应的合计值对应的字段
    //                 docs[rowId]['合计目标收入'] = targetSales;
    //                 docs[rowId]['合计实际收入'] = actual;
    //                 // console.log('amt2='+targetSales+'-'+amt);
    //             }
    //             // console.log(rowId);
    //             // console.log(amt);
    //         }
    //         docs = _.sortBy(docs, function (num) {//通过underscore来排序，始终有不妥
    //             if (parseInt(num['考核销量售点']) - parseInt(num['SAP售点']) == 0) {
    //                 return '' + num['考核销量售点'] + 1;
    //             } else {
    //                 return '' + num['考核销量售点'] + 2;
    //             }
    //         })
    //         // var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"
    //         var totalDocs = JSON.stringify(docs);
    //         cb(totalDocs);
    //     });
    // }).select('-_id -__v').sort({ '考核销量售点': 1 });
}
// }).sort({'考核销量售点':1}).limit(rows).skip(skip);
///end find

function getCalcResultViewModel2(period, mainOutlet, outlets, setArgeements, checkResults, saless, agreements) {
    // console.log('mainOutlet='+JSON.stringify(mainOutlet));
    // console.log('outlets='+JSON.stringify(outlets));
    // console.log('setArgeement=' + JSON.stringify(setArgeements));
    // console.log('checkResult='+JSON.stringify(checkResult));
    // console.log('sales='+JSON.stringify(sales));
    // console.log('agreements='+agreements);
    // console.log('=================================================================');

    // console.log('outlets='+JSON.stringify(outlets));
    agreements = toJson(eval("(" + agreements + ")"));
    
    var awardSum = 0, salesTargetSum = 0, revenueSum=0,discTargetSum=0;//所有门店的奖励、收入目标合计际收入合计
    var result,mainResult;
    var subResult = [];
    outlets.forEach(function (element) {//同一总店下的门店遍历
        var discTarget=0;//目标折扣，只在销量考核售点
        var outlet = element['SAP售点'];
        var setArgeement = _.where(setArgeements, { 'SAP售点': outlet });
        var checkResult = _.where(checkResults, { 'SAP售点': outlet })[0];
        var sales = _.where(saless, { 'SAP售点': outlet });
        // console.log('sales='+JSON.stringify(sales))
        var revenue = 0, salesTarget = 0;//单个门店的收入、销量目标
        var seasonType = element['P' + period];//售点对应的淡旺季类型

        //奖励方法
        //淡旺季数量
        //淡旺季奖励
        var awardTypes, busySeasonQuantity, slackSeasonQuantity, busySeasonAward, slackSeasonAward, seasonQuantity, seasonAward;
        var awardResult = {};
        setArgeement.forEach(function (element) {//一个门店的协议遍历
            // element = toJson(element);
            var dataType = element['数据类型'];

            switch (dataType) {
                case '奖励方法':
                    awardTypes = element;
                    break;
                case '淡季数量':
                    slackSeasonQuantity = element;
                    break;
                case '淡季奖励':
                    slackSeasonAward = element;
                    break;
                case '旺季数量':
                    busySeasonQuantity = element;
                    break;
                case '旺季奖励':
                    busySeasonAward = element;
                    break;
                case '数量':
                    seasonQuantity = element;
                    break;
                case '奖励':
                    seasonAward = element;
                    break;
            }
        });
        ///淡季销量目标/元/月,旺季销量目标/元/月,淡季折扣/月/元,旺季折扣/月/元
        ///"销量目标/元/月", "折扣/月/元"

        switch (seasonType) {
            case '淡':
                seasonQuantity = slackSeasonQuantity;
                seasonAward = slackSeasonAward;
                salesTarget = element['淡季销量目标/元/月'];
                discTarget = element['淡季折扣/月/元'];
                break;
            case '旺':
                seasonQuantity = busySeasonQuantity;
                seasonAward = busySeasonAward;
                salesTarget = element['旺季销量目标/元/月'];
                discTarget = element['旺季折扣/月/元'];
                break;
            default:
                salesTarget = element['销量目标/元/月'];
                discTarget = element['折扣/月/元'];
                break;
        }

        ///奖励计算
        awardResult = _.extend(awardResult, seasonQuantity);//目的是拷贝一个结构给awardResult，即{'SAP售点':1234,'数据类型':'数量','甲方冰柜':1,'乙方货架排面-全系列',:7... ...}
        //遍历每个生动化检查项目的奖励方法、生动化要求数量、生动化奖励、检查结果
        // console.log('checkResult='+JSON.stringify(checkResult));
        var awardSum1 = 0;//单个门店的奖励合计
        for (key in agreements) {//一个门店的奖励遍历
            if (!awardTypes) break;//奖励方法
            // console.log('awardTypes='+key+'='+JSON.stringify(seasonQuantity))
            var awardType = awardTypes ? awardTypes[key] : '';//奖励方法是比例还是达标
            var quantity = seasonQuantity ? seasonQuantity[key] : 0;//生动化检查要求的数量
            var award = seasonAward ? seasonAward[key] : 0;//生动化检查给与的奖励
            var checkQuantity = checkResult[key];//检查结果
            outlet['备注'] = seasonQuantity ? '' : '该售点没有设置协议';
            checkQuantity = (checkQuantity == 'Y' ? quantity : (!isNaN(checkQuantity) ? checkQuantity : 0));//这里做个转换，如果检查结果是Y，则表示达标，把检查结果的值改为目标值，如果不是Y且不是数字则改为0，否则直接取数值。
            checkQuantity = parseInt(checkQuantity);
            checkQuantity = checkQuantity > quantity ? quantity : checkQuantity;
            // console.log('checkQuantity='+checkQuantity)

            if (awardType == '达标') {
                checkQuantity = checkQuantity >= quantity ? quantity : 0;//如果奖励方法是达标，即要求要100%满足条件，所以如果检查数量不等于要求数据，则不合格了。目的是把达标的算法转为与比例相同的方法。
            }
            awardResult[key] = award * checkQuantity / quantity;//奖励金额乘以比例得出实际奖励金额，按生动化项目保存到奖励结果中。
            // console.log('awardResult='+awardResult[key]);
            // awardSum += (!isNaN(awardResult[key]) ? awardResult[key] : 0);//经过所有循环后，合计了该考核售点下的所有门店的奖励、实际收入、及目标收入
            awardSum += awardResult[key];
            awardSum1 += awardResult[key];
        }
        revenue = sales[0] ? parseInt(sales[0]["收入"]) : 0;
        revenueSum += revenue;//取售点的收入
        // if (!checkOutlets[outletKey]) checkOutlets = _.extend(checkOutlets, checkOutlet);//checkOutlets 全局变量，checkOutlet 保存{考核售点:{各种合计值}}，
        // awardSum += awardSum;//经过所有循环后，合计了该考核售点下的所有门店的奖励、实际收入、及目标收入
        salesTarget = salesTarget ? parseFloat(salesTarget) : 0;
        salesTargetSum += salesTarget;
        discTargetSum +=discTarget?parseFloat(discTarget):0;
        //var targetResult = eval("({'计算结果（元）（不含销量考核）':"  seasonAward+ awardSum1.toFixed(2) + ",'销量目标/元/月':" + salesTarget1 + ",'折扣/月/元':" + discTarget + ",})");
        element['费用时间段'] = 'P' + period;
        // console.log('salesTarget=' + salesTarget)
        result = _.extend(element, {
            '实际收入（元）': revenue, '计算结果（元）（不含销量考核）': awardSum1.toFixed(2), '销量目标/元/月': salesTarget, '折扣/月/元': discTarget,
            '生动化目标': seasonAward, '生动化检查结果': checkResult, '生动化奖励计算': awardResult, '售点销量': sales
        });
        if (mainOutlet != outlet) {
            subResult.push(_.extend(element, {
                '实际收入（元）': revenue, '计算结果（元）（不含销量考核）': awardSum1.toFixed(2), '销量目标/元/月': salesTarget, '折扣/月/元': discTarget,
                '生动化目标': seasonAward, '生动化检查结果': checkResult, '生动化奖励计算': awardResult, '售点销量': sales
            }));
        }
        else{
            mainResult = result;
        }
    })///一组门店合计结束

    ///"销量目标/元/月", "折扣/月/元"
    if (awardSum == '') awardSum = 0.0;
    if (salesTargetSum == '') salesTargetSum = 0.0;
    if (discTargetSum == '') discTargetSum = 0.0;
    var rate = salesTargetSum ? revenueSum / salesTargetSum : 0;//所有门店的收入与目标收入的比例
    rate = rate < 0.5 ? 0 : rate;
    rate = (rate > 0.5 && rate < 1) ? 0.5 : rate;
    rate = rate >= 1 ? 1 : rate;
    // console.log('discTargetSum=' + discTargetSum)
    // console.log("============================")
    awardSum = awardSum * rate;//计算销量考核金额
    // awardSum = awardSum.toFixed(2);
    if (awardSum > discTargetSum) awardSum = discTargetSum;//如果奖励大于目标折扣则只返还目标折扣
    // console.log('awardSum=' + awardSum);
    //outlet, setArgeement, checkResult, sales, period, agreements
    // var checkOutlet = eval("({'" + outletKey + "':{'奖励合计':" + awardSum + "0,'合计目标收入':" + salesTargetSum + ",'合计实际收入':" + revenueSum + "}})");

    //var checkOutlet = eval("({'" + outletKey + "':'0'})");
    // checkOutlet = toJson(checkOutlet);

    return _.extend(mainResult, { '计算结果合计（包含销量考核）': awardSum.toFixed(2), '合计目标收入': salesTargetSum, '合计实际收入': revenueSum, '门店结果': subResult });
}//outletModel.find({'考核销量售点':})
////////////////////////////////


//保存结果
function saveNonKaVersion(req, res, cb) {
    var period = req.body.period;
    var vno = req.body.vno;
    var vname = req.body.vname;
    var collectionName = 'nonka' + period + 'v' + vno;
    var collectionsaveName = 'savenonka' + period + 'v' + vno;
    var vdoc = { "周期": period, "版本": vno, "描述": vname, "保存时间": Date(), "修改时间": Date(), "操作人": "", "状态": 1 };
    vdoc = toJson(vdoc);
    // console.log('vdoc=' + vdoc);
    params.paramNoDb("versions", function (fields) {
        var SchemaParams = eval("(" + fields + ")");
        versionSchema.add(SchemaParams);
        nonKaModel = mongoose.model(collectionsaveName, salesSchema, collectionName);
        nonKaModel.remove({}, function (err, result) {
            getCalcResult(req, res, function (docs) {
                docs = JSON.parse(JSON.stringify(docs))
                docs = eval(docs);
                for (var key in docs) {
                    docs[key] = _.extend({ 'collname': 'body' }, docs[key]);
                }
                params.getHeader('case1', function (header) {
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
                });
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

    params.paramDb("agreements", "calcResultExcel", function (result, result2, result3) {
        var excelHeader, excelHeader2, argmentList;
        excelHeader = result;
        excelHeader2 = result2;
        argmentList = result3;
        outletModel.find(condition, function (err, outlets) {
            var docs = [];
            var rowId = 0;
            var promises = outlets.map(function (outlet) {
                var setArgeement, checkResult, sales;
                return Q.Promise(function (resolve, reject) {
                    outlet.getSetArgeement(function (err, setArgeement) {
                        outlet.getCheckResult(function (err, checkResult) {
                            outlet.getSales(function (err, sales) {
                                params.paramDb("agreements", "agreement", function (agreements) {
                                    outlet = getCalcResultViewModel(outlet, setArgeement, checkResult, sales, period, rowId, agreements);
                                    rowId++;
                                    docs.push(outlet);
                                    resolve();
                                })
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
                        var disc = docs[rowId]['折扣/月/元'];
                        if (!disc) disc = 0;
                        // console.log('disc='+disc);
                        if (amt > disc) amt = disc;

                        docs[rowId]['计算结果合计（包含销量考核）'] = amt;
                        docs[rowId]['合计目标收入'] = targetSales;
                        docs[rowId]['合计实际收入'] = actual;
                        // console.log('amt='+targetSales+'-'+amt);
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
                cb({ "excelHeader": excelHeader, "excelHeader2": excelHeader2, "argmentList": argmentList, "docs": docs });
            });
        }).select('-_id -__v').sort({ '考核销量售点': 1 });
    });
}

// cb({ "excelHeader": excelHeader, "docs": docs });
var methods = {
    'getCalcResult': getCalcResult, 'saveNonKaVersion': saveNonKaVersion, 'checkVersion': checkVersion,
    'getDataForExcel': getDataForExcel
};
module.exports = methods;