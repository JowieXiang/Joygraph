
var exec = require('child_process').exec,
    fs = require('fs'),
    path = require("path"),
    pathToJsDocCmd = path.resolve(__dirname, "../node_modules/.bin/jsdoc"),
    confpath = path.resolve(__dirname, "config/jsdoc-doclet.json");
const { parse } = require('../src/parse');
const { createGraph, graphToHTML } = require('./draw');
const output = path.resolve(__dirname, 'graph.html');

/**
 * promisify child process
 */
new Promise((resolve, reject) => {
    exec(pathToJsDocCmd + " -X -c " + confpath, {maxBuffer: 2048 * 2048}, (err, stdout, stderr) => {
        if (err) {
            reject(Error(err));
        }
        resolve(stdout ? stdout : stderr);
    })

})
    // parse result to JSON
    .then(res => JSON.parse(res))
    // create mxGraph and write to file
    .then((res) => {
        const data = parse(res);
        const graph = createGraph(data);
        const html = graphToHTML(graph);
        fs.writeFileSync(output, html, 'utf8');
    })
    .catch(err => {
        console.log(err);
    })





process.on("unhandledRejection", function (error) {
    throw new Error(error);
});

