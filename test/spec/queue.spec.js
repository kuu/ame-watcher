const test = require('ava');
const request = require('supertest');
const proxyquire = require('proxyquire');

function dummyStatSync() {
  return {
    isFile() {
      return true;
    }
  };
}

test.beforeEach(() => {
  delete require.cache[require.resolve('../../app')];
});

test('queue:idle', async t => {
  const mockFs = {
    readdirSync: () => {
      return [];
    },
    statSync: dummyStatSync
  };
  const mockApi = proxyquire('../../routes/api', {fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/queue');
  t.is(res.status, 200);
  t.is(res.body.num, 0);
});

test('queue:busy', async t => {
  const mockFs = {
    readdirSync: () => {
      return ['file'];
    },
    statSync: dummyStatSync
  };
  const mockApi = proxyquire('../../routes/api', {fs: mockFs});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/queue');
  t.is(res.status, 200);
  t.is(res.body.num, 1);
});
