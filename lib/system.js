

module.exports = {

  args: process.argv.slice(1),

  env: process.env,

  os: {

    pid: process.pid,

    platform: 'phantomjs',

    // x64
    architecture: process.arch,

    // 'win32' on Win10
    // 'darmin' on OS X
    name: process.platform,

    // '10.0.14393' on Win10
    // '16.5.0' on OS X Sierra
    version: require('os').release()
  }
};
