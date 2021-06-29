const pageScraper = require("./pageScraper");
const fs = require("fs");

const scrapeAll = async (browserInstance) => {
  try {
    const browser = await browserInstance;
    console.log("Start Time: ", new Date());
    let scrapedData = await pageScraper.scraper(browser, "Wa");
    await browser.close();
    console.log("End Time: ", new Date());

    // Write data to file
    fs.writeFile("data.json", JSON.stringify(scrapedData, null, 2), "utf8", (err) => {
      if (err) {
        return console.log("Write file error!", err);
      }
      console.log("The data has been scraped and saved successfully! View it at './data.json'");
    });
  } catch (err) {
    console.log("Could not resolve the browser instance: ", err);
  }
};

module.exports = (browserInstance) => scrapeAll(browserInstance);
