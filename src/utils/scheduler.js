const os = require('os');
const path = require('path');
const childProcess = require('child_process');

const executorsCount = os.cpus().length - 1;

/**
 * 创建执行器
 */
function createExecutors(count) {
  const executors = [];
  while(executors.length < count) {
    const executor = childProcess.fork(path.join(__dirname, './executor.js'));
    executor.setMaxListeners(1);
    executors.push(executor);
  }
  return executors;
}

module.exports = (function() {
  const executors = createExecutors(executorsCount);
  const tasksQueue = [];
  function launch(task) {
    const executor = executors.pop();
    const { callback } = task;
    executor.send(task);
    executor.once('message', result => {
      callback(null, result);
      executors.push(executor); // 任务完成
      if (tasksQueue.length > 0) {
        launch(tasksQueue.pop());
      }
    });
  }

  return {
    queue: task => {
      if (executors.length <= 0) {
        tasksQueue.push(task);
        return;
      }
      launch(task);
    },
    jobDone: () => executors.forEach(executor => executor.kill())
  }
})();
