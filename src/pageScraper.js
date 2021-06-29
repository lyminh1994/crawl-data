// Loop through each of those links, open a new page instance and get the relevant data from them
const pagePromise = (browser, link) =>
  new Promise(async (resolve) => {
    const newPage = await browser.newPage();
    await newPage.goto(link);

    try {
      const dataObj = {};
      dataObj["name"] = await newPage.$eval("#avidolDetails > .itemBox > h1", (h1) => (h1 ? h1.textContent : ""));
      const profile = await newPage.$$eval("#avidolDetails > .itemBox > .frame > dl > dd", (dds) =>
        dds.map((dd) => dd.textContent.replace(/(\n|\r|\t)/gm, ""))
      );
      if (profile.length === 9) {
        dataObj["favorite"] = profile[0] ? profile[0].replace("★Favorite", "").trim() : null;
        dataObj["dateOfBirth"] = profile[1] ? profile[1].replace("Date of birth", "").trim() : null;
        dataObj["bloodType"] = profile[2] ? profile[2].replace("Blood Type", "").replace("Type", "").replace("-", "").trim() : null;
        dataObj["cityOfBorn"] = profile[3] ? profile[3].replace("City of Born", "").trim() : null;
        dataObj["height"] = profile[4] ? profile[4].replace("Height", "").replace(/\D+/g, "").trim() : null;
        const size = profile[5] ? profile[5].replace("Size", "").trim() : null;
        if (size.length >= 9) {
          const sizes = size.split(" ");
          if (sizes.length === 3) {
            dataObj["bust"] = sizes[0].substring(0, 4).replace(/\D+/g, "");
            dataObj["waist"] = sizes[1].replace(/\D+/g, "");
            dataObj["hip"] = sizes[2].replace(/\D+/g, "");
          }
        } else {
          dataObj["bust"] = "";
          dataObj["waist"] = "";
          dataObj["hip"] = "";
        }
        dataObj["hobby"] = profile[6] ? profile[6].replace("Hobby", "").trim() : null;
        dataObj["specialSkill"] = profile[7] ? profile[7].replace("Special Skill", "").trim() : null;
        dataObj["other"] = profile[8] ? profile[8].replace("Other", "").trim() : null;
      } else if (profile.length === 8) {
        dataObj["dateOfBirth"] = profile[0] ? profile[0].replace("Date of birth", "").trim() : null;
        dataObj["bloodType"] = profile[1] ? profile[1].replace("Blood Type", "").replace("Type", "").replace("-", "").trim() : null;
        dataObj["cityOfBorn"] = profile[2] ? profile[2].replace("City of Born", "").trim() : null;
        dataObj["height"] = profile[3] ? profile[3].replace("Height", "").replace(/\D+/g, "").trim() : null;
        const size = profile[4] ? profile[5].replace("Size", "").trim() : null;
        if (size.length >= 9) {
          const sizes = size.split(" ");
          if (sizes.length === 3) {
            dataObj["bust"] = sizes[0].substring(0, 4).replace(/\D+/g, "");
            dataObj["waist"] = sizes[1].replace(/\D+/g, "");
            dataObj["hip"] = sizes[2].replace(/\D+/g, "");
          }
        } else {
          dataObj["bust"] = "";
          dataObj["waist"] = "";
          dataObj["hip"] = "";
        }
        dataObj["hobby"] = profile[5] ? profile[5].replace("Hobby", "").trim() : null;
        dataObj["specialSkill"] = profile[6] ? profile[6].replace("Special Skill", "").trim() : null;
        dataObj["other"] = profile[7] ? profile[7].replace("Other", "").trim() : null;
      }
      resolve(dataObj);
    } catch (err) {
      resolve({ link: link, error: err.message });
    }

    await newPage.close();
  });

const scraperObject = {
  url: "https://xxx.xcity.jp/idol/",
  async scraper(browser, category) {
    const page = await browser.newPage();
    // Navigate to the selected page
    await page.goto(this.url);

    // Select the category of book to be displayed
    const selectedCategory = await page.$$eval(
      ".ctrlPanelGeneral > ul > li > a",
      (links, _category) => {
        // Search for the element that has the matching text
        links = links.map((a) => (a.textContent.replace(/(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm, "") === _category ? a : null));
        const link = links.filter((a) => a !== null)[0];
        return link.href;
      },
      category
    );
    console.log(`Navigating to ${selectedCategory}&num=90`);
    await page.goto(`${selectedCategory}&num=90`);

    let currentPage = 1;
    const scrapedData = [];
    async function scrapeCurrentPage() {
      console.log(`Current page ${currentPage}`);
      // Wait for the required DOM to be rendered
      await page.waitForSelector("#avidol");
      // Get the link to all the required books
      const urls = await page.$$eval("#avidol > .itemBox > .mid > .name > a", (links) => {
        links = links.filter((el) => el.href);
        // Extract the links from the data and return
        return links.map((el) => el.href);
      });

      for (link in urls) {
        const currentPageData = await pagePromise(browser, urls[link]);
        scrapedData.push(currentPageData);
      }
      // When all the data on this page is done, click the next button and start the scraping of the next page
      // You are going to check if this button exist first, so you know if there really is a next page.
      let nextButtonExist = false;
      try {
        await page.$eval(".next > a", (a) => a.href);
        nextButtonExist = true;
      } catch (err) {
        nextButtonExist = false;
      }

      if (nextButtonExist) {
        await page.click(".next > a");
        currentPage += 1;
        return await scrapeCurrentPage(); // Call this function recursively
      }
      await page.close();
      return scrapedData;
    }

    return await scrapeCurrentPage();
  },
};

module.exports = scraperObject;
