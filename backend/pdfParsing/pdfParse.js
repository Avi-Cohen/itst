const fs = require('fs');
const pdfParse = require('pdf-parse');

// get all the file names from the allPdfResults folder
const files = fs.readdirSync('/Users/avicohen/vs-sandbox/itst/backend/pdfParsing/allPdfResults');

files.forEach(file => {
    let path = __dirname + '/allPdfResults/' + file;
    console.log(path);
    const dataBuffer = fs.readFileSync(path);
    try {
        parseResults(dataBuffer);
    } catch (error) {
        console.log(error);
    }

})

async function parseResults(buffer) {
    try {
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
                time: (() => {
                    if (rows[i + 4][2] !== 'D' && rows[i + 4][2] !== 'N') {
                        return rows[i + 4].slice(2, 10);
                    } else {
                        return rows[i + 4].slice(2, 4);
                    }
                })(),

                internationalScore: (() => {
                    if (rows[i + 4][2] !== 'D' && rows[i + 4][2] !== 'N') {
                        return rows[i + 4].slice(10);
                    } else {
                        return '0';
                    }
                }
                )()
            });
        }
        console.log(parsedResults);
        return parsedResults;
    } catch (err) {
        console.log({ message: err });
    }
}

function reverseString(str) {
    return str.split(' ').reverse().join(' ')
}