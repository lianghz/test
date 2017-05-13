var express = require('express');
var handlebars = require('express3-handlebars').create({ defaultLayout:'main' });
var credentials = require('./credentials.js');

var app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

var mongoose = require('mongoose');

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

app.set('port',process.env.PORT || 3000);
app.get('/',function(req,res){
		res.render('home');

});
app.get('/about',function(req,res){
		res.render('about');
});
app.use(function(req,res){
	console.log('404 err');
	res.status(404);
    res.render('404');
})
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.status(505);
	res.render('500');
})
app.listen(app.get('port'),function(){
	console.log('express started on http://localhost:' + app.get('port'));
});