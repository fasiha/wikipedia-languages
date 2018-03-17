# Wikipedia-languages

Get all the languages Wikipedia is in, from the source, at Wikistats: [https://wikistats.wmflabs.org/](https://wikistats.wmflabs.org/).

***Important caveat*** This is an unofficial npm repository and software package, unsanctioned by the Wikimedia Foundation. Furthermore, the Wikistats service might change at any time, rendering this package unusable. Please open an issue or get in touch if/when this happens.

## Install

**Node.js** In your Node.js project, run
```
$ npm add --save wikipedia-languages
```
Then in your JavaScript files,
```js
// import the module
var wikilangs = require('wikipedia-languages');

// example usage (see below for full API):
wikilangs().then(res => console.log(res));
```

**Browser** This module works in the browser (although it might need some CORS workarounds, see below). Download the [`dist/bundle.min.js`](dist/bundle.min.js) to your app and load it by putting the following in your HTML:
```html
<script type="text/javascript" src="bundle.min.js"></script>
```

This will load the library's function into the global namespace as `wikilangs` (the only place that name appears in this repository is in the [`package.json`](package.json), the package name that `browserify` uses), so you can pop open your JavaScript Console and run the following—it's slightly adapted from the above because the Wikimedia Foundation webserver doesn't yet support CORS:
```js
wikilangs('https://cors-anywhere.herokuapp.com/' + 'https://wikistats.wmflabs.org/api.php?action=dump&table=wikipedias&format=csv').then(res => console.log(res));
```

## API/usage

Once the `wikilangs` variable is available, either in Node or in the browser, invoke it as a function that returns a Promise. It's call signature is:

**`wikilangs(source=DEFAULT_SOURCE, keys=DEFAULT_KEYS, sep=",", userAgent="See [repo url]") // => [Object]`**

That is,
- `source` is the URL to load; by default, the Wikipedias CSV file hosted on https://wikistats.wmflabs.org/;
- `keys` is an array of strings corresponding to the columns in that CSV file; by default, this module will look for and return the following columnar keys:  `lang`, `prefix`, `total`, `good`, `views`, `edits`, `users`, `admins`, `loclang`, `loclanglink`, `activeusers`, `ratio` (meaning, stub to article ratio). Currently, these and the following keys are available: `id`, `ts`,  `images`, `version`, `si_mainpage`, `si_base`, `si_sitename`, `si_generator`, `si_phpversion`, `si_phpsapi`, `si_dbtype`, `si_dbversion`, `si_rev`, `si_case`, `si_rights`, `si_lang`, `si_fallback8bitEncoding`, `si_writeapi`, `si_timezone`, `si_timeoffset`, `si_articlepath`, `si_scriptpath`, `si_script`, `si_variantarticlepath`, `si_server`, `si_wikiid`, `si_time`, `method`, `http`, `status`.
- `sep` is the separator, by default the comma, since we're loading a CSV (comma-separated value) file.
- `userAgent` is a string to identify your request to the Wikimedia Foundation Labs server as. If you plan on deploying this in a way that might place a burden on the WMF server, pass in a custom string here telling them how to get in touch with you (email or contact URL; otherwise they might just block your IP address and send a banshee to torment you). By default it points to this GitHub repo.

The returned Promise will wrap an array of objects whose keys were specified in `keys`. The values are lightly massaged, e.g., strings are converted to numbers, HTML escape sequences like `"Fran&#231;ais"` and `"&#26085;&#26412;&#35486;"` are unescaped to "Français" and "日本語".

Truncated output from Node:
```js
> wikilangs(null, 'lang;prefix;edits;loclang'.split(';')).then(x => console.log(x));
[ { lang: 'English', prefix: 'en', edits: 824284542, loclang: 'English' },
  { lang: 'Cebuano', prefix: 'ceb', edits: 20990777, loclang: '"Sinugboanong Binisaya"' },
  { lang: 'Swedish', prefix: 'sv', edits: 42461390, loclang: 'Svenska' },
  { lang: 'German', prefix: 'de', edits: 173796206, loclang: 'Deutsch' },
  { lang: 'French', prefix: 'fr', edits: 145639901, loclang: 'Français' },
  { lang: 'Dutch', prefix: 'nl', edits: 50968414, loclang: 'Nederlands' },
  { lang: 'Russian', prefix: 'ru', edits: 90981026, loclang: 'Русский' },
  { lang: 'Italian', prefix: 'it', edits: 94827439, loclang: 'Italiano' },
  { lang: 'Spanish', prefix: 'es', edits: 105583907, loclang: 'Español' },
  { lang: 'Polish', prefix: 'pl', edits: 52493781, loclang: 'Polski' },
  //...
  ]
```

(You may have the exact same question that I had, in which case we have company: see ["Why are there so many articles in the Cebuano Wikipedia?"](https://www.quora.com/Why-are-there-so-many-articles-in-the-Cebuano-language-on-Wikipedia).)

## Developing

After installing [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/), clone this repository by running the following in your command prompt:
```
$ git clone https://github.com/fasiha/wikipedia-languages.git
```
Then run the following to enter the directory you just cloned and install all dependencies:
```
$ cd wikipedia-languages && npm install
```

After editing some files (all the source currently lives in `index.js`, tests in `tests/test.js`), format code with [clang-format](https://clang.llvm.org/docs/ClangFormat.html). My editor invokes this on save, but you can also run, e.g., `clang-format -i index.js`.

Run tests with `$ npm test`. This uses [`tape`](https://github.com/substack/tape) behind the scenes.

Bundle and transpile for old browsers with `$ npm bundle`. (This calls Browserify to concatenate all dependencies into a single `dist/bundle.js`, and then calls Google Closure Compiler to optimize and transpile this to `dist/bundle.min.js`. (If you use an older Node, you should be able to `require` this minified ES5-compatible `bundle.min.js`.))

## License

See `UNLICENSE`.

## Changelog

**1.1.0** Add `userAgent` argument to the module.

**1.0.0** Initial.