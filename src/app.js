require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config'); // import from index.js inside config
const { parseEachFile } = require('./static/parsePdfAndAddToDb');
const express = require('express');
const bodyParser = require('body-parser')

const app = express();
//const swimmerRouter = require('./static/routes')(swimmerModel);

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(config.getDbConnectionString(), { useNewUrlParser: true, useUnifiedTopology: true });
parseEachFile();

app.listen(port, () => {
    console.log(`listening to port: ${port}`);
})