/**
 * Created by Zhengfeng.Yao on 2017/12/28.
 */
const fs = require('fs');
const path = require('path');
const R = require('ramda');
const sourceHandler = require('./utils/source-handler');
const scheduler = require('./utils/scheduler');
// const runTask = require('./utils/runTask');

const defaultRoot = path.resolve(process.cwd(), 'articles');

const concat = obj => key => value => obj[key] = R.union(obj[key], [value]);

function articlesLoader() {
  if (this.cacheable) {
    this.cacheable();
  }

  const callback = this.async();
  const loaderOptions = this.query;
  const root = loaderOptions.root || defaultRoot;
  // const root = path.resolve(process.cwd(), '../../blog/articles');
  const mds = {};
  const categories = {};
  const tags = {};
  const pickedPromises = [];

  const markdown = sourceHandler.traverse(root, filePath => {
    const content = fs.readFileSync(filePath).toString();
      pickedPromises.push(new Promise(resolve => {
        scheduler.queue({
          filePath,
          content,
          callback(err, result) {
            const parsedMarkdown = JSON.parse(result);
            const category = parsedMarkdown.meta.category;

            mds[filePath] = {
              key: filePath,
              title: parsedMarkdown.meta.title,
              summary: parsedMarkdown.meta.summary,
              content: parsedMarkdown.content,
              category,
              tags: parsedMarkdown.meta.tags,
              date: filePath.split('/').slice(-4, -1).join('-')
            };

            concat(categories)(category)(filePath);
            R.forEach(key => concat(tags)(key)(filePath), parsedMarkdown.meta.tags);

            resolve();
          }
        });
      }));
      // 调试时使用以下代码
      // runTask({
      //   filePath,
      //   content,
      //   callback(err, result) {
      //     const parsedMarkdown = JSON.parse(result);
      //     mds[filePath] = {
      //       title: parsedMarkdown.meta.title,
      //       summary: parsedMarkdown.meta.summary,
      //       content: parsedMarkdown.content
      //     };
      //     const category = parsedMarkdown.meta.category;
      //
      //     concat(categories)(category)(filePath);
      //     R.forEach(key => concat(tags)(key)(filePath), parsedMarkdown.meta.tags);
      //   }
      // });
  });

  function done() {
    callback(
      null,
      'module.exports = {' +
      `\n  dates: ${JSON.stringify(markdown)},` +
      `\n  mds: ${JSON.stringify(mds)},` +
      `\n  categories: ${JSON.stringify(categories)},` +
      `\n  tags: ${JSON.stringify(tags)}` +
      '\n};'
    );
  }

  Promise.all(pickedPromises).then(done);
  // 调试时使用以下代码
  // done();
}

// articlesLoader();

module.exports = articlesLoader;
