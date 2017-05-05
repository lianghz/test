var express = require('express');
var app = express();
app.set('port',process.env.PORT || 3000);
app.get('/',function(req,res){
		res.type('text/plain');
		res.send('hello world');

});
app.get('/about',function(req,res){
		res.type('text/plain');
		res.send('hello about');
});
app.use(function(req,res){
	console.log('404 err');
	res.type('text/plain');
	res.status(404);
	res.send('404 - 页面不存在！');
})
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.type('text/plain');
	res.status(505);
	res.send('505 - 服务器错误！');
})
app.listen(app.get('port'),function(){
	console.log('express started on http://localhost:' + app.get('port'));
});