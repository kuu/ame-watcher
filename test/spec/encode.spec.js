const test = require('ava');
const request = require('supertest');
const proxyquire = require('proxyquire');

test.beforeEach(() => {
  delete require.cache[require.resolve('../../app')];
});

test('encode:no-filename', async t => {
  const app = require('../../app');
  const res = await request(app).get('/api/encode/');
  t.is(res.status, 404);
});

test('encode:invalid-filename', async t => {
  const app = require('../../app');
  const res = await request(app).get('/api/encode/..%2F..%2Fetc%2Fnginx%2Fnginx.conf');
  t.is(res.status, 400);
});

test('encode:no-existing-filename', async t => {
  const mockFs = {
    existsSync: () => {
      return false;
    }
  };
  const mockApi = proxyquire('../../routes/api', {fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/encode/none.mp4');
  t.is(res.status, 400);
});

test('encode:move-error', async t => {
  const mockFs = {
    existsSync: () => {
      return true;
    }
  };
  const mockUtil = {
    rename: (oldPath, newPath, params, callback) => {
      process.nextTick(() => {
        callback({});
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {'../libs/util': mockUtil, fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/encode/error.mp4');
  t.is(res.status, 500);
});

test('encode:move-success', async t => {
  const mockFs = {
    existsSync: () => {
      return true;
    }
  };
  const mockUtil = {
    rename: (oldPath, newPath, params, callback) => {
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {'../libs/util': mockUtil, fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/encode/success.mp4');
  t.is(res.status, 200);
});

test('encode:copy-flag', async t => {
  let passedParams = null;
  const mockFs = {
    existsSync: () => {
      return true;
    }
  };
  const mockUtil = {
    rename: (oldPath, newPath, params, callback) => {
      passedParams = params;
      process.nextTick(() => {
        callback({});
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {'../libs/util': mockUtil, fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  await request(app).get('/api/encode/error.mp4?copy=true');
  t.truthy(passedParams);
  t.is(passedParams.copy, true);
});
