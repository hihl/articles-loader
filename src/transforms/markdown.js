const YFM = require('yaml-front-matter');

module.exports = function MT(markdown) {
  const ret = {};
  const raw = YFM.loadFront(markdown);
  ret.content = raw.__content;
  delete raw.__content;
  ret.meta = raw;
  return ret;
};
