const test = require('ava');
const proxyquire = require('proxyquire');

test.beforeEach(() => {
  delete require.cache[require.resolve('../../libs/util')];
});

test('util:rename:read-error', async t => {
  const errorObj = {};
  const mockFs = {
    readFile: (path, callback) => {
      process.nextTick(() => {
        callback(errorObj);
      });
    }
  };
  const mockUtil = proxyquire('../../libs/util', {fs: mockFs});
  let result = null;
  await mockUtil.rename('oldPath', 'newPath', err => {
    result = err;
  });
  t.is(result, errorObj);
});

test('util:rename:write-error', async t => {
  const errorObj = {};
  const mockFs = {
    readFile: (path, callback) => {
      process.nextTick(() => {
        callback(null);
      });
    },
    writeFile: (path, data, callback) => {
      process.nextTick(() => {
        callback(errorObj);
      });
    }
  };
  const mockUtil = proxyquire('../../libs/util', {fs: mockFs});
  let result = null;
  await mockUtil.rename('oldPath', 'newPath', err => {
    result = err;
  });
  t.is(result, errorObj);
});

test('util:rename:delete-error', async t => {
  const errorObj = {};
  const mockFs = {
    readFile: (path, callback) => {
      process.nextTick(() => {
        callback(null);
      });
    },
    writeFile: (path, data, callback) => {
      process.nextTick(() => {
        callback(null);
      });
    },
    unlink: (path, callback) => {
      process.nextTick(() => {
        callback(errorObj);
      });
    }
  };
  const mockUtil = proxyquire('../../libs/util', {fs: mockFs});
  let result = null;
  await mockUtil.rename('oldPath', 'newPath', err => {
    result = err;
  });
  t.is(result, errorObj);
});

test('util:rename:success', async t => {
  const mockFs = {
    readFile: (path, callback) => {
      process.nextTick(() => {
        callback(null);
      });
    },
    writeFile: (path, data, callback) => {
      process.nextTick(() => {
        callback(null);
      });
    },
    unlink: (path, callback) => {
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockUtil = proxyquire('../../libs/util', {fs: mockFs});
  let result = {};
  await mockUtil.rename('oldPath', 'newPath', err => {
    result = err;
  });
  t.is(result, null);
});

test('util:rename:copy', async t => {
  let called = false;
  const mockFs = {
    readFile: (path, callback) => {
      process.nextTick(() => {
        callback(null);
      });
    },
    writeFile: (path, data, callback) => {
      process.nextTick(() => {
        callback(null);
      });
    },
    unlink: (path, callback) => {
      called = true;
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockUtil = proxyquire('../../libs/util', {fs: mockFs});
  let result = {};
  await mockUtil.rename('oldPath', 'newPath', {copy: true}, err => {
    result = err;
  });
  t.is(result, null);
  t.is(called, false);
});
