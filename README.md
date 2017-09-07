# ame-watcher
REST API to retrieve Adobe Media Encoder's status

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
     "watchFolder": "/path/to/watch-folder",
     "logFile":     "/path/to/log-file"
   }
 }
```
* Only 8.0 log version is supported.

## Run
* Start the server with specifying port number (the default port is 3000)

```
$ PORT={port number} npm start
```

* Now you can access `/api/queue` and `/api/encoder`

```
$ curl http://localhost:3000/api/queue
{"num":0}

$ curl http://localhost:3000/api/encoder
{
  "curr": {
    "state": "started", date: "2017-09-06T08:23:43.000Z"
  },
  "prev": {
    "state": "success", date: "2017-09-06T08:24:05.000Z"
  }
}
```
* Timezone is UTC
* Use DEBUG environ variable for detail logs
```
$ DEBUG=ame-watcher npm start
```

## Stop
* Run the following command in the same directory

```
$ npm stop
```
