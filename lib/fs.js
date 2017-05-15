var fs = require('fs-extra');
var path = require('path');


var FS = {
  version: 'node-phantomjs-fs:1.0',

  // helpers
  node: fs,
  path: path,

  separator: path.sep,
  absolute: path.resolve,

  isFile: function(path) {
    return FS.exists(path) && fs.statSync(path).isFile();
  },

  isDirectory: function(path) {
    return FS.exists(path) && fs.statSync(path).isDirectory();
  },

  isReadable: function(path) {
    return FS.access(path, fs.constants.R_OK)
  },

  exists: function(path) {
    return FS.access(path, fs.constants.F_OK)
  },

  read: function(path) {
    return fs.readFileSync(path, 'utf8');
  },

  list: fs.readdirSync,
  
  write: function(path, content, flag) {
    fs.ensureFileSync(path);
    return fs.writeFileSync(path, content, {flag: flag});
  },

  remove: fs.unlinkSync,

  access: function(path, flag) {
    var ok = false;
    try {
      fs.accessSync(path, flag);
      ok = true;
    } catch (e) {}
    return ok;
  }
};

module.exports = FS;
