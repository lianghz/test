var express = require('express');
var handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
var credentials = require('./credentials.js');
var app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// var tojson = require('./models/excel.js');

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
app.use(require('body-parser')());
//route
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.render('index');
});

// add routes
require('./routes1.js')(app);
require('./routes2.js')(app);
require('./routes3.js')(app);
require('./routes4.js')(app);
require('./routes5.js')(app);
require('./routes6.js')(app);
// require('./rtest.js')(app);



app.listen(app.get('port'), function () {
    console.log('express started on http://localhost:' + app.get('port'));
});

process.on('uncaughtException', function (err) { 
  console.log('Caught exception: ' + err); 
}); 