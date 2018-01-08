const mdTransform = require('../transforms/markdown');

module.exports = task => {
  const result = mdTransform(task.content);
  task.callback(null, JSON.stringify(result));
};
