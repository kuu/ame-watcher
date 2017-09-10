[![NPM version](https://badge.fury.io/js/ame-watcher.png)](https://badge.fury.io/js/ame-watcher)
[![Build Status](https://travis-ci.org/kuu/ame-watcher.svg?branch=master)](https://travis-ci.org/kuu/ame-watcher)
[![Coverage Status](https://coveralls.io/repos/kuu/ame-watcher/badge.png?branch=master)](https://coveralls.io/r/kuu/ame-watcher?branch=master)
[![Dependency Status](https://gemnasium.com/kuu/ame-watcher.png)](https://gemnasium.com/kuu/ame-watcher)

# ame-watcher
REST API to retrieve Adobe Media Encoder's status

## APIs
| Method | Path                   | Description   | Request Params | Response JSON Format  |
| ------ | ---------------------- | ------------- | ------------- | ------------- |
| GET    | /api/queue             | Returns the number of files in watch-folder | - |  {num: `number of files`} |
| GET    | /api/logs/:num          | Returns the last {`num`} log entries in reverse chronological order | `num` must be an integer between 1 to 128 | [{state: `"started"/"stopped"/"paused"/"resumed"/"success"/"failed"`, date: `datetime of the log entry`}] |
| GET    | /api/encode/:file-name | Moves one file in master-folder to watch-folder | `file-name` cannot contain '/' | - |
* watch-folder must be registered as AME's watch folder
* master-folder must be on the same file system with watch-folder

## Install
* Install [Node.js](https://nodejs.org/)
* Clone source code and install dependencies

```
$ git clone git@github.com:kuu/ame-watcher.git
$ cd ame-watcher
$ npm install
```

## Configure
* Put config file(s) in your work directory.

```js
 $ mkdir config
 $ vi config/default.json
 {
   "path": {
     "masterFolder": "/path/to/master-folder",
     "watchFolder": "/path/to/watch-folder",
     "logFile":     "/path/to/log-file"
   },
   "log": {
     "lang": "ja"
   }
 }
```
* Supported log file languages are "en" and "ja" (default = "en")

## Run
* Start the server with specifying port number (the default port is 3000)

```
$ PORT={port number} npm start
```

* Now you can access the APIs

```
$ curl http://localhost:3000/api/queue
{"num":0}

$ curl http://localhost:3000/api/log/3
[
  {"state": "success", date: "2017-09-06T08:24:05.000Z"},
  {"state": "started", date: "2017-09-06T08:23:43.000Z"},
  {"state": "failed",  date: "2017-09-06T08:22:30.000Z"}
]

$ curl http://localhost:3000/api/encode/ame%20test.mp4

```
* Timezone is UTC
* Use DEBUG environ variable for detail logs
```
$ DEBUG=ame-watcher npm start
```

## Stop
* Stop the server (not AME) by the following command in the same directory you did `npm start`

```
$ npm stop
```
