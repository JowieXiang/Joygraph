const doclets = require('../testcode/cosi_doclets.json')


const kinds = doclets.map(d => d.kind);
console.dir(kinds, {'maxArrayLength': null});
// process.stdout(kinds);