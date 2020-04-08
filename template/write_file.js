var ejs = require('ejs');
const fs = require('fs'),
    path = require('path');
const data = require('../src/parsedoc');

const filename = path.resolve(__dirname, 'index.ejs');
const output = path.resolve(__dirname, 'index.html');

const test = JSON.stringify(data());

html = ejs.render(fs.readFileSync(filename, 'utf8'), {test: test}, {});



fs.writeFileSync(output, html, 'utf8');
