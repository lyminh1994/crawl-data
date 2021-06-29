// README: https://www.digitalocean.com/community/tutorials/how-to-scrape-a-website-using-node-js-and-puppeteer
// const browserObject = require("./browser");
// const scraperController = require("./pageController");

// Start the browser and create a browser instance
// const browserInstance = browserObject.startBrowser();

// Pass the browser instance to the scraper controller
// scraperController(browserInstance);

// Cook data and save to file
const fs = require("fs");

const files = [
  "./category_A.json",
  "./category_Ha.json",
  "./category_Ka.json",
  "./category_Ma.json",
  "./category_Na.json",
  "./category_Ra.json",
  "./category_Sa.json",
  "./category_Ta.json",
  "./category_Wa.json",
  "./category_Ya.json",
];

const results = [];
const error = [];
files.forEach((file) => {
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    data.forEach((item) => {
      if (!item.error) {
        const { name, favorite } = item;

        let n = name;
        let jp = "";
        if (name.includes("[") && name.includes("]")) {
          const fullName = name.split("[");
          n = fullName[0];
          jp = fullName[1].substring(0, fullName[1].length - 1);
        }

        let f = "";
        if (favorite) {
          f = favorite;
        }
        item = {
          name: n,
          japanName: jp,
          favorite: f,
          dateOfBirth: item.dateOfBirth,
          bloodType: item.bloodType,
          cityOfBorn: item.cityOfBorn,
          height: item.height,
          bust: item.bust,
          waist: item.waist,
          hip: item.hip,
          hobby: item.hobby,
          specialSkill: item.specialSkill,
          other: item.other,
        };
        results.push(item);
      } else {
        error.push(item);
      }
    });
  } catch (err) {
    console.log("Error", file);
  }
});

fs.writeFile("data.json", JSON.stringify(results, null, 2), "utf8", (err) => {
  if (err) {
    return console.log("Write file error!", err);
  }
  console.log("The data has been scraped and saved successfully! View it at './data.json'");
});

fs.writeFile("error.json", JSON.stringify(error, null, 2), "utf8", (err) => {
  if (err) {
    return console.log("Write file error!", err);
  }
  console.log("The data has been scraped and saved successfully! View it at './error.json'");
});
