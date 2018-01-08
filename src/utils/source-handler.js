const fs = require('fs');
const path = require('path');
const R = require('ramda');

function isDirectory(filename) {
  return fs.statSync(filename).isDirectory();
}

function readDirs(filter, dir) {
  return R.filter(filter)(fs.readdirSync(dir));
}

function maxDay(year, month) {
  if (month == 2) {
    return year % 100 === 0 ? (year % 400 === 0 ? 29 : 28) : (year % 4 === 0 ? 29 : 28);
  }
  return {
    1: 31,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31
  }[month];
}

/**
 * 构建文件树，并解析md文件
 * 目录结构为
 * root
 *   |-- year 年份
 *         |-- month 月份
 *               |-- day 日期
 *                     |-- filename 文件名(全路径)
 */
function readFilesTreeStructure(root, fn) {
  return R.pipe(
    R.map(year => R.pipe(
      R.pipe(
        R.map(month => R.pipe(
          R.pipe(
            R.map(day => R.pipe(
              R.map(filename => {
                const filePath = path.join(root, year, month, day, filename);
                fn(filePath);
                return filePath;
              }),
              R.objOf(day)
            )(readDirs(R.endsWith('.md'), path.join(root, year, month, day)))),
            R.reduce(R.mergeDeepLeft, {})
          ),
          R.objOf(month)
        )(readDirs(R.and(R.lte(1), R.gte(maxDay(year, month))), path.join(root, year, month)))),
        R.reduce(R.mergeDeepLeft, {})
      ),
      R.objOf(year)
    )(readDirs(R.and(R.lte(1), R.gte(12)), path.join(root, year)))),
    R.reduce(R.mergeDeepLeft, {})
  )(readDirs(R.lt(0), root));
}

exports.traverse = function(root, fn) {
  if (!root || !isDirectory(root)) {
    return {};
  }
  return readFilesTreeStructure(root, fn);
};
