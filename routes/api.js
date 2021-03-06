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
const OUTPUT_FOLDER = config.path.outputFolder;
const LOG_FILE = config.path.logFile;
const renameRules = config.renameRules;
const MAX_LOG_ENTRY = 128;

let __renaming__ = false;

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
  const copy = req.query.copy === 'true';
  util.rename(oldPath, newPath, {copy}, err => {
    if (err) {
      res.status(err.status || 500);
      return res.send(`Unable to move the specified file ("${fileName}")`);
    }
    res.status(200);
    res.send('');
  });
});

/* Rename the output files based on the `renameRules` defined in the config file and move the files to the `outputFolder` if defined */
router.get('/rename', (_, res) => {
  if (!fs.statSync(OUTPUT_FOLDER).isDirectory()) {
    res.status(500);
    return res.send(`outputFolder is not configured`);
  }

  const DEFAULT_OUTPUT_FOLDER = path.join(WATCH_FOLDER, 'Output');
  if (!fs.statSync(DEFAULT_OUTPUT_FOLDER).isDirectory()) {
    res.status(500);
    return res.send(`Unable to find the system output directory`);
  }

  debug('--- the files in the system output directory:');
  const fileList = fs.readdirSync(DEFAULT_OUTPUT_FOLDER).filter(file => {
    const isFile = fs.statSync(path.join(DEFAULT_OUTPUT_FOLDER, file)).isFile();
    if (isFile && file.startsWith('.')) {
      // Ignore dot files
      return false;
    }
    debug(`${file} (${isFile ? 'file' : 'dir'})`);
    return isFile;
  });
  debug('---');

  if (fileList.length === 0) {
    res.status(200);
    return res.send(`There's no file to process`);
  }

  if (__renaming__) {
    res.status(500);
    return res.send(`Unable to accept your request`);
  }

  __renaming__ = true;

  debug('--- rename list:');
  const paramList = [];
  for (const file of fileList) {
    const oldPath = path.join(DEFAULT_OUTPUT_FOLDER, file);
    const extension = path.extname(file);
    const filename = path.basename(file, extension);
    debug(`\toldPath: "${oldPath}"`);
    if (renameRules.length === 0) {
      debug(`\tnewPath: "${path.join(OUTPUT_FOLDER, file)}"`);
      paramList.push({
        oldPath,
        newPath: path.join(OUTPUT_FOLDER, file)
      });
      continue;
    }
    for (const [i, rule] of renameRules.entries()) {
      const destFileName = rule.replace('${filename}', filename).replace('${extension}', extension.slice(1));
      const newPath = path.join(OUTPUT_FOLDER, destFileName);
      debug(`\tnewPath: "${newPath}"`);
      if (i === fileList.length - 1) {
        paramList.push({oldPath, newPath});
      } else {
        paramList.push({oldPath, newPath, params: {copy: true}});
        debug('\tparams: {copy: true}');
      }
    }
    debug('---');
  }

  debug(`paramList.length = ${paramList.length}`);

  util.renameList(paramList, err => {
    __renaming__ = false;
    if (err) {
      res.status(err.status || 500);
      return res.send(`Unable to rename ${fileList.length} files`);
    }
    res.status(200);
    return res.send('');
  });
});

module.exports = router;
