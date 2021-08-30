const fs = require("fs");
const path = require("path");
const process = require("process");

const ignoreList = [".DS_Store"];
const ignoreSiderList = [".vuepress", ".DS_Store", "README.md", "temp"];

const workPath = path.join(process.cwd());

function getSiderChildren(parentName) {
  const currentPath = path.join(workPath + `/${parentName}`);
  const filterFiles = fs
    .readdirSync(currentPath)
    .filter((file) => !ignoreList.includes(file));
  const files = filterFiles.map((file) => {
    if (file === "README.md") {
      return `/${parentName}/`;
    }
    if (file.endsWith(".md")) {
      const fileName = file.split(".")[0];
      return `/${parentName}/${fileName}`;
    }
    let currentFile = { title: file };
    const subPath = `${currentPath}/${file}`;
    if (fs.statSync(subPath).isDirectory()) {
      return {
        ...currentFile,
        children: getSiderChildren(`${parentName}/${file}`),
      };
    }
  });
  return files.filter((item) => item);
}

const getSortList = (parentName) => {
  const list = getSiderChildren(parentName);
  return [...new Set([`/${parentName}/`, ...list])];
};

(function getSiderList() {
  console.log("ceshi", workPath);
  let siderObj = {};
  const siderFiles = fs
    .readdirSync(workPath)
    .filter((file) => !ignoreSiderList.includes(file));
  console.log("siderFiles", siderFiles);

  // for (let val of siderFiles) {
  //   siderObj = {
  //     ...siderObj,
  //     [`/${val}/`]: getSortList(val),
  //   };
  // }
  // return siderObj;
})();
