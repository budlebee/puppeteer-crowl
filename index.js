const puppeteer = require("puppeteer");
const xlsx = require("xlsx");

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.itp.or.kr/intro.asp?tmid=420`, {
      waitUntil: "networkidle2",
    });
    let pageNum = 1;
    let nextIdx;
    const table = page.$("tbody");

    const pagenation = await page.$$(".paging_area a");

    const btns = await page.$$eval(".paging_area a", (tds) =>
      tds.map((td) => {
        return td.innerText;
      })
    );

    let result = [];

    for (let i = 0; i < 1759; i++) {
      await page.waitForTimeout(200);
      await page.waitForSelector(".paging_area");

      console.log(i);
      const data = await page.$$eval("table tr td", (tds) =>
        tds.map((td) => {
          return td.innerText;
        })
      );

      result = result.concat(data);

      // 브라우저 내부에서 클릭이벤트를 발생시키려고 이런 방식을 씀
      const buttons = await page.evaluateHandle(() => {
        const btn = document
          .querySelector(".paging_area")
          .querySelectorAll("a");
        const curr = document
          .querySelector(".paging_area")
          .querySelector("strong");
        const arr = Array.from(btn);
        const nextVal = arr.filter((ele) => {
          if (parseInt(curr.innerHTML) % 5 == 0) {
            if (ele.getAttribute("title") == "다음 페이지로 이동") {
              ele.click();
              return;
            }
          }
          if (parseInt(ele.innerHTML) == parseInt(curr.innerHTML) + 1) {
            ele.click();
            return;
          }
        });
        return nextVal;
      });
      console.log("next page");
      pageNum += 1;
      if (i % 100 == 0) {
        const output = [];
        for (let i = 0; i < result.length; i += 5) {
          output.push(result.slice(i, i + 5));
        }

        const book = xlsx.utils.book_new();
        const excelOut = xlsx.utils.aoa_to_sheet(output);
        excelOut["!cols"] = [
          { wpx: 130 }, // A열
          { wpx: 130 }, // B열
          { wpx: 130 }, // C열
          { wch: 130 }, // D열
          { wch: 130 }, // D열
        ];
        xlsx.utils.book_append_sheet(book, excelOut, "List");
        xlsx.writeFile(book, `${Date.now()}-${i}.xlsx`);
      }
    }
    const output = [];
    for (let i = 0; i < result.length; i += 5) {
      output.push(result.slice(i, i + 5));
    }

    const book = xlsx.utils.book_new();
    const excelOut = xlsx.utils.aoa_to_sheet(output);
    excelOut["!cols"] = [
      { wpx: 130 }, // A열
      { wpx: 130 }, // B열
      { wpx: 130 }, // C열
      { wch: 130 }, // D열
      { wch: 130 }, // D열
    ];
    xlsx.utils.book_append_sheet(book, excelOut, "List");
    xlsx.writeFile(book, `${Date.now()}.xlsx`);
  } catch (e) {
    console.log("error: ", e);
  }
  return;
})();
