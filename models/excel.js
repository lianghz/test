XLSX = require('xlsx');
function excelToJson(fileName)
{
    var workbook = XLSX.readFile(fileName);
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets["检查结果"];
    //console.log(first_sheet_name);
    return XLSX.utils.sheet_to_json(worksheet);
    
}

module.exports=excelToJson;

// function to_json(workbook) {
//     var result = {};
//     workbook.SheetNames.forEach(function(sheetName) {
//         var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
//         if(roa.length > 0){
//             result[sheetName] = roa;
//         }
//     });
//     return result;
// }

