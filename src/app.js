const mongoose = require('mongoose');
const config = require('./config'); // import from index.js inside config
const {parseEachFile} = require('./static/parsePdfAndAddToDb');

mongoose.connect(config.getDbConnectionString(), { useNewUrlParser: true, useUnifiedTopology: true });
parseEachFile();

