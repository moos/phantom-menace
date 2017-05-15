## phantom-menace

Minimalist polyfill (minifill!) to make PhantomJS runners work with Headless Chrome.

## Install
```shell
$ npm install phantom-menace --save
```
## Usage
In your runner script:

```js
var {phantom, fs, system} = require('phantom-menace');
```
Then replace your `require('fs')` and `require('system')` with above. Cross your fingers and run it!

## Replacing `webpage`

No direct polyfill for phantom's [webpage](http://phantomjs.org/api/webpage/) module is provided. Instead you can use [chromate](https://github.com/moos/chromate) to load a target test page and listen for events.

```js
// phantom runner to replace
    page = require('webpage').create();

    page.onConsoleMessage = function (msg) {
        console.log(msg);
    };

    page.onInitialized = function () {
        page.evaluate(addLogging);
    };

    page.onCallback = handleResult;
    
    page.open(url, function (status) { ...  });

    function handleResult(message) {
        var result,
            failed;

        if (message) {
            if (message.name === 'QUnit.done') {
                result = message.data;
                failed = !result || !result.total || result.failed;

                if (!result.total) {
                    console.error('No tests were executed. Are you loading tests asynchronously?');
                }

                exit(failed ? 1 : 0);
            }
        }
    };

```
Replace that with an equivalent _phantom-menace_ runner using [chromate](https://github.com/moos/chromate):
```js
    var Tab = require('chromate').Tab;
    var {phantom, fs, system} = require('phantom-menace');

    url = 'file://' + fs.absolute(file); // must be absolute path

    page = new Tab({ verbose: true });
    page.on('console', (msg) => console.log(msg));
    page.on('load', () => page.execute(addLogging));
    page.on('done', handleResult);
    
    page.open(url)
      .then(() => page.evaluate('typeof QUnit').then(res => {
        if (res === 'undefined') {
          console.log('QUnit not found');
          page.close().then(exit);
        }
      }))
      .catch(err => console.log('Tab.open error', err));
```

`addLogging` is the function that registers a QUnit 'done' event.  In 
phantomjs world, it would look something like:

```js
function addLogging() {
    QUnit.done(function (result) {
        console.log('\n' + 'Took ' + result.runtime + 'ms to run ' + result.total + ' tests. ' + result.passed + ' passed, ' + result.failed + ' failed.');

        if (typeof window.callPhantom === 'function') {
            window.callPhantom({
                'name': 'QUnit.done',
                'data': result
            });
        }
    });
}
```

With chromate, replace `callPhantom` with `__chromate({event, data})`:
```js
      if (typeof window.__chromate === 'function') {
          window.__chromate({event: 'done', data: result });
      }
```
and modify your `handleResult` function to receive: 
```js
{ event: 'done',
  data: { failed: 0, passed: 150, total: 150, runtime: 18 } }
```
See [./bench](./bench) folder for sample runners.

## Benefits
Headless Chrome is great.  And fast.  It pays to test your code in the same browser that your end-users use.

## Benchmark

A rudimentary benchmark test was run (see [bench/passing.html] for details)
consisting of 150 tests.

```shell
$ npm run bench
```

The tests are run 10 times, i.e. 10 invocations of phantomjs (wi-fi off, see below) or Chrome headless, for a total of 1500 tests.  Here are the result:
| time | PhantomJS | Chrome | improvement |
|--|--|--|--|
| real | 0m9.555s | 0m4.440s | **2x** |
| user | 0m6.832s | 0m2.037s | 3.3x |
| sys  | 0m1.603s | 0m0.443s | 3.6x |

If the instance of Chrome headless is reused, the improvements are even more dramatic, real time dropping to 2.87s (3.3x) and user time to 1.7s (4x).

### phantomjs/Qt wi-fi issue
Latest version of PhantomJS (2.1) that is based on Qt is suffering [an issue](https://github.com/ariya/phantomjs/issues/14296) which results is severly degraded performance while wi-fi is turned on.  This is quite a henderance when running tests on deverloper machines.

The improvements gained by Chrome headless against phantom when wi-fi is on is as follows:
| time | PhantomJS | improvement with Chrome |
|--|--|--|
| real | 0m57.327s | **13x** |
| user | 0m7.703s | 3.8x |
| sys | 0m3.047s | 6.8x |



## Caveats

- This is *not* a drop-in replacement.  It will require some fidgeting to make it work.
- Many features are missing, including:
  - cookie support
  - many `webpage` module methods
  - `fs` module polyfill has been well tested, but is missing some methods.
  - `system` module parameters (e.g. `system.platform`) are based on nodejs's
   and may be different than phantom's.
  
If you find this useful, contributions are welcomed.

### License

MIT
