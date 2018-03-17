const test = require('tape');                     // Tests
const getRandomPort = require('get-random-port'); // A reliable way to get unused ports
const fs = require('fs');                         // We'll slurp the saved CSV file from disk
const http = require('http');                     // We'll serve the CSV from a temporary webserver
const wiki = require('../index');                 // The module under test

// Slurp the file from disk. `__dirname` because the CSV will be in the same directory as this test.
const index = fs.readFileSync(__dirname + '/wikipedias-2018-03-02.csv', 'utf8');

const agent = 'tapetest123123';

test('Loading and parsing cached Wikimedia Foundation CSV data', async (t) => {
  try {
    await wiki('http://localhost:1');
    throw new Error('_-^-_')
  } catch (e) { t.ok(/ECONNREFUSED/.test(e.toString()), 'Fetch error when no server running'); }

  const port = await getRandomPort();
  // Create an HTTP server that'll just dump the CSV data for each request
  let server = http.createServer((req, res) => {
    t.equal(req.headers['user-agent'], agent, 'custom user agent found');
    res.writeHead(200, { 'Content-Type' : 'text/plain' });
    res.end(index);
  });

  // Once the HTTP server is up and running, then begin our tests
  server.listen(port, async () => {
    // Invoke the module under test
    let data = await wiki(`http://localhost:${port}`, 'lang;prefix;edits;loclang'.split(';'), '', agent);

    t.ok(data.every(o => o.hasOwnProperty('lang') && o.hasOwnProperty('prefix') && o.hasOwnProperty('edits')
                         && o.hasOwnProperty('loclang')),
        'Each row has the fields we want');

    t.ok(data.every(o => typeof o.prefix === 'string'), 'Each row has stringy `prefix`');
    t.ok(data.every(o => typeof o.edits === 'number'), 'Each row has numeric `edits`');
    t.ok(data.some(o => o.lang === 'French' && o.loclang === 'Français'), 'HTML escapes unescaped, i.e., Français');

    // All done testing. Close the webserver (so this script can end) and tell tape we're done.
    server.close();
    t.end();
  });
});