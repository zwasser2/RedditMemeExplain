const puppeteer = require('puppeteer');
const fs = require('fs');

let scrape = async () => {
    var allMemes = []
    let browser = await puppeteer.launch({headless: false});
    let page = await browser.newPage();

    let counter = 0
    let insideCounter = 1
    await page.goto('https://knowyourmeme.com/memes/page/1', {waitUntil: 'domcontentloaded'});
    await page.waitFor(1000);
    let numberOfPages = await page.evaluate(() => {
        const entriesPerPage = 16
        let numberEntries = document.getElementsByTagName('HGroup')[0].innerText
        numberEntries = numberEntries.replace(/\D/g,'')
        return Math.ceil(parseInt(numberEntries) / entriesPerPage)
    })
    try {
        // Closing and opening a new session results in being banned less
        const checksPerBrowserSession = 14
        const timeToOpenNewPage = Math.ceil(numberOfPages / checksPerBrowserSession)
        while (counter <= timeToOpenNewPage) {
            // Know your meme would throw a bad page at checksPerBrowserSession pages. This is to get around this.
            insideCounter = 1
            while (insideCounter < checksPerBrowserSession) {
                const result = await page.evaluate(() => {
                    var listAllMemes = []
                    const grid = document.getElementsByClassName("entry-grid-body")[0]
                    for (let i = 0; i < grid.children.length; i ++) {
                        for (var j = 0; j < grid.children[i].children.length; j ++) {
                            if (typeof grid.children[i].children[j].children[1] !== 'string' && typeof grid.children[i].children[j].children[1] !== 'undefined') {
                                let str = grid.children[i].children[j].children[1].innerText
                                str = str.replace(/[.,\/#!?$'%\^&\*;:{}=\-_`~()]/g,"").toLowerCase()
                                listAllMemes.push(str)
                            }
                        }
                    }
                    return listAllMemes
                })
                allMemes = allMemes.concat(result)
                insideCounter ++
                await page.goto('https://knowyourmeme.com/memes/page/' + (counter * checksPerBrowserSession + insideCounter), {waitUntil: 'domcontentloaded'});
                await page.waitFor(1000);
            }
            counter ++
            browser.close();
            browser = await puppeteer.launch({headless: false});
            page = await browser.newPage();
            await page.goto('https://knowyourmeme.com/memes/page/' + (counter * checksPerBrowserSession + 1), {waitUntil: 'domcontentloaded'});
            await page.waitFor(1000);
        }
    } catch(err) {
        fs.writeFile('textFile.txt', allMemes);
        // If we crash, tell where to restart at
        console.log(counter)
        console.log(insideCounter - 1)
    }
    browser.close();
    return allMemes;
};

scrape().then((value) => {
    fs.writeFile('textFile.txt', value);
});



