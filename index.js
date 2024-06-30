import XLSX from "xlsx";
import fs from "fs";
import path from "path";

const localeXLSX = process.env.FILEPATH;
if (!localeXLSX) throw new Error("Set FILEPATH env variable");

const baseKeys = ["Имя", "Ключ"];
const outFolder = "out";
const fileNamePrefix = "translations";

const run = (file) => {
  const workbook = XLSX.readFile(file);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const header = data.splice(0, 1).flat().slice(baseKeys.length);
  const languages = header.reduce((acc, lang) => {
    acc[lang] = {};
    return acc;
  }, {});

  let rootKey = "";
  const res = data.reduce((acc, item, i) => {
    if (item.length <= baseKeys.length) {
      rootKey = item[1];
      header.forEach((val) => {
        acc[val][rootKey] = {};
      });
      return acc;
    }
    header.forEach((lang, j) => {
      if (rootKey) {
        acc[lang][rootKey][item[1]] = item[j];
      } else {
        acc[lang][item[1]] = item[j];
      }
    });
    return acc;
  }, languages);

  if (!fs.existsSync(outFolder)) {
    fs.mkdirSync(outFolder);
  }

  Object.entries(res).forEach(([lang, data]) => {
    const fileName = `${fileNamePrefix}.${lang.toLowerCase()}.json`;
    const filePath = path.join(outFolder, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  });

  console.log("Translation files created successfully");
};

run(localeXLSX);
