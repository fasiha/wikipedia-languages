const fetch = require('cross-fetch');

const DEFAULT_SOURCE = 'https://wikistats.wmflabs.org/api.php?action=dump&table=wikipedias&format=csv';
const DEFAULT_KEYS = 'lang;prefix;total;good;views;edits;users;admins;loclang;loclanglink;activeusers;ratio'.split(';');
const DEFAULT_SEPARATOR = ',';

// Converts 'Fran&#231;ais! Fran&#231;ais!' to 'Français! Français!'. See
// https://www.w3.org/International/questions/qa-escapes
function unescapeDecimalEscapedHtml(text) { return text.replace(/&#([0-9]+);/g, (_, n) => String.fromCharCode(n)); }

// This is a trusting wrapper over `parseFloat` that returns the original string if `parseFloat` fails. It's trusting in
// that it will trust malformed inputs like "1foo" the way `parseFloat` does.
function gentlyParseNumber(text) { return parseFloat(text) || text; }

// Download a Wikimedia Foundation CSV from the web, gently parse it, and dump the columns of interest as JavaScript
// objects.
async function parse(source, keys, sep) {
  // Fix arguments
  source = source || DEFAULT_SOURCE;
  keys = (keys && keys.length) ? keys : DEFAULT_KEYS;
  sep = sep || DEFAULT_SEPARATOR;

  // HTTP request and error checking
  const res = await fetch(source);
  if (res.status >= 400) { throw new Error('Status ' + res.status + ' received from ' + source); }

  // Make sure we got at least one line of header and one line of data
  const data = await res.text();
  let lines = data.trim().split(/[\n\r]+/);
  if (lines.length < 2) { throw new Error('Insufficient data found'); }

  // Parse the header. Associate each column name with a column idx. Then find the column indexes for the requested
  // keys.
  const header = lines.shift().split(sep);
  const colNamesToIdx = new Map(header.map((key, i) => [key, i]));
  const keysAsColIdxs = keys.map(key => colNamesToIdx.get(key));
  if (!keysAsColIdxs.every(idx => idx)) { throw new Error('Could not find all required keys in data'); }

  // Convert data lines to a table (array of arrays) and keep only the columns that were explicitly requested. Mild data
  // massaging on the values include unescaping HTML, etc.
  const table = lines.map(s => s.split(sep));
  const subset = table.map(record => {
    let obj = {};
    keysAsColIdxs.forEach(
        (recordIdx, keyIdx) => obj[keys[keyIdx]] = gentlyParseNumber(unescapeDecimalEscapedHtml(record[recordIdx])));
    return obj;
  });
  return subset;
}

if (require.main === module) {
  (async function main() {
    console.log(JSON.stringify(
        await parse(
            null, 'lang;prefix;total;good;views;edits;users;admins;loclang;loclanglink;activeusers;ratio'.split(';')),
        null, 1));
  })();
}

module.exports = parse;