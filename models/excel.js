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

    // jsonData.docs.forEach(function (element) {
    //     var arryStr = "";
    //     for (var i = 0; i < header.length; i++) {
    //         arryStr += '"' + (element[header[i]] ? element[header[i]] : "") + '",';
    //     }
    //     var arry = eval("([" + arryStr + "])");
    //     data_content.push(arry);
    // });
    
    var elements = jsonData.docs;
    for (var key in elements) {//这里in是得到key，而不是值，差点入坑了。
        var arryStr="";
        var elms = JSON.stringify(elements[key]);//如果不加上这2行转换，就有时可以读取，有时得到undifined，不知何解了
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
//==========methods
var methods = { "ExcelToJson": excelToJson, "JsonToExcel": jsonToExcel }

module.exports = methods;


