#!/usr/bin/env node
// 上面这个shebang line帮助unix系统把这个文件变成一个可执行文件
// 即在命令行中不写node dox，只用写dox就行

/**
 * Module dependencies.
 */

var program = require('commander')
  , pkg = require('../package')
  , util = require('util')
  , dox = require('..');

// options
// 定义操作和操作注释
program
  .version(pkg.version)
  .option('-r, --raw', 'output "raw" comments, leaving the markdown intact')
  .option('-a, --api', 'output markdown readme documentation')
  .option('-s, --skipPrefixes [prefixes]', 'skip comments prefixed with these prefixes, separated by commas')
  .option('-d, --debug', 'output parsed comments for debugging')
  .option('-S, --skipSingleStar', 'set to false to ignore `/* ... */` comments');

// examples
// 监听help事件，在键入--help的时候输出以下额外帮助信息
program.on('--help', function () {
  console.log('  Examples:');
  console.log('');
  console.log('    # stdin');
  console.log('    $ dox > myfile.json');
  console.log('');
  console.log('    # operates over stdio');
  console.log('    $ dox < myfile.js > myfile.json');
  console.log('');
});

// parse argv

program.parse(process.argv);
// process stdin

var buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) { buf += chunk; });
process.stdin.on('end', function () {
  // 得到编译结果
  var obj = dox.parseComments(buf, { raw: program.raw || program.api, skipPrefixes: program.skipPrefix && program.skipPrefix.split(','), skipSingleStar: !!program.skipSingleStar });
  // 将翻译结果转换为string，并且染色，用于debug。
  if (program.debug) {
    process.stdout.write(util.inspect(obj, false, Infinity, true) + '\n'); // 结尾的\n用于在命令行中换行
  } else if (program.api) {
    process.stdout.write(dox.api(obj));
  }
  // 没有特殊option的话，就输出字符串 
  else {
    process.stdout.write(JSON.stringify(obj, null, 2));
  }
}).resume();
