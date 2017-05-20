var mongoose = require('mongoose');
var ppsSchemas = mongoose.Schema({
  name: String,
  params: [String],
});

var outlets = ["办事处", "发放频率", "考核销量售点", "SAP售点", "客户名称", "客户", "淡季销量目标/元/月", "旺季销量目标/元/月", "淡季折扣/月/元", "旺季折扣/月/元", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var mmsales = ["MM售点", "SAP售点", "Name", "渠道", "销量", "收入"];
var checkResult = ["MM售点", "SAP售点", "BU", "办事处", "协议", "店名", "地址"];
var setAgreement = ["SAP售点", "数据类型"];
var calcResult1 = ["办事处", "DME发放协议号", "协议名称", "协议号费用周期", "费用时间段", "发放频率", "MM售点", "SAP售点", "客户名称", "客户", "销量目标/元/月", "折扣/月/元", "费用合计", "核对结果", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var calcResult2 = ["实际收入（元）", "计算结果（元）（不含销量考核）", "合计目标收入", "合计实际收入", "计算结果合计（包含销量考核）", "备注"];

function formatTitle(arrs) {
  return '{"' + arrs.join('":String,"') + '":String}';
}
//[{filed:A,title:A},{filed:B,title:B,rowspan:2},{title:c,colspan:4}... ...]
///数组，字段前序，行扩展，列扩展
function formatTitleGrid(arrs, fieldPrefix, rowspan, colspan) {
  var i = -1;
  var iv="";
  var paramsString = arrs.map(function (elm) {
    i++;
    iv = (i==0)?"":i;
    // return "{field:'" + (fieldPrefix ? (fieldPrefix + ".") : "") + elm.replace('.', '．') + "',title:'" + (fieldPrefix ? (fieldPrefix + ".") : "") + elm.replace('.', '．') + (rowspan ? ("',rowspan:'" + rowspan) : '') + "'}";//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
    //return "{field:'" + (fieldPrefix?(fieldPrefix+iv) :elm.replace('.', '．') )+ "',title:'" + elm.replace('.', '．') +"'"+ (rowspan ? (",rowspan:'" + rowspan+"'") : '') + (fieldPrefix?(",formatter:\"formatField(value,row,index,'" +elm.replace('.', '．') + "')\""):"" ) +  "}";//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
    return "{field:'" + (fieldPrefix?(fieldPrefix+iv) :elm.replace('.', '．') )+ "',title:'" + elm.replace('.', '．') +"'"+ (rowspan ? (",rowspan:'" + rowspan+"'") : '') + (fieldPrefix?(",formatter:function(value,row,index){return formatField(value,row,index,'"+fieldPrefix+"','" +elm.replace('.', '．') + "')}"):"" ) +  "}";//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
    //return "{field:'" + (fieldPrefix?(fieldPrefix+iv) :elm.replace('.', '．') )+ "',title:'" + elm.replace('.', '．') +"'"+ (rowspan ? (",rowspan:'" + rowspan+"'") : '') + (fieldPrefix?(",formatter:formatField"):"" ) +  "}";//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
   
    
  }).join(",");
  //  paramsString = "[" + paramsString + (colspan ? ("," + colspan) : '') + "]";
  // console.log('paramsString0='+paramsString);
  paramsString = paramsString + (colspan ? ("," + colspan) : '');
  return paramsString;

}

function formatTitleExcel(arrs) {
  var paramsString = arrs.join('","');
  paramsString = paramsString.replace('.', '．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
  return paramsString = '["' + paramsString + '"]';
}


function paramNoDb(resultName, cb) {
  var paramsString = "";
  switch (resultName) {
    case 'outlet':
      paramsString = formatTitle(outlets);
      break;
    case 'outletGrid':
      paramsString = formatTitleGrid(outlets);
      paramsString = '[' + paramsString + ']';
      break;
    case 'outletExcel':
      paramsString = formatTitleExcel(outlets);
      break;
    case 'sales':
      paramsString = formatTitle(mmsales);
      break;
    case 'salesGrid':
      paramsString = formatTitleGrid(mmsales);
      paramsString = '[' + paramsString + ']';
      break;
    case 'salesExcel':
      paramsString = formatTitleExcel(mmsales);
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
          var arrs = checkResult.concat(element.params);
          paramsString = formatTitle(arrs);
          break;
        case 'checkResultExcel':
          var arrs = checkResult.concat(element.params);
          paramsString = formatTitleExcel(arrs);
          break;
        case 'checkResultGrid':
          var arrs = checkResult.concat(element.params);
          paramsString = formatTitleGrid(arrs);
          paramsString = '[' + paramsString + ']';
          break;
        case 'setAgreement':
          var arrs = setAgreement.concat(element.params);
          paramsString = formatTitle(arrs);
          break;
        case 'setAgreementGrid':
          var arrs = setAgreement.concat(element.params);
          paramsString = formatTitleGrid(arrs);
          paramsString = '[' + paramsString + ']';
          break;
        case 'setAgreementExcel':
          var arrs = setAgreement.concat(element.params);
          paramsString = formatTitleExcel(arrs);
          break;
        case 'calcResult':
          var agr1 = ["'生动化目标':" + formatTitle(element.params)];
          var agr2 = ["'生动化检查结果':" + formatTitle(element.params)];
          var agr3 = ["'生动化奖励计算':" + formatTitle(element.params)];
          var arrs = calcResult.concat(agr1).concat(agr2).concat(agr3);
          paramsString = formatTitle(arrs).replace('}:String', '}');
          break;
        case 'calcResultGrid':
          //var arrs = setAgreement.concat( element.params );
          var colCount = element.params.length;
          var rowspan = 2;
          var colspan1 = "{title:'生动化目标',colspan:" + colCount + "},";
          var colspan2 = "{title:'生动化检查结果',colspan:" + colCount + "},";
          var colspan3 = "{title:'生动化奖励计算',colspan:" + colCount + "}";
          colspan = colspan1 + colspan2 + colspan3;
          paramsString = formatTitleGrid(calcResult1, '', rowspan, colspan);
          paramsString += ',' + formatTitleGrid(calcResult2,'',rowspan , '');
          paramsString += '],[' + formatTitleGrid(element.params, '生动化目标', '');
          paramsString += ',' + formatTitleGrid(element.params, '生动化检查结果', '');
          paramsString += ',' + formatTitleGrid(element.params, '生动化奖励计算', '');
          paramsString = '[' + paramsString + ']';
          // console.log('paramsGrid10=' + paramsString);
          break;
        case 'calcResultExcel':
          var arrs = setAgreement.concat(element.params);
          paramsString = formatTitleExcel(arrs);
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