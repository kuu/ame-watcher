const test = require('ava');
const request = require('supertest');
const proxyquire = require('proxyquire');

test.beforeEach(() => {
  delete require.cache[require.resolve('../../app')];
});

function createDummyStatSync(isDirectoryResponses, isFileResponses) {
  let isDirectoryCounter = 0;
  let isFileCounter = 0;
  return function () {
    return {
      isFile() {
        return isFileResponses[isFileCounter++];
      },
      isDirectory() {
        return isDirectoryResponses[isDirectoryCounter++];
      }
    };
  };
}

test('rename:success:no-rule', async t => {
  const mockFs = {
    readdirSync: () => {
      return ['a.mp4', 'b.mp4', 'c.mp4'];
    },
    statSync: createDummyStatSync([true, true], [true, true, true])
  };
  let listLength = 0;
  const mockUtil = {
    getConfig() {
      return {
        path: {
          masterFolder: '/masterFolder',
          watchFolder: '/watchFolder',
          logFile: '/etc/logFile',
          outputFolder: '/outputFolder'
        },
        renameRules: []
      };
    },
    renameList: (list, callback) => {
      listLength = list.length;
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {'../libs/util': mockUtil, fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/rename');
  t.is(res.status, 200);
  t.is(listLength, 3);
});

test('rename:success:with-rules', async t => {
  const mockFs = {
    readdirSync: () => {
      return ['a.mp4', 'b.mp4', 'c.mp4'];
    },
    statSync: createDummyStatSync([true, true], [true, true, true])
  };
  let listLength = 0;
  const mockUtil = {
    getConfig() {
      return {
        path: {
          masterFolder: '/masterFolder',
          watchFolder: '/watchFolder',
          logFile: '/etc/logFile',
          outputFolder: '/outputFolder'
        },
        renameRules: [
          '${filename}_1.${extension}',
          '${filename}_2.${extension}',
          '${filename}_3.${extension}'
        ]
      };
    },
    renameList: (list, callback) => {
      listLength = list.length;
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {'../libs/util': mockUtil, fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/rename');
  t.is(res.status, 200);
  t.is(listLength, 3 * 3);
});

test('rename:error:no-output-folder', async t => {
  const mockFs = {
    readdirSync: () => {
      return ['a.mp4', 'b.mp4', 'c.mp4'];
    },
    statSync: createDummyStatSync([false, true], [true, true, true])
  };
  let listLength = 0;
  const mockUtil = {
    getConfig() {
      return {
        path: {
          masterFolder: '/masterFolder',
          watchFolder: '/watchFolder',
          logFile: '/etc/logFile',
          outputFolder: '/outputFolder'
        },
        renameRules: []
      };
    },
    renameList: (list, callback) => {
      listLength = list.length;
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {'../libs/util': mockUtil, fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/rename');
  t.is(res.status, 500);
  t.is(listLength, 0);
});

test('rename:error:no-default-output-folder', async t => {
  const mockFs = {
    readdirSync: () => {
      return ['a.mp4', 'b.mp4', 'c.mp4'];
    },
    statSync: createDummyStatSync([true, false], [true, true, true])
  };
  let listLength = 0;
  const mockUtil = {
    getConfig() {
      return {
        path: {
          masterFolder: '/masterFolder',
          watchFolder: '/watchFolder',
          logFile: '/etc/logFile',
          outputFolder: '/outputFolder'
        },
        renameRules: []
      };
    },
    renameList: (list, callback) => {
      listLength = list.length;
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {'../libs/util': mockUtil, fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/rename');
  t.is(res.status, 500);
  t.is(listLength, 0);
});

test('rename:error:no-files', async t => {
  const mockFs = {
    readdirSync: () => {
      return ['a.mp4', 'b.mp4', 'c.mp4'];
    },
    statSync: createDummyStatSync([true, true], [false, false, false])
  };
  let listLength = 0;
  const mockUtil = {
    getConfig() {
      return {
        path: {
          masterFolder: '/masterFolder',
          watchFolder: '/watchFolder',
          logFile: '/etc/logFile',
          outputFolder: '/outputFolder'
        },
        renameRules: []
      };
    },
    renameList: (list, callback) => {
      listLength = list.length;
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {'../libs/util': mockUtil, fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/rename');
  t.is(res.status, 200);
  t.is(listLength, 0);
});

test('rename:error:dot-file', async t => {
  const mockFs = {
    readdirSync: () => {
      return ['.a.mp4', '.b.mp4', 'c.mp4'];
    },
    statSync: createDummyStatSync([true, true], [true, true, true])
  };
  let listLength = 0;
  const mockUtil = {
    getConfig() {
      return {
        path: {
          masterFolder: '/masterFolder',
          watchFolder: '/watchFolder',
          logFile: '/etc/logFile',
          outputFolder: '/outputFolder'
        },
        renameRules: []
      };
    },
    renameList: (list, callback) => {
      listLength = list.length;
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {'../libs/util': mockUtil, fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/rename');
  t.is(res.status, 200);
  t.is(listLength, 1);
});

test('rename:error:concurrent-rename', t => {
  const mockFs = {
    readdirSync: () => {
      return ['a.mp4', 'b.mp4', 'c.mp4'];
    },
    statSync: createDummyStatSync([true, true, true, true], [true, true, true, true, true, true])
  };
  let listLength = 0;
  const mockUtil = {
    getConfig() {
      return {
        path: {
          masterFolder: '/masterFolder',
          watchFolder: '/watchFolder',
          logFile: '/etc/logFile',
          outputFolder: '/outputFolder'
        },
        renameRules: []
      };
    },
    renameList: (list, callback) => {
      setTimeout(() => {
        listLength = list.length;
        callback(null);
      }, 1);
    }
  };
  const mockApi = proxyquire('../../routes/api', {'../libs/util': mockUtil, fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  request(app).get('/api/rename').then(res => {
    t.is(res.status, 200);
    t.is(listLength, 3);
  });
  return request(app).get('/api/rename').then(res => {
    t.is(res.status, 500);
  });
});
