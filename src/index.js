var pdfParse = require('./static/pdfParse');
var swimmerModel = require('./db/swimmerModel');
var resultModel = require('./db/resultModel');
var mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Avi-Cohen:aBc&eF12@itst-db.32ui5.mongodb.net/itst-db?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

swimmerModel.create(pdfParse[0]);
resultModel.create(pdfParse[1]);