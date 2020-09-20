var mongoose = require('mongoose');

const Schema = mongoose.Schema;

let resultSchema = new Schema({
    swimmerId: String,
    event: String,
    heat: String,
    lane: String,
    date: String,
    meet: String,
    time: String,
    internationalScore: String,
    course: String,
    eventName: String, 
    gender: String
});

var Results = mongoose.model('Results', resultSchema);

module.exports = Results;