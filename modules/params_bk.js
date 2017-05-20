var mongoose = require('mongoose');
var ppsSchemas = mongoose.Schema({
  name: String,
  params: [String],
});

var outlets = ["办事处", "发放频率", "考核销量售点", "SAP售点", "客户名称", "客户", "淡季销量目标/元/月", "旺季销量目标/元/月", "淡季折扣/月/元", "旺季折扣/月/元", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var mmsales = ["MM售点", "SAP售点", "Name", "渠道", "销量", "收入"];
var checkResult=["MM售点","SAP售点","BU","办事处","协议","店名","地址"];
var setAgreement=["SAP售点","数据类型"];
var calcResult1=["办事处","DME发放协议号","协议名称","协议号费用周期","费用时间段","发放频率","MM售点","SAP售点","客户名称","客户","销量目标/元/月","折扣/月/元","费用合计","核对结果","P1","P2","P3","P4","P5","P6","P7","P8","P9","P10","P11","P12"];
var calcResult2=["实际收入（元）","计算结果（元）（不含销量考核）","合计目标收入","合计实际收入","计算结果合计（包含销量考核）","备注"];
function formatTitle(arrs){
    return '{"' + arrs.join('":String,"') + '":String}';
}
function formatTitleGrid(arrs){
      var paramsString = arrs.map(function (elm) {
      return "{field:'" + elm.replace('.', '．') + "',title:'" + elm.replace('.', '．') + "'}"//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
      }).join(",");
      return paramsString = "[" + paramsString + "]";
}
function formatTitleExcel(arrs){
      var paramsString = arrs.join('","');
      paramsString = paramsString.replace('.', '．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
      return paramsString = '["' + paramsString + '"]';
}


function paramNoDb(resultName, cb) {
  var paramsString = "";
  switch (resultName) {
    case 'outlet':
      paramsString = '{"' + outlets.join('":String,"') + '":String}';
      break;
    case 'outletGrid':
      paramsString = outlets.map(function (elm) {
        return "{field:'" + elm.replace('.', '．') + "',title:'" + elm.replace('.', '．') + "'}"//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
      }).join(",");
      paramsString = "[" + paramsString + "]";
      break;
    case 'outletExcel':
      paramsString = outlets.join('","');
      paramsString = paramsString.replace('.', '．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
      paramsString = '["' + paramsString + '"]';
      break;
    case 'sales':
      paramsString = '{"' + mmsales.join('":String,"') + '":String}';
      break;
    case 'salesGrid':
      paramsString = mmsales.map(function (elm) {
        return "{field:'" + elm.replace('.', '．') + "',title:'" + elm.replace('.', '．') + "'}"//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
      }).join(",");
      paramsString = "[" + paramsString + "]";
      break;
    case 'salesExcel':
      paramsString = mmsales.join('","');
      paramsString = paramsString.replace('.', '．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
      paramsString = '["' + paramsString + '"]';
      break;
    default:
      paramsString = "";
      break;
  }
  //console.log("paramsString"+paramsString);
  cb(paramsString);
}


function paramDb(parameterName, resultName, cb) {
  var paramsString;
  var parameters = mongoose.model('param', ppsSchemas);//(表名，schema)定义了一个叫ka的model
  parameters.find({ name: parameterName }, function (err, docs) {
    if (err) {
      console.log(err.stack);
    }

    docs.forEach(function (element) {
      switch (resultName) {
        case 'checkResult':
          paramsString = element.params.join('":String,"');
          paramsString = paramsString.replace('.', '．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
          paramsString = '{"MM售点":String,"SAP售点":String,"BU":String,"办事处":String,"协议":String,"店名":String,"地址":String,"' + paramsString + '":String}';
          break;
        case 'checkResultExcel':
          paramsString = element.params.join('","');
          paramsString = paramsString.replace('.', '．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
          paramsString = '["MM售点","SAP售点","BU","办事处","协议","店名","地址","' + paramsString + '"]';
          break;
        case 'checkResultGrid':
          //[{field:'code',title:'Code',width:100},{field:'code',title:'Code',width:100}]
          paramsString = element.params.map(function (elm) {
            return "{field:'" + elm.replace('.', '．') + "',title:'" + elm.replace('.', '．') + "'}"//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
          }).join(",");
          paramsString = "[{field:'MM售点',title:'MM售点'},{field:'SAP售点',title:'SAP售点'},{field:'BU',title:'BU'},{field:'办事处',title:'办事处'},{field:'协议',title:'协议'},{field:'店名',title:'店名'},{field:'地址',title:'地址'}," + paramsString + "]";
          break;
        case 'setAgreement':
          paramsString = element.params.join('":String,"');
          paramsString = paramsString.replace('.', '．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
          paramsString = '{"SAP售点":String,"数据类型":String,"' + paramsString + '":String}';
          break;
        case 'setAgreementGrid':
          paramsString = element.params.map(function (elm) {
            return "{field:'" + elm.replace('.', '．') + "',title:'" + elm.replace('.', '．') + "'}"//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
          }).join(",");
          paramsString = "[{field:'SAP售点',title:'SAP售点'},{field:'数据类型',title:'数据类型'}," + paramsString + "]";
          break;
        case 'setAgreementExcel':
          paramsString = element.params.join('","');
          paramsString = paramsString.replace('.', '．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
          paramsString = '["SAP售点","数据类型","' + paramsString + '"]';
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

//// methods-----------------
var methods = {
  'paramNoDb': paramNoDb,
  'paramDb': paramDb
};

module.exports = methods;