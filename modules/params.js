var mongoose = require('mongoose');
var ppsSchemas = mongoose.Schema({
  name: String,
  params: [String],
});

var outlets = ["办事处", "发放频率", "考核销量售点", "SAP售点", "客户名称", "客户", "淡季销量目标/元/月", "旺季销量目标/元/月", "销量目标/元/月", "淡季折扣/月/元", "旺季折扣/月/元", "折扣/月/元", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var outlets2 = ["办事处", "发放频率", "考核销量售点", "SAP售点", "客户名称", "客户", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var mmsales = ["MM售点", "SAP售点", "Name", "渠道", "销量", "收入"];
var checkResult = ["MM售点", "SAP售点", "BU", "办事处", "协议", "店名", "地址"];
var setAgreement = ["SAP售点", "数据类型"];
var calcResultFrozen = ["办事处", "考核销量售点", "SAP售点"];
var calcResult1 = ["客户名称", "客户", "DME发放协议号", "协议名称", "协议号费用周期", "费用时间段", "发放频率", "销量目标/元/月", "折扣/月/元", "费用合计", "核对结果", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var calcResult2 = ["实际收入（元）", "计算结果（元）（不含销量考核）", "合计目标收入", "合计实际收入", "计算结果合计（包含销量考核）", "备注"];
var versions = ["周期", "版本", "描述", "保存时间", "修改时间", "操作人", "状态"];
var case2checkresult = ["办事处", "售点", "名称", "冰柜盘点表", "下家分销表"];
var case2outlets = ["办事处", "售点", "名称", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var case2skus = ["产品代码", "产品名称", "产品分类"];
var case2packages = ["序号", "产品代码", "产品名称"];
var case2sales = ["办事处", "售点", "名称", "产品代码", "产品名称", "销量"];

function formatTitle(arrs) {
  var titleStr = '{"' + arrs.join('":String,"') + '":String}';
  return titleStr.replace('.', '．');
}

function formatParams(arrs) {
  var titleStr = '{"' + arrs.join('":"0","') + '":"0"}';
  return titleStr.replace('.', '．');
}

//[{filed:A,title:A},{filed:B,title:B,rowspan:2},{title:c,colspan:4}... ...]
///数组，字段前序，行扩展，列扩展
function formatTitleGrid(arrs, fieldPrefix, rowspan, colspan, ww) {
  var i = -1;
  var iv = "";
  frozenOption = '';
  var w = '';
  // if (ww) w = "width:" + ww;
  var paramsString = arrs.map(function (elm) {
    i++;

    iv = (i == 0) ? "" : i;
    if (elm == '客户名称' || elm == '描述') {
      w = "width:300";
    } else if (elm.slice(0, 1) == 'P' && elm.length < 4) {
      w = "width:50";
    } else if (elm == 'SAP售点' || elm == 'MM售点' || elm == '数据类型' || elm == '客户' || elm == '周期') {
      w = "width:100";
    } else if (elm == '保存时间' || elm == '修改时间') {
      w = "width:200";
    } else {
      w = "width:" + (elm.length * 15 + 15);
    }

    // console.log('w=' + w);
    return "{field:'" + (fieldPrefix ? (fieldPrefix + iv) : elm.replace('.', '．')) + "',title:'" + elm.replace('.', '．') + "'" + (rowspan ? (",rowspan:'" + rowspan + "'") : '') + (fieldPrefix ? (",formatter:function(value,row,index){return formatField(value,row,index,'" + fieldPrefix + "','" + elm.replace('.', '．') + "')}") : "") + "," + w + "}";//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法  
  }).join(",");
  paramsString = paramsString + (colspan ? ("," + colspan) : '');
  // console.log("paramsString="+paramsString)
  return paramsString;

}

function formatTitleExcel(arrs) {
  var paramsString = arrs.join('","');
  paramsString = paramsString.replace('.', '．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
  return paramsString = '["' + paramsString + '"]';
}

function formatTitleExcel2(arrs) {
  var paramsString = arrs.join('","');
  paramsString = paramsString.replace('.', '．')//替换是因为mongodb的key不能是.，目前好像也没有可以转义的方法
  return paramsString = '"' + paramsString + '"';
}

function paramNoDb(resultName, cb) {
  var paramsString = "";
  switch (resultName) {
    case 'outlet':
      paramsString = formatTitle(outlets);
      break;
    case 'outlet2':
      paramsString = formatTitle(outlets2);
      break;
    case 'outletGrid':
      paramsString = formatTitleGrid(outlets);
      // paramsString += ',' + "{title:'　',field:' '}"//解决最后一列错位
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
      paramsString += ',' + "{title:'　',field:' '}"//解决最后一列错位
      paramsString = '[' + paramsString + ']';
      break;
    case 'salesExcel':
      paramsString = formatTitleExcel(mmsales);
      break;
    case 'versions':
      paramsString = formatTitle(versions);
      break;
    case 'versionsGrid':
      paramsString = formatTitleGrid(versions);
      paramsString += ',' + "{title:'　',field:' '}"//解决最后一列错位
      paramsString = '[' + paramsString + ']';
      break;
    case 'versionsExcel':
      paramsString = formatTitleExcel(versions);
      break;
    case 'case2checkresult':
      paramsString = formatTitle(case2checkresult);
      break;
    case 'case2checkresultGrid':
      paramsString = formatTitleGrid(case2checkresult);
      paramsString += ',' + "{title:'　',field:' '}"//解决最后一列错位
      paramsString = '[' + paramsString + ']';
      break;
    case 'case2checkresultExcel'://case2checkresultGrid
      paramsString = formatTitleExcel(case2checkresult);
      break;
    case 'case2outlet':
      paramsString = formatTitle(case2outlets);
      break;
    case 'case2outletGrid':
      paramsString = formatTitleGrid(case2outlets);
      // paramsString += ',' + "{title:'　',field:' '}"//解决最后一列错位
      paramsString = '[' + paramsString + ']';
      break;
    case 'case2outletExcel':
      paramsString = formatTitleExcel(case2outlets);
      break;
    case 'case2sku':
      paramsString = formatTitle(case2skus);
      break;
    case 'case2skuGrid':
      paramsString = formatTitleGrid(case2skus);
      // paramsString += ',' + "{title:'　',field:' '}"//解决最后一列错位
      paramsString = '[' + paramsString + ']';
      break;
    case 'case2skuExcel':
      paramsString = formatTitleExcel(case2skus);
      break;
    case 'case2sales':
      paramsString = formatTitle(case2sales);
      break;
    case 'case2salesGrid':
      paramsString = formatTitleGrid(case2sales);
      // paramsString += ',' + "{title:'　',field:' '}"//解决最后一列错位
      paramsString = '[' + paramsString + ']';
      break;
    case 'case2salesExcel':
      paramsString = formatTitleExcel(case2sales);
      break;
    case 'case2package':
      paramsString = formatTitle(case2packages);
      break;
    case 'case2packageGrid':
      paramsString = formatTitleGrid(case2packages);
      // paramsString += ',' + "{title:'　',field:' '}"//解决最后一列错位
      paramsString = '[' + paramsString + ']';
      break;
    case 'case2packageExcel':
      paramsString = formatTitleExcel(case2packages);
      break;
    default:
      paramsString = "";
      break;
  }
  //console.log("paramsString"+paramsString);
  cb(paramsString);
}


function paramDb(parameterName, resultName, cb) {
  var paramsString, paramsString2, paramsString3;
  var parameters = mongoose.model('param', ppsSchemas);//(表名，schema)定义了一个叫ka的model
  parameters.find({ name: parameterName }, function (err, docs, docs2) {
    if (err) {
      console.log(err.stack);
    }

    docs.forEach(function (element) {
      switch (resultName) {
        case 'agreement':
          var arrs = element.params;
          paramsString = formatParams(arrs);
          break;
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
          paramsString = formatTitleGrid(arrs, '', '', '', 300);
          paramsString += ',' + "{title:'　',field:' ',rowspan:1}"//解决最后一列错位
          paramsString = '[' + paramsString + ']';
          break;
        case 'setAgreement':
          var arrs = setAgreement.concat(element.params);
          paramsString = formatTitle(arrs);
          break;
        case 'setAgreementGrid':
          var arrs = setAgreement.concat(element.params);
          paramsString = formatTitleGrid(arrs, '', '', '', 300);
          // paramsString += ',' + "{title:'　',field:' ',width:20}"//解决最后一列错位
          paramsString += ',' + "{title:'　',field:' ',width:18,colspan:1}"//解决最后一列错位
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
          paramsString2 = formatTitleGrid(calcResultFrozen, '', '', '', 100);
          paramsString = formatTitleGrid(calcResult1, '', rowspan, colspan, 100);
          paramsString += ',' + formatTitleGrid(calcResult2, '', rowspan, '', 100);
          paramsString += '],[' + formatTitleGrid(element.params, '生动化目标', '', '', 200);
          paramsString += ',' + formatTitleGrid(element.params, '生动化检查结果', '', '', 200);
          paramsString += ',' + formatTitleGrid(element.params, '生动化奖励计算', '', '', 200);
          paramsString += ',' + "{title:'　',field:' ',rowspan:2}"//解决最后一列错位
          paramsString = '[' + paramsString + ']';
          paramsString2 = '[' + paramsString2 + ',]';
          // console.log('paramsGrid10=' + paramsString);
          break;
        case 'calcResultExcel':
          paramsString = "";
          var arrs = element.params;//setAgreement.concat(element.params);
          for (var i = 0; i < calcResultFrozen.length; i++) {
            paramsString += '"",';
          }
          for (var i = 0; i < calcResult1.length; i++) {
            paramsString += '"",';
          }
          for (var i = 0; i < arrs.length; i++) {
            paramsString += '"生动化目标",';
          }
          for (var i = 0; i < arrs.length; i++) {
            paramsString += '"生动化检查结果",';
          }
          for (var i = 0; i < arrs.length; i++) {
            if (i == arrs.length - 1) {
              paramsString += '"生动化奖励计算"';
            }
            else {
              paramsString += '"生动化奖励计算",';
            }
          }
          paramsString = '[' + paramsString + ']';
          paramsString2 = formatTitleExcel2(calcResultFrozen);
          paramsString2 += ',' + formatTitleExcel2(calcResult1);
          paramsString2 += ',' + formatTitleExcel2(arrs);
          paramsString2 += ',' + formatTitleExcel2(arrs);
          paramsString2 += ',' + formatTitleExcel2(arrs);
          paramsString2 += ',' + formatTitleExcel2(calcResult2);
          paramsString2 = '[' + paramsString2 + ']';
          paramsString3 = formatTitleExcel(arrs);
          // console.log("ppp="+paramsString3)
          break;
        case 'paramsList':
          var arrs = setAgreement.concat(element.params);
          paramsString = formatTitleExcel(arrs);
          break;
        default:
          paramsString = "{'" + paramsString + "':String}";
          break;
      }
      cb(paramsString, paramsString2, paramsString3);
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