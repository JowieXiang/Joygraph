exports.parse = function (doclets) {
    // 给doclets分类
    const functions = doclets.filter(d => d.kind === 'function');
    const members = doclets.filter(d => d.kind === 'member');
    const classes = doclets.filter(d => d.kind === 'class');


    // 得到最终的object
    let sortData = {};
    sortData = classes.filter((d) => d.classdesc && d.description);
    // console.log(sortData.map(d => d.name));
    sortData.forEach((d) => {
        d.functions = functions.filter(f => f.memberof === d.name);
    })
    return sortData;
}
// console.log(sortData[0].functions.map(f => f.name) , sortData[1].functions.map(f => f.name));
