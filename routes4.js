var controller = require('./modules/case4controller.js');
var formidable = require('formidable');

//--------------case4

module.exports = function (app) {
    //--outlet
    app.post('/case4/upload/outlet', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.outletSaveData(res, filepath, fields);
        });
    });
    app.get('/case4/down/outlet', function (req, res) {
        controller.outletDataToExcel(req, res);
    });
    app.get('/case4/outletgrid', function (req, res) {
        controller.outletGrid(req, res);
    });
    app.get('/case4/outlet', function (req, res) {
        controller.outletGetData(req, res);
    });

    //--sales
    app.post('/case4/upload/sales', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.salesSaveData(res, filepath, fields);
        });
    });
    app.get('/case4/down/sales', function (req, res) {
        controller.salesDataToExcel(req, res);
    });
    app.get('/case4/salesgrid', function (req, res) {
        controller.salesGrid(req, res);
    });
    app.get('/case4/sales', function (req, res) {
        controller.salesGetData(req, res);
    });
    //--calculate
    app.get('/case4/calcresultgrid', function (req, res) {
        controller.calcResultGrid(req, res);
    });

    app.get('/case4/calcresultview', function (req, res) {
        controller.getCalcResultView(req, res);
    });

    app.post('/case4/saveversion', function (req, res) {
        controller.checkVersion(req, res);
    });
    app.get('/case4/down/calcresult', function (req, res) {
        controller.calcResultDataToExcel(req, res);
    });
     //--package
    app.post('/case4/upload/package', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.packageSaveData(res, filepath, fields);
        });
    });
    app.get('/case4/down/package', function (req, res) {
        controller.packageDataToExcel(req, res);
    });
    app.get('/case4/packagegrid', function (req, res) {
        controller.packageGrid(req, res);
    });
    app.get('/case4/package', function (req, res) {
        controller.packageGetData(req, res);
    });

    ///历史版本
    app.get('/case4/down/history', function (req, res) {
        controller.versionsDataToExcel(req, res);
    });
    app.get('/case4/historygrid', function (req, res) {
        controller.versionsGrid(req, res);
    });
    app.get('/case4/history', function (req, res) {

        controller.versionsGetData(req, res);
    });
    app.get('/case4/version', function (req, res) {

        controller.versionsGetHistory(req, res);
    });

    app.get('/case4/down/versionsGetHistoryToExcel', function (req, res) {
        controller.versionsGetHistoryToExcel(req, res);
    });
   
}