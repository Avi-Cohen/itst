const pdfParse = require('./static/parsePdfAndAddToDb');
const swimmerModel = require('./db/swimmerModel');
const resultModel = require('./db/resultModel');
const mongoose = require('mongoose');
const config = require('./config') // import from index.js inside config

let connectionState = () => { return console.log(mongoose.connection.readyState)};
mongoose.connect(config.getDbConnectionString(), { useNewUrlParser: true, useUnifiedTopology: true });
setTimeout(connectionState, 8000)
connectionState();

