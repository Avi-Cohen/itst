const fs = require('fs');
const pdfParse = require('pdf-parse');
const config = require('../config');
const swimmerModel = require('../db/swimmerModel');
const resultModel = require('../db/resultModel');
const mongoose = require('mongoose');
const shortid = require('shortid');
const _ = require('lodash');

module.exports = {
    parseEachFile
};

// TODO

// 1. Add personal best 
// 2. check for personal best

async function parseEachFile() {
    const files = fs.readdirSync(config.allPdfResults); // array of all file names 
    for (const file of files.slice(1)) {
        const path = __dirname + '/../allPdfResults/' + file;
        const dataBuffer = fs.readFileSync(path);
        try {
            await parseResults(dataBuffer, file);
        } catch (error) {
            console.log(error);
        }
    }
    return ('done uploading to DB');
}


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
            eventName: file.slice(0, 6),
            gender: getGender(file.slice(7, 8)),
            date: rows[5].slice(0, 10)

        }

        // in case there is more than 1 page -> Reindexing 
        for (let i = firstPlaceIndex; i < rows.length; i += 5) {
            // i = rows[i] != previousPosition + 1 ? i+3 : i; 
            // currentPosition = rows[i];
            // previousPosition++;
            currentPosition = rows[i];
            if (currentPosition != previousPosition + 1) {
                i += 3;
                previousPosition++;
                currentPosition = rows[i];
            } else {
                previousPosition++;
            }


            const swimmerQuery = {
                name: reverseString(_.get(rows, [i + 1], `NAME Error-FILE-${file}-INDEX-${i}`)),
                yearOfBirth: rows[i + 2],
                club: reverseString(_.get(rows, [i + 3], `CLUB Error-FILE-${file}-INDEX-${i}`)),
                gender: eventInfo.gender
            }

            let swimmer = await swimmerModel.findOne(swimmerQuery); // check if swimmer already exists id DB

            if (swimmer) {
                const { swimmerId } = swimmer;
                const time = convertToComparableResult(rows[i + 4].slice(2, 10));
                // TODO below
                // const swimmerBestTime = convertToComparableResult(swimmer.bestTimes[eventInfo.eventName].time);
                // if (!swimmer.bestTimes[eventInfo.eventName] || time < swimmerBestTime){
                //     // insert new best time to mongo here
                //     swimmerModel.update({ swimmerId }, getSwimmerBestTimeUpdateQuery(swimmerBestTime, eventInfo.eventName));
                // }
            }
            if (!swimmer) {
                swimmer = { ...swimmerQuery, ...{ id: generateId(), bestTimes: {} } };
                swimmersArray.push(swimmer);
            }

            const resultQuery = {
                swimmerId: swimmer.id,
                event: eventInfo.eventName,
                heat: rows[i + 4][0],
                lane: rows[i + 4][1],
                date: eventInfo.date,
                meet: eventInfo.meetName
            }

            let result = await resultModel.findOne(resultQuery); // check if result already exists id DB
            if (!result) {
                const result = generateResult(rows, i, swimmer, eventInfo);
                resultsArray.push(result);
            }
        }
        await addDataToDb(swimmersArray, resultsArray);
    } catch (err) {
        console.log({ message: err });
    }
}

function getSwimmerBestTimeUpdateQuery(swimmerBestTime, eventName) {
    return {
        [`bestTimes.${eventName}.displayTime`]: swimmerBestTime,
        [`bestTimes.${eventName}.time`]: convertToComparableResult(swimmerBestTime)
    };
}

function convertToComparableResult(result) {
    return (result.slice(0, 2) * 60 + result.slice(3, 5) * 1 + result.slice(6) / 100) * 1000 //return in MS
}

function reverseString(str) {
    return str.split(' ').reverse().join(' ')
}

function getGender(gen) {
    return (gen === 'W') ? 'Female' : 'Male';
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

async function addDataToDb(swimmersArray, resultsArray) {
    const promises = [
        swimmerModel.create(swimmersArray),
        resultModel.create(resultsArray)
    ];
    const [swimmers, results] = await Promise.all(promises);
    console.log(`${_.get(swimmers, 'length') ? `swimmers: ${swimmers.map(swimmer => swimmer.name).join(', ')}` : 'No new swimmers recorded'}`);
    console.log(`${_.get(results, 'length') ? `results: ${results.map(result => result.time).join(', ')}` : 'No results'}`);
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

