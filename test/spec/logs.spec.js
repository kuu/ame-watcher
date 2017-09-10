const test = require('ava');
const request = require('supertest');
const proxyquire = require('proxyquire');

test.beforeEach(() => {
  delete require.cache[require.resolve('../../app')];
});

const dummyBuffer = {
  toString() {
    return `
09/10/2017 01:58:57 PM : File Successfully Encoded

09/10/2017 01:58:57 PM : Queue Stopped
`;
  }
};

test('logs:nan', async t => {
  const app = require('../../app');
  const res = await request(app).get('/api/logs/a');
  t.is(res.status, 400);
});

test('logs:negative', async t => {
  const app = require('../../app');
  const res = await request(app).get('/api/logs/-1');
  t.is(res.status, 400);
});

test('logs:many', async t => {
  const app = require('../../app');
  const res = await request(app).get('/api/logs/129');
  t.is(res.status, 400);
});

test('encode:read-error', async t => {
  const mockFs = {
    readFile: (path, callback) => {
      process.nextTick(() => {
        callback({});
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/logs/10');
  t.is(res.status, 500);
});

test('encode:read-success', async t => {
  const mockFs = {
    readFile: (path, callback) => {
      process.nextTick(() => {
        callback(null, dummyBuffer);
      });
    }
  };
  const mockApi = proxyquire('../../routes/api', {fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/logs/10');
  t.is(res.status, 200);
});
