var params = require("../modules/params.js");
var mongoose = require('mongoose');
var Q = require('q');

var _ = require('underscore');

function getCalcResultViewModel(outlet, setArgeement, checkResult, sales) {
    outlet = JSON.parse(JSON.stringify(outlet));
    return _.extend(outlet, { '生动化目标': setArgeement, '生动化检查结果': checkResult, '售点销量': sales });
}

var setArgeementSchema = mongoose.Schema();
var checkResultSchema = mongoose.Schema();
var salesSchema = mongoose.Schema();

var setArgeementModel = mongoose.model('setagreement', setArgeementSchema);
var checkResultModel = mongoose.model('checkresult', checkResultSchema);
var salesModel = mongoose.model('salesmm', salesSchema);

//outle model 关联其它documents
var outletSchema = mongoose.Schema();
outletSchema.methods.getSetArgeement = function (cb) {
    return setArgeementModel.findOne({ 'SAP售点': JSON.parse(JSON.stringify(this))['SAP售点'] }, cb);
};
outletSchema.methods.getCheckResult = function (cb) {
    return checkResultModel.findOne({ 'SAP售点': JSON.parse(JSON.stringify(this))['SAP售点'] }, cb);
};
outletSchema.methods.getSales = function (cb) {
    return salesModel.findOne({ 'SAP售点': JSON.parse(JSON.stringify(this))['SAP售点'] }, cb);
};
var outletModel = mongoose.model('outlet2', outletSchema,'outlets');

function getCalcResult(req, res, cb) {
    var page = (req.query.page)?parseInt(req.query.page):1;
    var rows = (req.query.rows)?parseInt(req.query.rows):1000000;
    var skip = (page - 1) * rows;
    var bu = req.query.bu;
    var loc = req.query.loc;
    var outlet = req.query.outlet;
    var name = req.query.name;
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
        condition += "'SAP售点':/" + outlet + "/";
    }
    if (name) {
        if (condition) condition += ","
        condition += "'店名':/" + name + "/";
    }
    condition = eval("({" + condition + "})");
    outletModel.count(condition, function (err, count) {
        var total = count;
        ///find  
        outletModel.find(condition, function (err, outlets) {
            var docs = [];
            var promises = outlets.map(function (outlet) {
                var setArgeement, checkResult, sales;
                return Q.Promise(function (resolve, reject) {
                    outlet.getSetArgeement(function (err, setArgeement) {
                        outlet.getCheckResult(function (err, checkResult) {
                            outlet.getSales(function (err, sales) {
                                outlet = getCalcResultViewModel(outlet, setArgeement, checkResult, sales);
                                docs.push(outlet);
                                resolve();
                            });
                        });
                    });
                });
            });
            Q.all(promises).then(function () {
                var totalDocs = "{\"total\":" + total + ",\"rows\":" + JSON.stringify(docs) + "}"
                cb(totalDocs);
            });
        }).limit(rows).skip(skip);
        ///end find
    }).limit(rows).skip(skip);;

}
var methods = { 'getCalcResult': getCalcResult };
module.exports = methods;