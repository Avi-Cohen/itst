const fs = require('fs');
const pdfParse = require('pdf-parse');
const config = require('../config');
const swimmerModel = require('../db/swimmerModel');
const resultModel = require('../db/resultModel');
const mongoose = require('mongoose');
const shortid = require('shortid');


module.exports = function parseEachFile() {
    const files = fs.readdirSync(config.allPdfResults); // array of all file names 
    files.slice(1).forEach(file => {
        const path = __dirname + '/../allPdfResults/' + file;
        const dataBuffer = fs.readFileSync(path);
        try {
            parseResults(dataBuffer, file);
        } catch (error) {
            console.log(error);
        }
    })
    return ('done uploading to DB');
};


async function parseResults(buffer, file) {
    try {
        const data = await pdfParse(buffer);
        console.log(file);
        const rows = data.text.split('\n');
        if (!rows.length) throw `No results for file: ${file}`;
        const firstPlaceIndex = rows.findIndex((row, index) => row === '1' && rows[index + 5] === '2') // find the index of the first result
        const swimmersArray = [];
        const resultsArray = [];
        let previousPosition = 0;
        let currentPosition = 0;

        const eventInfo = {
            meetName: reverseString(rows[5].slice(37)),
            eventName: rows[6].slice(13),
            gender: getGender(rows),
            date: rows[5].slice(0, 10)

        }

        // in case there is more than 1 page -> Reindexing 
        for (let i = firstPlaceIndex; i < rows.length; i += 5) {
            currentPosition = rows[i];
            if (currentPosition != previousPosition + 1) {
                i += 3;
                previousPosition++;
                currentPosition = rows[i];
            } else {
                previousPosition++;
            }

            const swimmerQuery = {
                name: reverseString(rows[i + 1]),
                yearOfBirth: rows[i + 2],
                club: reverseString(rows[i + 3]),
                gender: eventInfo.gender
            }

            let swimmer = await swimmerModel.findOne(swimmerQuery); // check if swimmer already exists id DB

            if (!swimmer) {
                swimmer = { ...swimmerQuery, ...{ id: generateId() } };
                swimmersArray.push(swimmer);
            }


            const result = generateResult(rows, i, swimmer, eventInfo);
            resultsArray.push(result);

        }
        // console.log(swimmersArray);
        console.log(resultsArray);

        swimmerModel.create(swimmersArray);
        resultModel.create(resultsArray);
    } catch (err) {
        console.log({ message: err });
    }

}

function reverseString(str) {
    return str.split(' ').reverse().join(' ')
}

function getGender(rows) {
    return (rows[6][9] === 'נ') ? 'Female' : 'Male';
}

function generateId() {
    return shortid.generate();
}

function generateResult(rows, i, swimmer, eventInfo) {
    const { id: swimmerId } = swimmer;
    const { meetName, eventName, date } = eventInfo;
    let res = {
        swimmerId,
        event: eventName,
        heat: rows[i + 4][0],
        lane: rows[i + 4][1],
        date,
        meet: meetName
    }
    return addTimeAndInternationalScore(res, rows[i + 4]);
}

function addTimeAndInternationalScore(res, row) {
    let time;
    let internationalScore;
    if (!['D', 'N'].includes(row[2])) {
        time = row.slice(2, 10);
        internationalScore = Number(row.slice(10));
    } else {
        time = row.slice(2, 4);
        internationalScore = 0;
    }
    return { ...res, ...{ time, internationalScore } };
}

