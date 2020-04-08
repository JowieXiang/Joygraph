const { exec } = require("child_process"),
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

exec(pathToJsDocCmd + " -c config/jsdoc-template.json", {}, (err, stdout, stderr) => {
});

console.log(pathToJsDocCmd);

process.on("unhandledRejection", function (error) {
    throw new Error(error);
});

