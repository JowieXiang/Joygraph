/**
 * setup global fields using JSDOM
 * so that the node modules will simulate the behavior of a browser
 */
const jsdom = require("jsdom"),
    { JSDOM } = jsdom,
    dom = new JSDOM();

global.window = dom.window;
global.document = global.window.document;
global.XMLSerializer = global.window.XMLSerializer
global.navigator = global.window.navigator;

const exec = require('child_process').exec,
    fs = require('fs'),
    path = require("path"),
    { parse } = require('./parse'),
    mxgraph = require('./mxgraph'),
    mxgraph_conf = require(path.resolve(__dirname, "config/mxgraph.config.json")),
    paths = {
        jsdoc: path.resolve(__dirname, "../node_modules/.bin/jsdoc"),
        jsdoc_conf: path.resolve(__dirname, "config/jsdoc.config.json"),
        out: path.resolve(__dirname, 'graph.html')
    },
    maxBuffer = 2048 * 2048;

exports.build = function () {
    new Promise((resolve, reject) => {
        exec(`${paths.jsdoc} -X -c ${paths.jsdoc_conf}`, { maxBuffer: maxBuffer }, (err, stdout, stderr) => {
            if (err) reject(Error(err));
            resolve(stdout ? stdout : stderr);
        })
    })
        .then(res => {
            // fs.writeFileSync(path.resolve(__dirname, 'parse.json'), res, 'utf8');
            return JSON.parse(res)
        })
        .then((res) => {
            const data = parse(res);
            return mxgraph.draw(data, mxgraph_conf)
        })
        .then((res) => {
            fs.writeFileSync(paths.out, res, 'utf8');
        })
        .catch(err => {
            console.log(err);
        })

    process.on("unhandledRejection", function (error) {
        throw new Error(error);
    });
}