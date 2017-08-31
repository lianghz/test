var mongoose = require('mongoose');
var ppsSchemas = mongoose.Schema({
  name: String,
  params: [String],
});


var paramsModelName = 'param';
var paramsCollName = 'params';
var versions = ["周期", "版本", "描述", "保存时间", "修改时间", "操作人", "状态"];
//case1
var outlets = ["办事处", "发放频率", "考核销量售点", "SAP售点", "客户名称", "客户", "DME发放协议号", "协议名称", "协议号费用周期", "淡季销量目标/元/月", "旺季销量目标/元/月", "销量目标/元/月", "淡季折扣/月/元", "旺季折扣/月/元", "折扣/月/元", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var outlets2 = ["办事处", "发放频率", "考核销量售点", "SAP售点", "客户名称", "客户", "DME发放协议号", "协议名称", "协议号费用周期", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var mmsales = ["MM售点", "SAP售点", "Name", "渠道", "销量", "收入"];
var checkResult = ["MM售点", "SAP售点", "BU", "办事处", "协议", "店名", "地址"];
var setAgreement = ["SAP售点", "数据类型"];
var calcResultFrozen = ["办事处", "考核销量售点", "SAP售点"];
var calcResult1 = ["客户名称", "客户", "DME发放协议号", "协议名称", "协议号费用周期", "费用时间段", "发放频率", "销量目标/元/月", "折扣/月/元", "费用合计", "核对结果", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var calcResult2 = ["实际收入（元）", "计算结果（元）（不含销量考核）", "合计目标收入", "合计实际收入", "计算结果合计（包含销量考核）", "备注"];
var case1Header = {
  'outlets': outlets, 'outlets2': outlets2, 'mmsales': mmsales, 'checkResult': checkResult, 'setAgreement': setAgreement,
  'calcResultFrozen': calcResultFrozen, 'calcResult1': calcResult1, 'calcResult2': calcResult2, 'paramsModelName': paramsModelName, 'paramsCollName': paramsCollName,
  'agreement': ''
};//header 用于历史版本保存表头
//case 2
var case2checkresult = ["办事处", "售点", "名称", "冰柜盘点表", "下家分销表"];
var case2outlets = ["办事处", "售点", "名称", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];
var case2skus = ["产品代码", "产品名称", "产品分类"];
var case2packages = ["序号", "产品代码", "产品名称"];
var case2sales = ["办事处", "售点", "名称", "产品代码", "产品名称", "销量"];
var case2CalcResult = ["售点", "名称", "产品代码", "产品名称", "产品类型", "常备包装的达成100%", "冰柜盘点表", "下家分销表", "目标销量", "实际销量", "销量达成率", "折扣标准（元）", "返还金额","超额销量","超额折扣","实际返还"]
var case2Header = {
  'case2checkresult': case2checkresult, 'case2outlets': case2outlets, 'case2skus': case2skus,
  'case2packages': case2packages, 'case2sales': case2sales, 'case2CalcResult': case2CalcResult, 'paramsModelName': paramsModelName
  , 'paramsCollName': paramsCollName, 'agreement': ''
}

var FieldDate = ',保存时间,修改时间,';
var FieldNumber = ',产品代码,序号,';
// var FieldDouble='';

function formatTitle(arrs) {
  // var titleStr = '{"' + arrs.join('":String,"') + '":String}';

  var titleStr = '{';
  var i = 0;
  arrs.map(function (elm) {
    var elm2 = ',' + elm + ',';
    var FieldType = 'String';
    if (FieldNumber.indexOf(elm) > -1) {
      FieldType = 'Number';
    } else if (FieldDate.indexOf(elm) > -1) {
      FieldType = 'Date';
    }
    if (i == 0) {
      titleStr = titleStr + '"' + elm + '":' + FieldType;
    } else {
      titleStr = titleStr + ',"' + elm + '":' + FieldType;
    }
    i++;
  });
  titleStr = titleStr + '}';
  // console.log('titleStr=' + titleStr);
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
  // console.log('arrs='+arrs);
  var paramsString = arrs.map(function (elm) {
    i++;

    iv = (i == 0) ? "" : i;
    if (elm.indexOf('名称') > -1 || elm == '描述' || elm == '备注') {
      w = "width:300";
    } else if (elm.slice(0, 1) == 'P' && elm.length < 4) {
      w = "width:50";
    } else if (elm.indexOf("售点") > -1 || elm == '数据类型' || elm == '客户' || elm == '周期') {
      w = "width:100";
    } else if (elm == '保存时间' || elm == '修改时间'|| elm == '办事处'|| elm == '协议'|| elm == '店名'|| elm == '地址') {
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
    case 'case2calcResult':
      paramsString = formatTitle(case2CalcResult);
      break;
    case 'case2calcResultGrid':
      paramsString = formatTitleGrid(case2CalcResult);
      // paramsString += ',' + "{title:'　',field:' '}"//解决最后一列错位
      paramsString = '[' + paramsString + ']';
      break;
    case 'case2calcResultExcel':
      paramsString = formatTitleExcel(case2CalcResult);
      break;
    default:
      paramsString = "";
      break;
  }
  //console.log("paramsString"+paramsString);
  cb(paramsString);
}


//动态传入paramsCollName（表名），获取对应历史参数
function paramDb(parameterName, resultName, cb) {
  var paramsString, paramsString2, paramsString3;
  var parameters = mongoose.model(paramsModelName, ppsSchemas, paramsCollName);//(表名，schema)定义了一个叫ka的model

  parameters.find({ name: parameterName }, function (err, docs, docs2) {
    if (err) {
      console.log(err.stack);
    }

    docs.forEach(function (element) {
      // console.log('ppppp='+resultName);
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

function getHeader(casenum, cb) {
  var parameters = mongoose.model(paramsModelName, ppsSchemas, paramsCollName);//(表名，schema)定义了一个叫ka的model
  parameters.find({ name: 'agreements' }, function (err, docs, docs2) {
    if (err) {
      console.log(err.stack);
    } else {
      case1Header.agreement = docs[0]['params'];
      case2Header.agreement = docs[0]['params'];
      switch (casenum) {
        case 'case1':
          // console.log("hhhhh1="+JSON.stringify(case1Header))
          cb(case1Header);
          break;
        case 'case2':
          cb(case2Header);
          break;
      }
    }
  })
}

function setheader(casenum, caseheader) {
  // console.log('caseheader='+JSON.stringify(caseheader));
  caseheader = JSON.parse(JSON.stringify(caseheader))
  caseheader = caseheader[0]['params'];
  // console.log('caseheader=' + caseheader.calcResultFrozen);
  switch (casenum) {

    case 'case1':
      case1Header = caseheader;
      calcResult1 = case1Header.calcResult1;
      calcResult2 = case1Header.calcResult2;
      calcResultFrozen = case1Header.calcResultFrozen;
      checkResult = case1Header.checkResult;
      mmsales = case1Header.mmsales;
      outlets = case1Header.outlets;
      outlets2 = case1Header.outlets2;
      setAgreement = case1Header.setAgreement;
      paramsModelName = case1Header.paramsModelName;
      paramsCollName = case1Header.paramsCollName;
      break;
    case 'case2':
      case2Header = caseheader;
      case2CalcResult = case2Header.case2CalcResult;
      case2checkresult = case2Header.case2checkresult;
      case2outlets = case2Header.case2outlets;
      case2packages = case2Header.case2packages;
      case2sales = case2Header.case2sales;
      case2skus = case2Header.case2skus;
      break;
  }
}

function paramDbv(parameterName, resultName, caseheader, casenum, cb) {
  // console.log('caseheader='+caseheader);
  if (caseheader != "") {
    setheader(casenum, caseheader);
  }

  paramDb(parameterName, resultName, cb);
}

function paramNoDbv(resultName, casenum, caseheader, cb) {
  if (caseheader != "") {
    setheader(casenum, caseheader);
    // console.log("case2CalcResult="+case2CalcResult)
  }
  paramNoDb(resultName, cb);
}

//// methods-----------------
var methods = {
  'paramNoDb': paramNoDb,
  'paramDb': paramDb,
  'paramNoDbv': paramNoDbv,
  'paramDbv': paramDbv,
  'getHeader': getHeader,
};

module.exports = methods;