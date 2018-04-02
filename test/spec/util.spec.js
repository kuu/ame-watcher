const test = require('ava');
const proxyquire = require('proxyquire');
const rewire = require('rewire');

test.beforeEach(() => {
  delete require.cache[require.resolve('../../libs/util')];
});

test('util:get-config:slash-in-rename-rule', t => {
  const util = rewire('../../libs/util');
  util.__set__({
    process: {
      env: {
        RENAME_RULES: '["${filename}_1.${extension}", "${filename}_2.${extension}", "../${filename}_3.${extension}"]'
      }
    }
  });
  let config = null;
  let error = null;
  try {
    config = util.getConfig();
  } catch (err) {
    error = err;
  }
  t.falsy(config);
  t.truthy(error);
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

test('util:renameList:success', async t => {
  const list = [
    {oldPath: 'a', newPath: 'b'},
    {oldPath: 'a', newPath: 'b'},
    {oldPath: 'a', newPath: 'b'}
  ];
  let counter = 0;
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
      counter++;
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockUtil = proxyquire('../../libs/util', {fs: mockFs});
  let result = {};
  await mockUtil.renameList(list, err => {
    result = err;
  });
  t.is(result, null);
  t.is(counter, list.length);
});

test('util:renameList:success:copy', async t => {
  const list = [
    {oldPath: 'a', newPath: 'b'},
    {oldPath: 'a', newPath: 'b', params: {copy: true}},
    {oldPath: 'a', newPath: 'b'}
  ];
  let counter = 0;
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
      counter++;
      process.nextTick(() => {
        callback(null);
      });
    }
  };
  const mockUtil = proxyquire('../../libs/util', {fs: mockFs});
  let result = {};
  await mockUtil.renameList(list, err => {
    result = err;
  });
  t.is(result, null);
  t.is(counter, list.length - 1);
});

test('util:renameList:error', async t => {
  const list = [
    {oldPath: 'a', newPath: 'b'},
    {oldPath: 'a', newPath: 'b'},
    {oldPath: 'a', newPath: 'b'}
  ];
  let counter = 0;
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
      counter++;
      process.nextTick(() => {
        if (counter === list.length) {
          callback(errorObj);
        } else {
          callback(null);
        }
      });
    }
  };
  const mockUtil = proxyquire('../../libs/util', {fs: mockFs});
  let result = null;
  await mockUtil.renameList(list, err => {
    result = err;
  });
  t.is(result, errorObj);
});
