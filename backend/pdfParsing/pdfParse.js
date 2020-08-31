const fs = require('fs');
const pdfParse = require('pdf-parse');

// get all the file names from the allPdfResults folder
const files = fs.readdirSync('/Users/avicohen/vs-sandbox/itst/backend/pdfParsing/allPdfResults');

files.forEach(file => {
    console.log(__dirname + '/allPdfResults/' + file)
    const dataBuffer = fs.readFileSync(__dirname + '/allPdfResults/' + file);
    try {
        parseResults(dataBuffer);
    } catch (error) {
        console.log(error);
    }
    
})

async function parseResults(buffer) {
    const data = await pdfParse(buffer);
    const rows = data.text.split('\n');
    const firstPlaceIndex = rows.findIndex((row, index) => row === '1' && rows[index + 5] === '2') // find the index of the first result
    const parsedResults = [];
    for (let i = firstPlaceIndex; i < rows.length; i += 5) {
        parsedResults.push({
            name: reverseString(rows[i + 1]),
            yearOfBirth: rows[i + 2],
            club: reverseString(rows[i + 3]),
            heat: rows[i + 4][0],
            lane: rows[i + 4][1],
            time: rows[i + 4].slice(2, 10) || '',
            internationalScore: rows[i + 4].slice(10) || '0'
        });
    }
    console.log(parsedResults);
    return parsedResults;
}  

function reverseString(str) {
    return str.split(' ').reverse().join(' ')
}