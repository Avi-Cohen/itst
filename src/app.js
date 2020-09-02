const pdfParse = require('./static/parsePdfAndAddToDb');
const swimmerModel = require('./db/swimmerModel');
const resultModel = require('./db/resultModel');
const mongoose = require('mongoose');
const config = require('./config') // import from index.js inside config

let connectionState = () => { return console.log(mongoose.connection.readyState)};
let createModel = (model, index) => {model.create(pdfParse[index]); return `${model} created and saved to DB`}

mongoose.connect(config.getDbConnectionString(), { useNewUrlParser: true, useUnifiedTopology: true });
setTimeout(connectionState, 8000)
// setTimeout(createModel(swimmerModel, 0), 10000);
// setTimeout(createModel(resultModel, 1), 10000);
console.log(pdfParse());
// swimmerModel.create(pdfParse[0]);
// resultModel.create(pdfParse[1]);

