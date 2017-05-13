var express = require('express');
var ka = require('./../models/ka.js');
var mongoose = require('mongoose');
var app = express();
var Q = require('q');




function getKaResult2(){
    ka.find({available: true }, function (err, kas) {
            var context = {
                rows: kas.map(function (vacation) {
                    return {
                        sku: vacation.sku,
                        name: vacation.name,
                        description: vacation.description,
                        price: vacation.getDisplayPrice(),
                        inSeason: vacation.inSeason,
                    }
                })
            };
            //res.render('vacations', context);
            console.log("cnt=" + context.rows);
            return context.rows;
    });
    console.log("getkaresultttt");
}

//var kaMathod = getKaResult();//{"getKaResult":getKaResult()};
exports.getKaResult=function(res){
    var kas = ka.find({available: true },
    function(err,docs){
        console.log(docs);
        res.send(docs);
    }
    );
    
    var a=[1,2];
    console.log(1);
    //return context;
}