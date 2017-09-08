const fs = require('fs');
const path = require('path');
const config = require('config');
const express = require('express');
const debug = require('debug')('ame-watcher');

const router = express.Router();
const WATCH_FOLDER = process.env.WATCH_FOLDER || (config.path && config.path.watchFolder) || process.cwd();
const LOG_FILE = process.env.LOG_FILE || (config.path && config.path.logFile) || '8.0';
const LOG_LANG = process.env.LOG_LANG || (config.log && config.log.lang) || 'ja';

const constants = require(`../constants/${LOG_LANG}`);

/* GET the number of files in the watch folder. */
router.get('/queue', (_, res) => {
  debug('--- the files in the watch folder:');
  const fileList = fs.readdirSync(WATCH_FOLDER).filter(file => {
    const isFile = fs.statSync(path.join(WATCH_FOLDER, file)).isFile();
    debug(`${file} (${isFile ? 'file' : 'dir'})`);
    return isFile;
  });
  debug('---');
  res.json({num: fileList.length});
});

/* GET the current and previous state of the encoder. */
router.get('/encoder', (_, res) => {
  fs.readFile(LOG_FILE, (err, buf) => {
    if (err) {
      res.status(err.status || 500);
      return res.send(err.stack);
    }
    const result = parse(buf.toString('utf16le'));
    if (!result) {
      res.status(500);
      return res.send('No log available');
    }
    res.json(result);
  });
});

function parse(file) {
  const lines = file.split('\n');
  lines.reverse();
  const lastTwo = [];
  for (const line of lines) {
    const stateObj = readLine(line);
    if (!stateObj) {
      continue;
    }
    lastTwo.push(stateObj);
    if (lastTwo.length === 2) {
      return {
        prev: lastTwo.pop(),
        last: lastTwo.pop()
      };
    }
  }
  return null;
}

function readLine(line) {
  const delim = ' : ';
  const idx = line.indexOf(delim);
  if (idx === -1) {
    return null;
  }
  const date = readDate(line.slice(0, idx));
  if (!date) {
    return null;
  }
  const state = readState(line.slice(idx + delim.length));
  if (!state) {
    return null;
  }
  return {state, date};
}

function readDate(str) {
  let date;
  try {
    date = new Date(str);
  } catch (err) {
    return null;
  }
  return date;
}

function readState(str) {
  if (str === constants.ENCODE_STARTED) {
    return 'started';
  } else if (str === constants.STOPPED) {
    return null;
  } else if (str === constants.ENCODE_SUCCESS) {
    return 'success';
  } else if (str === constants.ENCODE_FAILED) {
    return 'failed';
  }
}

module.exports = router;
