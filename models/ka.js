var mongoose = require('mongoose');
var kaSchema = mongoose.Schema({
    name: String,
    slug: String,
    category: String,
    sku: String,
    description: String,
    priceInCents: Number,
    tags: [String],
    inSeason: Boolean,
    available: Boolean,
    requiresWaiver: Boolean,
    maximumGuests: Number,
    notes: String,
    packagesSold: Number,
});
kaSchema.methods.getDisplayPrice = function () {
    return '$' + (this.priceInCents / 100).toFixed(2);
};
var ka = mongoose.model('vacations', kaSchema);//(表名，schema)定义了一个叫ka的model
module.exports = ka;