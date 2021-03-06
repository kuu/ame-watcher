const util = require('./util');

const config = util.getConfig();
const LOG_LANG = config.log.lang;
const constants = require(`../constants/${LOG_LANG}`);

function parse(file, num) {
  const lines = file.split('\n');
  lines.reverse();
  const entries = [];
  for (const line of lines) {
    const stateObj = readLine(line);
    if (!stateObj) {
      continue;
    }
    entries.push(stateObj);
    if (entries.length === num) {
      break;
    }
  }
  return entries;
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
  return {state, date: `${date.toDateString()} ${date.toTimeString()}`};
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
  }
  if (str === constants.ENCODE_STOPPED) {
    return 'stopped';
  }
  if (str === constants.ENCODE_PAUSED) {
    return 'paused';
  }
  if (str === constants.ENCODE_RESUMED) {
    return 'resumed';
  }
  if (str === constants.ENCODE_SUCCESS) {
    return 'success';
  }
  if (str === constants.ENCODE_FAILED) {
    return 'failed';
  }
  return null;
}

exports.parse = parse;
