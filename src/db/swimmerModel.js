var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var swimmerSchema = new Schema({
    id: String,
    gender: String,
    name: String,
    yearOfBirth: String,
    club: String
})

let Swimmers = mongoose.model('Swimmers', swimmerSchema)

module.exports = Swimmers;