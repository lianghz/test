var params = require("../modules/params.js");
var mongoose = require('mongoose');
var Q = require('q');

var _ = require('underscore');


function toJson(element) {
    return JSON.parse(JSON.stringify(element));
}

var checkOutlets = {};//保存考核售点所对应售点的奖励金额合计、销量合计
checkOutlets = toJson(checkOutlets);
///客户资料，协议设置，检查结果，MM销量，周期，行Id
function getCalcResultViewModel(outlet, setArgeement, checkResult, sales, period, rowId, agreements) {
    outlet = toJson(outlet);
    setArgeement = toJson(setArgeement);
    checkResult = toJson(checkResult);
    sales = toJson(sales);
    agreements = toJson(eval("(" + agreements + ")"));
    var awardSum = 0;//奖励合计
    var outletKey = outlet['考核销量售点'];
    var sapoutlet = outlet['SAP售点'];
    var checkOutlet = eval("({'" + outletKey + "':{'奖励合计':0,'合计目标收入':0,'合计实际收入':0,'rowId':-1}})");

    //var checkOutlet = eval("({'" + outletKey + "':'0'})");
    checkOutlet = toJson(checkOutlet);


    var seasonType = outlet['P' + period];//售点对应的淡旺季类型
    //奖励方法
    //淡旺季数量
    //淡旺季奖励
    var awardTypes, busySeasonQuantity, slackSeasonQuantity, busySeasonAward, slackSeasonAward, seasonQuantity, seasonAward;
    var awardResult = {};
    setArgeement.forEach(function (element) {
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
    var salesTarget, discTarget;
    switch (seasonType) {
        case '淡':
            seasonQuantity = slackSeasonQuantity;
            seasonAward = slackSeasonAward;
            salesTarget = outlet['淡季销量目标/元/月'];
            discTarget = outlet['淡季折扣/月/元'];
            break;
        case '旺':
            seasonQuantity = busySeasonQuantity;
            seasonAward = busySeasonAward;
            salesTarget = outlet['旺季销量目标/元/月'];
            discTarget = outlet['旺季折扣/月/元'];
            break;
        default:
            salesTarget = outlet['销量目标/元/月'];
            discTarget = outlet['折扣/月/元'];
            break;
    }

    ///奖励计算
    awardResult = _.extend(awardResult, seasonQuantity);//目的是拷贝一个结构给awardResult
    // console.log("award="+agreements);
    for (key in agreements) {
        // console.log("keytype="+awardTypes);
        if (!awardTypes) break;
        var awardType = awardTypes[key];
        var quantity = seasonQuantity[key];
        var award = seasonAward[key];
        var checkQuantity = checkResult[key];
        checkQuantity = (checkQuantity == 'Y' ? quantity : (!isNaN(checkQuantity) ? checkQuantity : 0));
        checkQuantity = parseInt(checkQuantity);
        checkQuantity = checkQuantity > quantity ? quantity : checkQuantity;
        if (awardType == '达标') {
            checkQuantity = checkQuantity >= quantity ? quantity : 0;
        }
        awardResult[key] = award * checkQuantity / quantity;

        awardSum += (!isNaN(awardResult[key]) ? awardResult[key] : 0);
    }

    // console.log("award=" + JSON.stringify(awardResult));

    ///如果考核售点未保存则创建,存在则合计各项值
    var revenue = sales ? parseInt(sales["收入"]) : 0;
    if (!checkOutlets[outletKey]) checkOutlets = _.extend(checkOutlets, checkOutlet);
    checkOutlets[outletKey]["奖励合计"] += awardSum;
    checkOutlets[outletKey]["合计实际收入"] += revenue;
    checkOutlets[outletKey]["合计目标收入"] += salesTarget ? parseFloat(salesTarget) : 0;
    if (outletKey == sapoutlet) {
        checkOutlets[outletKey]["rowId"] = rowId;
        // console.log('-----------------')
        // console.log('rowid2=' + rowId);
        // console.log('-----------------')
    }

    ///"销量目标/元/月", "折扣/月/元"
    awardSum = eval("({'计算结果（元）（不含销量考核）':" + awardSum.toFixed(2) + ",'销量目标/元/月':" + salesTarget + ",'折扣/月/元':" + discTarget + ",})");
    return _.extend(outlet, { '实际收入（元）': revenue, '生动化目标': seasonAward, '生动化检查结果': checkResult, '生动化奖励计算': awardResult, '售点销量': sales }, awardSum);
}

///---定义schema model
var setArgeementSchema = mongoose.Schema();
var checkResultSchema = mongoose.Schema();
var salesSchema = mongoose.Schema();

var setArgeementModel = mongoose.model('setagreement', setArgeementSchema);
var checkResultModel = mongoose.model('checkresult', checkResultSchema);
var salesModel = mongoose.model('salesmm2', salesSchema, 'salesmms');



//outle model 关联其它documents
var outletSchema = mongoose.Schema();
outletSchema.methods.getSetArgeement = function (cb) {
    return setArgeementModel.find({ 'SAP售点': JSON.parse(JSON.stringify(this))['SAP售点'] }, cb);
};
outletSchema.methods.getCheckResult = function (cb) {
    return checkResultModel.findOne({ 'SAP售点': JSON.parse(JSON.stringify(this))['SAP售点'] }, cb);
};
outletSchema.methods.getSales = function (cb) {
    return salesModel.findOne({ 'SAP售点': JSON.parse(JSON.stringify(this))['SAP售点'] }, cb);
};
var outletModel = mongoose.model('outlet2', outletSchema, 'outlettemps');

function getCalcResult(req, res, cb) {
    // var page = (req.query.page) ? parseInt(req.query.page) : 1;
    // var rows = (req.query.rows) ? parseInt(req.query.rows) : 1000000;
    var now = new Date();
    var page = parseInt(req.query.page);
    var rows = parseInt(req.query.rows);
    var skip = (page - 1) * rows;
    var period = (req.query.period) ? parseInt(req.query.period.substring(4, 7)) : now.getMonth() + 1;
    console.log('p=' + period)
    // var bu = req.query.bu;
    var loc = req.query.loc;
    var outlet = req.query.outlet;
    var name = req.query.name;
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
    condition = eval("({" + condition + "})");
    checkOutlets = {};
    outletModel.count(condition, function (err, count) {
        var total = count;
        ///find  
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
                    // console.log('key=' + key);
                    // console.log('rowId=' + rowId)
                    // console.log("actual=" + actual)
                    // console.log('targetSales=' + targetSales)
                    // console.log('rate1=' + rate)

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
        }).sort({ '考核销量售点': 1 });
        // }).sort({'考核销量售点':1}).limit(rows).skip(skip);
        ///end find
    });

}
var methods = { 'getCalcResult': getCalcResult };
module.exports = methods;