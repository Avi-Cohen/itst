const fs = require('fs');
const pdfParse = require('pdf-parse');
const config = require('../../src/static/config');

// get all the file names from the allPdfResults folder
const files = fs.readdirSync(config.pathPdf);
const shortid = require('shortid');



var getFileNames = (() => {
    const files = fs.readdirSync('/Users/avicohen/vs-sandbox/itst/backend/pdfParsing/allPdfResults');
    files.slice(1).forEach(file => {
        let path = __dirname + '/allPdfResults/' + file;
        const dataBuffer = fs.readFileSync(path);
        try {
            parseResults(dataBuffer, file);
        } catch (error) {
            console.log(error);
        }
    })
})();


async function parseResults(buffer,file) {
    try {
        
        const data = await pdfParse(buffer);
        console.log(file);
        const rows = data.text.split('\n');
        const firstPlaceIndex = rows.findIndex((row, index) => row === '1' && rows[index + 5] === '2') // find the index of the first result
        const swimmersArray = [];
        const resultsArray = [];
        let previousPosition = 0;
        let currentPosition = 0;
        for (let i = firstPlaceIndex; i < rows.length; i += 5) {
            currentPosition = rows[i];
            if (currentPosition != previousPosition+1){
                i += 3;
                previousPosition++;
                currentPosition = rows[i];
            } else {
                previousPosition++;
            }
            let generatedId = shortid.generate();
            swimmersArray.push({
                id: generatedId,
                name: reverseString(rows[i + 1]),
                yearOfBirth: rows[i + 2],
                club: reverseString(rows[i + 3])
            })
            resultsArray.push({
                swimmerId: generatedId,
                event: file.slice(0,7),
                heat: rows[i + 4][0],
                lane: rows[i + 4][1],
                meet: rows[6].slice(12),
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
            })
        }
        console.log(swimmersArray);
        console.log(resultsArray);
        
    } catch (err) {
        console.log({ message: err });
    }
}

function reverseString(str) {
    return str.split(' ').reverse().join(' ')
}