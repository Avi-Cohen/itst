const pdfParse = require('./static/parsePdfAndAddToDb');
const swimmerModel = require('./db/swimmerModel');
const resultModel = require('./db/resultModel');
const mongoose = require('mongoose');
const config = require('./config'); // import from index.js inside config
const parsePdfAndAddToDb = require('./static/parsePdfAndAddToDb');

mongoose.connect(config.getDbConnectionString(), { useNewUrlParser: true, useUnifiedTopology: true });
parsePdfAndAddToDb;

