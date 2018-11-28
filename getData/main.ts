const fetch2 = require('node-fetch');
// @ts-ignore
const cheerio:CheerioAPI = require('cheerio');


async function main() : Promise<void> {
    const res = await fetch2('https://imgflip.com/memetemplates');
    const text = await res.text();

    const $ = cheerio.load(text);
    const arr = $('div[data-id]');
    console.log(arr);
}
main();
//
// const stdin = process.openStdin();
//
// stdin.addListener("data", function(d) {
//     // note:  d is an object, and when converted to a string it will
//     // note:  d is an object, and when converted to a string it will
//     // end with a linefeed.  so we (rather crudely) account for that
//     // with toString() and then trim()
//     console.log("you entered: [" +
//         d.toString().trim() + "]");
// });
//
