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
            date: rows[5].slice(0, 10),
            course: 'SCM'
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
                const  swimmerId  = swimmer.id;
                const time = convertToComparableResult(rows[i + 4].slice(2, 10));
                
                // TODO below
                const swimmerBestTime = convertToComparableResult(swimmer.bestTimes[eventInfo.eventName].displayTime);
                //console.log(swimmerBestTime)
                if (swimmer.bestTimes[eventInfo.eventName].time === 0 || time < swimmerBestTime){
                    // insert new best time to mongo here
                    await swimmerModel.updateOne({ id:swimmerId }, getSwimmerBestTimeUpdateQuery(time, eventInfo.eventName, rows[i+4]),
                    function (err, docs) { 
                        if (err){ 
                            console.log(err) 
                        } 
                        // else{ 
                        //     console.log("Updated Docs : ", docs); 
                        // }
                    } );
                }
            }
            if (!swimmer) {
                swimmer = { ...swimmerQuery, ...{ id: generateId(), bestTimes: events } };
                swimmersArray.push(swimmer);
            }

            const {course} = eventInfo;
            const {date} = eventInfo;
            const {eventName} = eventInfo
            
            const resultQuery = {
                swimmerId: swimmer.id,
                eventName,
                heat: rows[i + 4][0],
                lane: rows[i + 4][1],
                date,
                meet: eventInfo.meetName,
                course
            }

            let result = await resultModel.findOne(resultQuery); // check if result already exists id DB
            if (!result) {
                const result = generateResult(rows[i + 4], resultQuery);
                resultsArray.push(result);
            }
        }
        await addDataToDb(swimmersArray, resultsArray);
    } catch (err) {
        console.log({ message: err });
    }
}

function getSwimmerBestTimeUpdateQuery(time, eventName, row) {
    return {
        [`bestTimes.${eventName}.displayTime`]: row.slice(2, 10),
        [`bestTimes.${eventName}.time`]: time
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

function generateResult(row, resultQuery) {
    let time;
    let internationalScore;
    if (!['D', 'N'].includes(row[2])) {
        time = row.slice(2, 10);
        internationalScore = Number(row.slice(10));
    } else {
        time = row.slice(2, 4);
        internationalScore = 0;
    }
    return { ...resultQuery, ...{ time, internationalScore } };
    // return addTimeAndInternationalScore(resultQuery, rows[i + 4]);
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


const events = {
'0050FL': {
    displayTime:'',
    time: 0
        },
'0100FL': {
    displayTime:' ',
    time: 0
        },
'0200FL': {
    displayTime:' ',
    time: 0
        },
'0050BA': {
    displayTime:' ',
    time: 0
        },
'0100BA': {
    displayTime:' ',
    time: 0
        },
'0200BA': {
    displayTime:' ',
    time: 0
        },
'0050BR': {
    displayTime:' ',
    time: 0
        },
'0100BR': {
    displayTime:' ',
    time: 0
        },
'0200BR': {
    displayTime:' ',
    time: 0
        },
'0050FR': {
    displayTime:' ',
    time: 0
        },
'0100FR': {
    displayTime:' ',
    time: 0
        },
'0200FR': {
    displayTime:' ',
    time: 0
        },
'0400FR': {
    displayTime:' ',
    time: 0
        },
'0800FR': {
    displayTime:' ',
    time: 0
        },
'1500FR': {
    displayTime:' ',
    time: 0
        },
'0100IM': {
    displayTime:' ',
    time: 0
        },
'0200IM': {
    displayTime:' ',
    time: 0
        },
'0400IM': {
    displayTime:' ',
    time: 0
        }
}