var mongoose = require('mongoose');
var ppsSchemas = mongoose.Schema({
  name: String,
  params: [String],
});

module.exports = function (parameterName,resultName, cb) {
  var parameters = mongoose.model('param', ppsSchemas);//(表名，schema)定义了一个叫ka的model
  parameters.find({ name: parameterName}, function (err, docs) {
    if (err) {
      console.log(err.stack);
    }
    console.log("docs=" + docs.length);
    var paramsString;
    docs.forEach(function (element) {
      switch (resultName) {
        case 'checkResult': 
          paramsString = element.params.join('":String,"');
          paramsString = paramsString.replace('.','．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
          paramsString = '{"MM售点":String,"SAP售点":String,"BU":String,"办事处":String,"协议":String,"店名":String,"地址":String,"' + paramsString + '":String}';
          break;
        case 'checkResultGrid':
          //[{field:'code',title:'Code',width:100},{field:'code',title:'Code',width:100}]
          paramsString = element.params.map(function(elm){
            return "{field:'" + elm.replace('.','．') + "',title:'" + elm.replace('.','．') + "'}"//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
          }).join(",");
          paramsString = "[{field:'MM售点',title:'MM售点'},{field:'SAP售点',title:'SAP售点'},{field:'BU',title:'BU'},{field:'办事处',title:'办事处'},{field:'协议',title:'协议'},{field:'店名',title:'店名'},{field:'地址',title:'地址'}," + paramsString + "]";
          break;
        default: 
          paramsString = "{'" + paramsString + "':String}";
          break;
      }
      
      cb(paramsString);

    });

    return paramsString;
  })

};