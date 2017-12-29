/**
 * Created by Zhengfeng.Yao on 2017/12/29.
 */
const mdTransform = require('../transforms/markdown');

module.exports = task => {
  const result = mdTransform(task.content);
  task.callback(null, JSON.stringify(result));
};
