var configValues = require('./config');

module.exports = {
    allPdfResults: process.env.ALL_PDF_RESULTS || './src/allPdfResults',
    getDbConnectionString: () => {
        return `mongodb+srv://${configValues.userName}:${configValues.password}@itst-db.32ui5.mongodb.net/itst-db?retryWrites=true&w=majority`
    }

}
