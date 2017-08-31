var controller = require('./modules/controller.js');
var checkresult = require('./models/case1/checkResult.js');
var formidable = require('formidable');

module.exports = function (app) {
    app.get('/checkresult', function (req, res) {
        checkresult.getResultGrid(res)
        //res.render('checkresult',{layout:null});
    });

    app.get('/getresult', function (req, res) {

        checkresult.getResultData(req, res);
        //res.render('checkresult',{layout:null});
    });

    app.get('/upload', function (req, res) {
        var now = new Date();
        res.render('upload', {
            year: now.getFullYear(), month: now.getMonth()
        });
    });

    app.get('/down/checkresult', function (req, res) {
        controller.getCheckResultToExcel(req, res);
    });

    app.post('/upload/checkresult', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.uploadCheckResult(res, filepath, fields);
        });
    });
    ///setArgeement客户协议配置
    app.post('/upload/setargeement', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;

            controller.setArgeementSaveData(res, filepath, fields);
        });
    });
    app.get('/down/setargeement', function (req, res) {
        controller.setArgeementDataToExcel(req, res);
    });
    app.get('/setargeementgrid', function (req, res) {
        controller.setArgeementgetGrid(req, res);
    });

    app.get('/setargeement', function (req, res) {

        controller.setArgeementgetData(req, res);
        //res.render('checkresult',{layout:null});
    });

    ///outlet客户协议配置
    app.post('/upload/outlet', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.outletSaveData(res, filepath, fields);
        });
    });
    app.get('/down/outlet', function (req, res) {
        controller.outletDataToExcel(req, res);
    });
    app.get('/outletgrid', function (req, res) {
        controller.outletGetGrid(req, res);
    });
    app.get('/outlet', function (req, res) {

        controller.outletGetData(req, res);
    });

    ///outlet客户协议配置
    app.post('/upload/sales', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var filepath = files.filename.path;
            controller.salesSaveData(res, filepath, fields);
        });
    });
    app.get('/down/sales', function (req, res) {
        controller.salesDataToExcel(req, res);
    });
    app.get('/salesgrid', function (req, res) {
        controller.salesGetGrid(req, res);
    });
    app.get('/sales', function (req, res) {

        controller.salesGetData(req, res);
    });

    ///calcResult计算结果
    // app.post('/upload/calcresult', function (req, res) {
    //     var form = new formidable.IncomingForm();
    //     form.parse(req, function (err, fields, files) {
    //         if (err) return res.redirect(303, '/error');
    //         var filepath = files.filename.path;
    //         controller.calcResultSaveData(res, filepath);
    //     });
    // });
    app.get('/down/calcresult', function (req, res) {
        controller.calcResultDataToExcel(req, res);
    });
    app.get('/calcresultgrid', function (req, res) {
        controller.calcResultGetGrid(req, res);
    });
    app.get('/calcresult', function (req, res) {

        controller.calcResultGetData(req, res);
    });

    app.get('/calcresultview', function (req, res) {
        controller.getCalcResultView(req, res);
    });

    app.post('/savenonkaversion', function (req, res) {
        controller.checkVersion(req, res);
    });

    ///历史版本
    app.get('/down/history', function (req, res) {
        controller.versionsDataToExcel(req, res);
    });
    app.get('/historygrid', function (req, res) {
        controller.versionsGetGrid(req, res);
    });
    app.get('/history', function (req, res) {

        controller.versionsGetData(req, res);
    });
    app.get('/version', function (req, res) {
        controller.versionsGetHistory(req, res);
    });
    app.get('/versionsGetHistGrid', function (req, res) {
        controller.versionsGetHistGrid(req, res);
    });
    app.get('/down/versionsGetHistoryToExcel', function (req, res) {
        controller.versionsGetHistoryToExcel(req, res);
    });
}