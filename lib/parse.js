
exports.parse = function (doclets) {
    const functions = getFunctions(doclets),
        members = getMembers(doclets),
        classes = getClasses(doclets),
        namespaces = getNamespaces(doclets);
    return sort(namespaces, classes, functions, members);
}

function sort(namespaces, classes, functions, members) {
    let result = namespaces;
    result.forEach((ns) => {
        ns.classes = classes.filter(c => c.memberof === ns.longname);
        ns.classes.forEach((c) => {
            c.functions = functions.filter(f => f.memberof === c.longname);
        })
    })
    return result;
}

function getFunctions(doclets) {
    if (doclets) {
        return doclets.filter(d => d.kind === 'function');
    }
}

function getClasses(doclets) {
    if (doclets) {
        return doclets.filter(d => d.kind === 'class');
    }
}

function getMembers(doclets) {
    if (doclets) {
        return doclets.filter(d => d.kind === 'member');
    }
}

function getNamespaces(doclets) {
    if (doclets) {
        return doclets.filter(d => d.kind === 'namespace');
    }
}
