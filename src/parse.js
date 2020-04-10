
const _ = require('lodash');

exports.parse = function (doclets) {
    // 给doclets分类
    const functions = doclets.filter(d => d.kind === 'function'),
        members = doclets.filter(d => d.kind === 'member'),
        // classes = doclets.filter(d => d.kind === 'class' && d.classdesc && d.description),
        classes = doclets.filter(d => d.kind === 'class'),
        namespaces = doclets.filter(d => d.kind === 'namespace');

    // 得到最终的object
    let sortData = namespaces;
    sortData.forEach((ns) => {
        ns.classes = classes.filter(c => c.memberof === ns.longname);
        ns.classes.forEach((c) => {
            c.functions = functions.filter(f => f.memberof === c.longname);
        })
    })
    // console.log(JSON.stringify(sortData));
    return sortData;
}
