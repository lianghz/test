var checkresult = require('./models/test/test.js');
module.exports = function (app) {
    app.get('/test', function (req, res) {
        var st = "1"
        if (st == "1") {
            st = "2";
        }
        var st = "1"
        console.log("st=" + st1)
    });
}