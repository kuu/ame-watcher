const fs = require('fs');
const path = require('path');
const express = require('express');
const debug = require('debug')('ame-watcher');
const {parse} = require('../libs/log');
const util = require('../libs/util');

const router = express.Router();
const config = util.getConfig();
const MASTER_FOLDER = config.path.masterFolder;
const WATCH_FOLDER = config.path.watchFolder;
const LOG_FILE = config.path.logFile;
const MAX_LOG_ENTRY = 128;

/* GET the number of files in the watch folder. */
router.get('/queue', (_, res) => {
  debug('--- the files in the watch folder:');
  const fileList = fs.readdirSync(WATCH_FOLDER).filter(file => {
    const isFile = fs.statSync(path.join(WATCH_FOLDER, file)).isFile();
    if (isFile && file.startsWith('.')) {
      // Ignore dot files
      return false;
    }
    debug(`${file} (${isFile ? 'file' : 'dir'})`);
    return isFile;
  });
  debug('---');
  res.json({num: fileList.length});
});

/* GET the last {num} log entries in reverse chronological order */
router.get('/logs/:num', (req, res) => {
  const num = Number.parseInt(req.params.num, 10);
  if (Number.isNaN(num) || num <= 0 || num > MAX_LOG_ENTRY) {
    res.status(400);
    return res.send(`"num" should be an integer between 1 to ${MAX_LOG_ENTRY}`);
  }
  fs.readFile(LOG_FILE, (err, buf) => {
    if (err) {
      res.status(err.status || 500);
      return res.send(err.stack);
    }
    const result = parse(buf.toString('utf16le'), num);
    res.json(result);
  });
});

/* Moves the specified file in master-folder to watch-folder */
router.get('/encode/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  if (fileName.includes('/')) {
    res.status(400);
    return res.send('File name cannot contain "/"');
  }
  const oldPath = path.join(MASTER_FOLDER, fileName);
  if (!fs.existsSync(oldPath)) {
    res.status(400);
    return res.send('File does not exist');
  }
  const newPath = path.join(WATCH_FOLDER, fileName);
  util.rename(oldPath, newPath, err => {
    if (err) {
      res.status(err.status || 500);
      return res.send(`Unable to move the specified file ("${fileName}")`);
    }
    res.status(200);
    res.send('');
  });
});

module.exports = router;
