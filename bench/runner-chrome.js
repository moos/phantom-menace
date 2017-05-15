var {Chrome, Tab} = require('chromate');
var chrome;
var timeout = 3000;

Chrome.start({
  canary: true
}).then(run)
  .catch(err => {
    console.log('Could not start Chrome', err);
});

function run(ch) {
    'use strict';

    console.log('Chrome started')
    chrome = ch;

    var {phantom, fs, system} = require('phantom-menace');

    var url, page, timeout,
        args = system.args;

    // arg[0]: scriptName, args[1...]: arguments
    if (args.length < 2) {
        console.error('Usage:\n  node runner-chrome.js [url-of-your-qunit-testsuite]');
        exit(1);
    }

    url = 'file://' + fs.absolute(args[1]);

    page = new Tab({
      timeout: timeout
      // verbose: true
    });

    function handleResult(message) {
        var result = message.data,
            failed;

        console.log('\n' + 'Took ' + result.runtime + 'ms to run ' + result.total + ' tests. ' + result.passed + ' passed, ' + result.failed + ' failed.');

        failed = !result || !result.total || result.failed;

        if (!result.total) {
            console.error('No tests were executed. Are you loading tests asynchronously?');
        }

        page.close();
        exit(failed ? 1 : 0);
    }

  page.on('log', console.log);

  page.on('load', function() {
    page.execute(addLogging);
  });

  page.on('done', handleResult);

  page.open(url)
    .then(() => page.evaluate('typeof QUnit').then(res => {
        if (res === 'undefined') {
          console.log('QUnit not found');
          page.close().then(exit);
        }
    }))
    .catch(err => console.log('Tab.open error', err));

    function addLogging() {
        var currentTestAssertions = [];
        QUnit.testDone(function (result) {
            var i,
                len,
                name = '';

            if (result.module) {
                name += result.module + ': ';
            }
            name += result.name;

            if (result.failed) {
                console.log('\n' + 'Test failed: ' + name);

                for (i = 0, len = currentTestAssertions.length; i < len; i++) {
                    console.log('    ' + currentTestAssertions[i]);
                }
            }

            currentTestAssertions.length = 0;
        });

        QUnit.done(function (result) {
            console.log('\n' + 'Took ' + result.runtime + 'ms to run ' + result.total + ' tests. ' + result.passed + ' passed, ' + result.failed + ' failed.');

            if (typeof window.__chromate === 'function') {
                window.__chromate({event: 'done', data: result });
            }
        });
    }

    function exit(code) {
      Chrome.kill(chrome);
      phantom.exit(code);
    }
}
