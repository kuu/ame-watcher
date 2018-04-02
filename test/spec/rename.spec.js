const test = require('ava');
const request = require('supertest');
const proxyquire = require('proxyquire');

test.beforeEach(() => {
  delete require.cache[require.resolve('../../app')];
});

function dummyStatSync() {
  return {
    isFile() {
      return true;
    },
    isDirectory() {
      return true;
    }
  };
}

test('rename:success:no-rule', async t => {
  const mockFs = {
    readdirSync: () => {
      return ['a.mp4', 'b.mp4', 'c.mp4'];
    },
    statSync: dummyStatSync
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
    statSync: dummyStatSync
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
