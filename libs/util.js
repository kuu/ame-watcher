const path = require('path');
const config = require('config');

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

module.exports = {
  getConfig
};
