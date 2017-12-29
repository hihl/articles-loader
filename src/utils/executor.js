/**
 * Created by Zhengfeng.Yao on 2017/12/29.
 */
const mdTransform = require('../transforms/markdown');

process.on('message', task => {
  const result = mdTransform(task.content);
  process.send(JSON.stringify(result));
});
