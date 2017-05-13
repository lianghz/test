var Vacation = require('./models/vacation.js');
var express = require('express');
var handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
var credentials = require('./credentials.js');
var app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
var formidable = require('formidable');
var ka = require('./modules/ka.js');
var tojson = require('./models/excel.js');
var uploadToDb = require('./modules/uploadToDb.js');
var checkresult= require('./models/checkResult.js');

var mongoose = require('mongoose');
var prams = require("./modules/prams.js")

var opts = {
server: {
		socketOptions: { keepAlive: 1 }
	}
};

switch(app.get('env')){
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
    res.render('rebate1');
});

app.get('/checkresult', function (req, res) {
    checkresult.getResultGrid(res)
    //res.render('checkresult',{layout:null});
});

app.get('/getresult', function (req, res) {
    var page = req.query.page;
    var rows = req.query.rows;
    checkresult.getResultData(res,page,rows);
    //res.render('checkresult',{layout:null});
});


app.get('/p', function (req, res) {
    prams("Parameters",function(result){
        res.send(result);
    });
});


app.get('/json', function (req, res) {
    Vacation.find({ available: true }, function (err, vacations) {
        var context = {
            rows: vacations.map(function (vacation) {
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    price: vacation.getDisplayPrice(),
                    inSeason: vacation.inSeason,
                }
            })
        };
        res.send(context.rows);
    });
});

app.get('/json2', function(req, res) {
    ka.getKaResult(res);
});

app.get('/upload', function (req, res) {
    var now = new Date();
    res.render('upload', {
        year: now.getFullYear(), month: now.getMonth()
    });
});

app.post('/upload/:year/:month', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        var filepath = files.filename.path;
        uploadToDb.uploadCheckResult(res,filepath);        
    });
});

app.listen(app.get('port'), function () {
    console.log('express started on http://localhost:' + app.get('port'));
});