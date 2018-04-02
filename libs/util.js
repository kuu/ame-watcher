const fs = require('fs');
const path = require('path');
const config = require('config');
const debug = require('debug')('ame-watcher');

function checkRules(rules) {
  for (const rule of rules) {
    if (rule.includes('/')) {
      throw new Error('Rename rules cannot include slash - "/"');
    }
  }
}

function getRenameRules() {
  let renameRules = null;
  const envVar = process.env.RENAME_RULES;
  if (envVar) {
    try {
      renameRules = JSON.parse(envVar);
    } catch (err) {
      debug(err.stack);
    }
  }
  renameRules = renameRules || config.renameRules || [];
  checkRules(renameRules);
  return renameRules;
}

function getConfig() {
  return {
    path: {
      masterFolder: process.env.MASTER_FOLDER || (config.path && config.path.masterFolder) || process.cwd(),
      watchFolder: process.env.WATCH_FOLDER || (config.path && config.path.watchFolder) || process.cwd(),
      logFile: process.env.LOG_FILE || (config.path && config.path.logFile) || path.join(process.cwd(), 'AMEEncodingLog.txt'),
      outputFolder: process.env.OUTPUT_FOLDER || (config.path && config.path.outputFolder)
    },
    log: {
      lang: process.env.LOG_LANG || (config.log && config.log.lang) || 'en'
    },
    renameRules: getRenameRules()
  };
}

function rename(oldPath, newPath, ...remainings) {
  let params;
  let callback;
  if (typeof remainings[0] === 'function') {
    params = {};
    callback = remainings[0];
  } else {
    params = remainings[0];
    callback = remainings[1];
  }
  fs.readFile(oldPath, (err, data) => {
    if (err) {
      debug(err.stack);
      return callback(err);
    }
    fs.writeFile(newPath, data, err => {
      if (err) {
        debug(err.stack);
        return callback(err);
      }
      if (params.copy) {
        return callback(null);
      }
      // Delete the file
      fs.unlink(oldPath, err => {
        if (err) {
          debug(err.stack);
          return callback(err);
        }
        callback(null);
      });
    });
  });
}

function renamePromise(oldPath, newPath, params) {
  return new Promise((resolve, reject) => {
    rename(oldPath, newPath, params || {}, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

function renameList(list, callback) {
  const promises = [];
  for (const {oldPath, newPath, params} of list) {
    promises.push(renamePromise(oldPath, newPath, params));
  }
  return Promise.all(promises)
    .then(() => {
      callback(null);
    })
    .catch(err => {
      callback(err);
    });
}

module.exports = {
  getConfig,
  rename,
  renameList
};
