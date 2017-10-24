var controller = require('./modules/case5controller.js');
var formidable = require('formidable');

//--------------case5
//--checkresult

module.exports = function (app) {
    app.post('/case5/upload/checkresult', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.checkResultSave(res, filepath, fields);
        });
    });
    app.get('/case5/down/checkresult', function (req, res) {
        controller.checkResultToExcel(req, res);
    });
    app.get('/case5/checkresultgrid', function (req, res) {
        controller.checkResultGrid(req, res);
    });
    app.get('/case5/checkresult', function (req, res) {

        controller.checkResultGetData(req, res);
    });
    //--outlet
    app.post('/case5/upload/outlet', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.outletSaveData(res, filepath, fields);
        });
    });
    app.get('/case5/down/outlet', function (req, res) {
        controller.outletDataToExcel(req, res);
    });
    app.get('/case5/outletgrid', function (req, res) {
        controller.outletGrid(req, res);
    });
    app.get('/case5/outlet', function (req, res) {
        controller.outletGetData(req, res);
    });

    //--sku
    app.post('/case5/upload/sku', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.skuSaveData(res, filepath, fields);
        });
    });
    app.get('/case5/down/sku', function (req, res) {
        controller.skuDataToExcel(req, res);
    });
    app.get('/case5/skugrid', function (req, res) {
        controller.skuGrid(req, res);
    });
    app.get('/case5/sku', function (req, res) {
        controller.skuGetData(req, res);
    });

    //--active
    app.post('/case5/upload/active', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.activeSaveData(res, filepath, fields);
        });
    });
    app.get('/case5/down/active', function (req, res) {
        controller.activeDataToExcel(req, res);
    });
    app.get('/case5/activegrid', function (req, res) {
        controller.activeGrid(req, res);
    });
    app.get('/case5/active', function (req, res) {
        controller.activeGetData(req, res);
    });

    //--contract
    app.post('/case5/upload/contract', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.contractSaveData(res, filepath, fields);
        });
    });
    app.get('/case5/down/contract', function (req, res) {
        controller.contractDataToExcel(req, res);
    });
    app.get('/case5/contractgrid', function (req, res) {
        controller.contractGrid(req, res);
    });
    app.get('/case5/contract', function (req, res) {
        controller.contractGetData(req, res);
    });
    //--sales
    app.post('/case5/upload/sales', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.salesSaveData(res, filepath, fields);
        });
    });
    app.get('/case5/down/sales', function (req, res) {
        controller.salesDataToExcel(req, res);
    });
    app.get('/case5/salesgrid', function (req, res) {
        controller.salesGrid(req, res);
    });
    app.get('/case5/sales', function (req, res) {
        controller.salesGetData(req, res);
    });
    //--calculate
    app.get('/case5/calcresultgrid', function (req, res) {
        controller.calcResultGrid(req, res);
    });

    app.get('/case5/calcresultview', function (req, res) {
        controller.getCalcResultView(req, res);
    });

    app.post('/case5/saveversion', function (req, res) {
        controller.checkVersion(req, res);
    });
    app.get('/case5/down/calcresult', function (req, res) {
        controller.calcResultDataToExcel(req, res);
    });

    ///历史版本
    app.get('/case5/down/history', function (req, res) {
        controller.versionsDataToExcel(req, res);
    });
    app.get('/case5/historygrid', function (req, res) {
        controller.versionsGrid(req, res);
    });
    app.get('/case5/history', function (req, res) {

        controller.versionsGetData(req, res);
    });
    app.get('/case5/version', function (req, res) {

        controller.versionsGetHistory(req, res);
    });

    app.get('/case5/down/versionsGetHistoryToExcel', function (req, res) {
        controller.versionsGetHistoryToExcel(req, res);
    });
    //--deliver
    app.post('/case5/upload/deliver', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.deliverSaveData(res, filepath, fields);
        });
    });
    app.get('/case5/down/deliver', function (req, res) {
        controller.deliverDataToExcel(req, res);
    });
    app.get('/case5/delivergrid', function (req, res) {
        controller.deliverGrid(req, res);
    });
    app.get('/case5/deliver', function (req, res) {
        controller.deliverGetData(req, res);
    });
}