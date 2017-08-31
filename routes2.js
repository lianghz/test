var controller = require('./modules/case2controller.js');
var formidable = require('formidable');

//--------------case2
//--checkresult

module.exports = function (app) {
    app.post('/case2/upload/checkresult', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.checkResultSave(res, filepath,fields);
        });
    });
    app.get('/case2/down/checkresult', function (req, res) {
        controller.checkResultToExcel(req, res);
    });
    app.get('/case2/checkresultgetgrid', function (req, res) {
        controller.checkResultGetGrid(req, res);
    });
    app.get('/case2/checkresult', function (req, res) {

        controller.checkResultGetData(req, res);
    });
    //--outlet
    app.post('/case2/upload/outlet', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.outletSaveData(res, filepath,fields);
        });
    });
    app.get('/case2/down/outlet', function (req, res) {
        controller.outletDataToExcel(req, res);
    });
    app.get('/case2/outletgetgrid', function (req, res) {
        controller.outletGetGrid(req, res);
    });
    app.get('/case2/outlet', function (req, res) {
        controller.outletGetData(req, res);
    });

    //--sku
    app.post('/case2/upload/sku', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.skuSaveData(res, filepath,fields);
        });
    });
    app.get('/case2/down/sku', function (req, res) {
        controller.skuDataToExcel(req, res);
    });
    app.get('/case2/skugetgrid', function (req, res) {
        controller.skuGetGrid(req, res);
    });
    app.get('/case2/sku', function (req, res) {
        controller.skuGetData(req, res);
    });

    //--package
    app.post('/case2/upload/package', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.packageSaveData(res, filepath,fields);
        });
    });
    app.get('/case2/down/package', function (req, res) {
        controller.packageDataToExcel(req, res);
    });
    app.get('/case2/packagegetgrid', function (req, res) {
        controller.packageGetGrid(req, res);
    });
    app.get('/case2/package', function (req, res) {
        controller.packageGetData(req, res);
    });
    //--sales
    app.post('/case2/upload/sales', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.salesSaveData(res, filepath,fields);
        });
    });
    app.get('/case2/down/sales', function (req, res) {
        controller.salesDataToExcel(req, res);
    });
    app.get('/case2/salesgetgrid', function (req, res) {
        controller.salesGetGrid(req, res);
    });
    app.get('/case2/sales', function (req, res) {
        controller.salesGetData(req, res);
    });
    //--calculate
    app.get('/case2/calcresultgrid', function (req, res) {
        controller.calcResultGetGrid(req, res);
    });

    app.get('/case2/calcresultview', function (req, res) {
        controller.getCalcResultView(req, res);
    });

        app.post('/case2/saveversion', function (req, res) {
        controller.checkVersion(req, res);
    });
   app.get('/case2/down/calcresult', function (req, res) {
        controller.calcResultDataToExcel(req, res);
    });

    ///历史版本
    app.get('/case2/down/history', function (req, res) {
        controller.versionsDataToExcel(req, res);
    });
    app.get('/case2/historygrid', function (req, res) {
        controller.versionsGetGrid(req, res);
    });
    app.get('/case2/history', function (req, res) {

        controller.versionsGetData(req, res);
    });
    app.get('/case2/version', function (req, res) {

        controller.versionsGetHistory(req, res);
    });

    app.get('/case2/down/versionsGetHistoryToExcel', function (req, res) {
        controller.versionsGetHistoryToExcel(req, res);
    });
}