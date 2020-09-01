var shortid = require('shortid');
let i = 0;
while (i<100){
    console.log(shortid.generate()); // e.g. S1cudXAF
    i++;
}