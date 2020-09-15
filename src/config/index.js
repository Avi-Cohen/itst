const configValues = {
    userName: process.env.USER_NAME || 'Avi-Cohen',
    password: process.env.PASSWORD || 'aBc&eF12'
}

module.exports = {
    allPdfResults: process.env.ALL_PDF_RESULTS || '/Users/avicohen/vs-sandbox/itst/src/allPdfResults',
    getDbConnectionString: () => {
        return `mongodb+srv://${configValues.userName}:${configValues.password}@itst-db.32ui5.mongodb.net/itst-db?retryWrites=true&w=majority`
    }

}
