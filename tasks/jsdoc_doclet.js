const { exec } = require("child_process"),
    fs = require('fs'),
    path = require("path"),
    pathToJsDocCmd = path.resolve(__dirname, "../node_modules/.bin/jsdoc");

/**
 * Removes folder jsdoc if it exists.
 * rd remove directory
 * /s with all subfolders
 * /q without confirmations
 * Then it generates the JsDoc using:
 * Config: -c jsdoc-config.json
 */

exec(pathToJsDocCmd + " -X -c config/jsdoc-doclet.json", {}, (err, stdout, stderr) => {
    // console.log(stdout);
    fs.writeFile('testcode/doclets.json', stdout, function (err) {
        if (err) return console.log(err);
        console.log('Hello World > helloworld.txt');
    });
});

console.log(pathToJsDocCmd);

process.on("unhandledRejection", function (error) {
    throw new Error(error);
});

