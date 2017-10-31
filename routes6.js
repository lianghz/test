var controller = require('./modules/case6controller.js');
var formidable = require('formidable');

//--------------case6
//--checkresult

module.exports = function (app) {
    app.post('/case6/upload/checkresult', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.checkResultSave(res, filepath, fields);
        });
    });
    app.get('/case6/down/checkresult', function (req, res) {
        controller.checkResultToExcel(req, res);
    });
    app.get('/case6/checkresultgrid', function (req, res) {
        controller.checkResultGrid(req, res);
    });
    app.get('/case6/checkresult', function (req, res) {

        controller.checkResultGetData(req, res);
    });
    //--outlet
    app.post('/case6/upload/outlet', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.outletSaveData(res, filepath, fields);
        });
    });
    app.get('/case6/down/outlet', function (req, res) {
        controller.outletDataToExcel(req, res);
    });
    app.get('/case6/outletgrid', function (req, res) {
        controller.outletGrid(req, res);
    });
    app.get('/case6/outlet', function (req, res) {
        controller.outletGetData(req, res);
    });

    //--standar
    app.post('/case6/upload/standar', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.standarSaveData(res, filepath, fields);
        });
    });
    app.get('/case6/down/standar', function (req, res) {
        controller.standarDataToExcel(req, res);
    });
    app.get('/case6/standargrid', function (req, res) {
        controller.standarGrid(req, res);
    });
    app.get('/case6/standar', function (req, res) {
        controller.standarGetData(req, res);
    });

    //--active
    app.post('/case6/upload/active', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.activeSaveData(res, filepath, fields);
        });
    });
    app.get('/case6/down/active', function (req, res) {
        controller.activeDataToExcel(req, res);
    });
    app.get('/case6/activegrid', function (req, res) {
        controller.activeGrid(req, res);
    });
    app.get('/case6/active', function (req, res) {
        controller.activeGetData(req, res);
    });

    //--contract
    app.post('/case6/upload/contract', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.contractSaveData(res, filepath, fields);
        });
    });
    app.get('/case6/down/contract', function (req, res) {
        controller.contractDataToExcel(req, res);
    });
    app.get('/case6/contractgrid', function (req, res) {
        controller.contractGrid(req, res);
    });
    app.get('/case6/contract', function (req, res) {
        controller.contractGetData(req, res);
    });
    //--sales
    app.post('/case6/upload/sales', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.salesSaveData(res, filepath, fields);
        });
    });
    app.get('/case6/down/sales', function (req, res) {
        controller.salesDataToExcel(req, res);
    });
    app.get('/case6/salesgrid', function (req, res) {
        controller.salesGrid(req, res);
    });
    app.get('/case6/sales', function (req, res) {
        controller.salesGetData(req, res);
    });
    //--calculate
    app.get('/case6/calcresultgrid', function (req, res) {
        controller.calcResultGrid(req, res);
    });

    app.get('/case6/calcresultview', function (req, res) {
        controller.getCalcResultView(req, res);
    });

    app.post('/case6/saveversion', function (req, res) {
        controller.checkVersion(req, res);
    });
    app.get('/case6/down/calcresult', function (req, res) {
        controller.calcResultDataToExcel(req, res);
    });

    ///历史版本
    app.get('/case6/down/history', function (req, res) {
        controller.versionsDataToExcel(req, res);
    });
    app.get('/case6/historygrid', function (req, res) {
        controller.versionsGrid(req, res);
    });
    app.get('/case6/history', function (req, res) {

        controller.versionsGetData(req, res);
    });
    app.get('/case6/version', function (req, res) {

        controller.versionsGetHistory(req, res);
    });

    app.get('/case6/down/versionsGetHistoryToExcel', function (req, res) {
        controller.versionsGetHistoryToExcel(req, res);
    });
    //--deliver
    app.post('/case6/upload/deliver', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.deliverSaveData(res, filepath, fields);
        });
    });
    app.get('/case6/down/deliver', function (req, res) {
        controller.deliverDataToExcel(req, res);
    });
    app.get('/case6/delivergrid', function (req, res) {
        controller.deliverGrid(req, res);
    });
    app.get('/case6/deliver', function (req, res) {
        controller.deliverGetData(req, res);
    });
}