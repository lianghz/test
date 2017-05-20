var express = require('express');
var handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
var credentials = require('./credentials.js');
var app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
var formidable = require('formidable');
var tojson = require('./models/excel.js');
var controller = require('./modules/controller.js');
var checkresult = require('./models/checkResult.js');

var mongoose = require('mongoose');

var opts = {
    server: {
        socketOptions: { keepAlive: 1 }
    }
};

switch (app.get('env')) {
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, opts);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        break;
    default:
        //throw new Error('Unknown execution environment: ' + app.get('env'));
        mongoose.connect(credentials.mongo.development.connectionString, opts);
}



app.set('port', process.env.PORT || 3000);

//route
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.render('index');
});

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
        controller.uploadCheckResult(res, filepath);
    });
});
///setArgeement客户协议配置
app.post('/upload/setargeement', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) return res.redirect(303, '/error');
        var filepath = files.filename.path;

        controller.setArgeementSaveData(res, filepath);
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
        controller.outletSaveData(res, filepath);
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
        controller.salesSaveData(res, filepath);
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

///calcResult客户协议配置
app.post('/upload/calcresult', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) return res.redirect(303, '/error');
        var filepath = files.filename.path;
        controller.calcResultSaveData(res, filepath);
    });
});
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


app.listen(app.get('port'), function () {
    console.log('express started on http://localhost:' + app.get('port'));
});