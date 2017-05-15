
var assert = require('assert');
var menace = require('../index');
var phantom = menace.phantom;
var fs = menace.fs;

describe('phantom-menace', function() {

  it('should check basic stuff', function() {

    assert.equal(typeof phantom.exit, 'function');

    assert.equal(menace.system.os.platform, 'phantomjs');

    assert.equal(fs.separator, fs.path.sep);
  });

});