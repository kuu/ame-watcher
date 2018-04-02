const fs = require('fs');
const path = require('path');
const config = require('config');
const debug = require('debug')('ame-watcher');

function getConfig() {
  return {
    path: {
      masterFolder: process.env.MASTER_FOLDER || (config.path && config.path.masterFolder) || process.cwd(),
      watchFolder: process.env.WATCH_FOLDER || (config.path && config.path.watchFolder) || process.cwd(),
      logFile: process.env.LOG_FILE || (config.path && config.path.logFile) || path.join(process.cwd(), 'AMEEncodingLog.txt')
    },
    log: {
      lang: process.env.LOG_LANG || (config.log && config.log.lang) || 'en'
    }
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

module.exports = {
  getConfig,
  rename
};
