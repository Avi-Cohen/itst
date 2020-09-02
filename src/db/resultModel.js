var mongoose = require('mongoose');

const Schema = mongoose.Schema;

let resultSchema = new Schema({
    swimmerId: String,
    event: String,
    heat: String,
    lane: String,
    meet: String,
    time: String,
    internationalScore: String
});

var Results = mongoose.model('Results', resultSchema);

module.exports = Results;