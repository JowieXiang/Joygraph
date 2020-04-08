/**
 * 之后要替代成child-process-then
 */
const { exec } = require("child_process"),
    fs = require('fs'),
    path = require("path"),
    pathToJsDocCmd = path.resolve(__dirname, "../node_modules/.bin/jsdoc");


exec(pathToJsDocCmd + " -X -c config/jsdoc-doclet.json", {}, (err, stdout, stderr) => {
    // console.log(stdout);
    fs.writeFile('testcode/doclets.json', stdout, function (err) {
        if (err) return console.log(err);
        console.log('Hello World > helloworld.txt');
    });
});

/**
 * 得到JSON之后
 * then进行parse
 * 再之后JsDom得到html
 * 最后生成.html文件
 */

process.on("unhandledRejection", function (error) {
    throw new Error(error);
});

