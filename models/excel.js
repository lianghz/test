XLSX = require('xlsx');
var nodexlsx = require('node-xlsx');
var fs = require('fs');
function excelToJson(fileName, sheetName) {
    var workbook = XLSX.readFile(fileName);
    var first_sheet_name = workbook.SheetNames[0];
    if (!sheetName) sheetName = first_sheet_name;
    var worksheet = workbook.Sheets[sheetName];
    // console.log(sheetName);
    return XLSX.utils.sheet_to_json(worksheet);

}

function jsonToExcel(jsonData, fileName, cb) {
    // console.log("fff="+excelField);
    // console.log("rrr="+result);
    var header = eval("(" + jsonData.excelHeader + ")");
    var data_content = [header];
    var elements = jsonData.docs;
    for (var key in elements) {//循环每行记录///这里in是得到key，而不是值，差点入坑了。
        var arryStr = "";
        var elms = JSON.stringify(elements[key]);//获取行记录。如果不加上这2行转换，就有时可以读取，有时得到undifined，不知何解了
        elms = JSON.parse(elms);
        for (var i = 0; i < header.length; i++) {
            // console.log(elms[0]);
            arryStr += '"' + (elms[header[i]] ? elms[header[i]] : "") + '",';
        }
        var arry = eval("([" + arryStr + "])");
        data_content.push(arry);
    };
    // console.log(data_content);

    var file = nodexlsx.build([{
        name: 'sheet1',
        data: data_content
    }]);   //构建xlsx对象
    fs.writeFileSync('public/files/' + fileName, file, 'binary');
    cb('<center><p>&nbsp;<p><a href="/files/' + fileName + '">请点该链接击下载:' + fileName + '</a></center>');
}

function jsonToExcelAuto(jsonData, fileName, cb) {
    // console.log("fff="+excelField);
    //  console.log("rrr="+jsonData.excelHeader);
    var header = eval("(" + jsonData.excelHeader + ")");
    // console.log('ddddd='+header);
    var header1 = eval("(" + jsonData.excelHeader + ")");
    var header2 = eval("(" + jsonData.excelHeader2 + ")");
    var argmentList = eval("(" + jsonData.argmentList + ")");

    var data_content = [header1];
    data_content.push(header2);
    var elements = jsonData.docs;

    for (var key in elements) {//循环每行记录///这里in是得到key，而不是值，差点入坑了。
        var arryStr = "";
        var elms = JSON.stringify(elements[key]);//获取行记录。如果不加上这2行转换，就有时可以读取，有时得到undifined，不知何解了
        //elms = JSON.parse(elms);
        // elms = eval("("+JSON.parse(elms)+")");
        elms = eval("("+elms+")");
        var h1Len = header1.length;
        //console.log(JSON.stringify(elements[key]));
        for (var i = 0; i < header2.length; i++) {
            var elms2= elms[header1[i]];
            if (i < h1Len) {
                if (header1[i] != "") {
                    arryStr += '"' + (elms2 ? elms2[header2[i]]?elms2[header2[i]]:"" : "") + '",';
                }
                else {
                    arryStr += '"' + (elms[header2[i]] ? elms[header2[i]] : "") + '",';
                }
            } else {
                arryStr += '"' + (elms[header2[i]] ? elms[header2[i]] : "") + '",';
            }
        }
        var arry = eval("([" + arryStr + "])");
        data_content.push(arry);
    };
    // console.log('header1=' + header1);

    var file = nodexlsx.build([{
        name: 'sheet1',
        data: data_content
    }]);   //构建xlsx对象
    fs.writeFileSync('public/files/' + fileName, file, 'binary');
    cb('<center><p>&nbsp;<p><a href="/files/' + fileName + '">请点该链接击下载:' + fileName + '</a></center>');
}
//return _.extend(outlet, { '实际收入（元）': revenue, '生动化目标': seasonAward, '生动化检查结果': checkResult, '生动化奖励计算': awardResult, '售点销量': sales }, awardSum);

//==========methods
var methods = {
    "ExcelToJson": excelToJson,
    "JsonToExcel": jsonToExcel,
    "jsonToExcelAuto": jsonToExcelAuto
}

module.exports = methods;


