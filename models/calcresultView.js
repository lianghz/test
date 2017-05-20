///检查结果数据处理
var _ = require('underscore');

function getCalcResultViewModel(outlet,setArgeement,checkResult,sales) {
    // console.log("ssss="+checkResult);
    // if (!outlet) return {
    //     error: 'Unknown customer ID: '
    // };
    // // var vm = _.omit(customer, 'salesNotes');
    outlet  = JSON.parse(JSON.stringify(outlet));
    
    return _.extend(outlet,{'生动化目标': setArgeement,'生动化检查结果': checkResult,'售点销量': sales});
}

module.exports = getCalcResultViewModel;