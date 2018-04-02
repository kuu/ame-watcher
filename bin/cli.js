#!/usr/bin/env node

/**
 * Module dependencies.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');
const debug = require('debug')('ame-watcher');
const app = require('../app');
const util = require('../libs/util');

const config = util.getConfig();

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

const MASTER_FOLDER = config.path.masterFolder;
const WATCH_FOLDER = config.path.watchFolder;
const LOG_FILE = config.path.logFile;
const LOG_LANG = config.log.lang;

if (!fs.existsSync(MASTER_FOLDER)) {
  throw new Error('Invalid MASTER_FOLDER');
}

if (!fs.existsSync(WATCH_FOLDER)) {
  throw new Error('Invalid WATCH_FOLDER');
}

if (MASTER_FOLDER === WATCH_FOLDER) {
  throw new Error('MASTER_FOLDER is the same as WATCH_FOLDER');
}

if (!fs.existsSync(LOG_FILE)) {
  throw new Error('Invalid LOG_FILE');
}

if (!fs.existsSync(path.join(__dirname, '..', 'constants', `${LOG_LANG}.js`))) {
  throw new Error(`Log language: "${LOG_LANG}" is not supported`);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug(`Server started. port=${bind}, MASTER_FOLDER=${MASTER_FOLDER}, WATCH_FOLDER=${WATCH_FOLDER}, LOG_FILE=${LOG_FILE}`);
}
