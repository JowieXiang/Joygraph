const {
    mxStackLayout,
    mxLayoutManager,
    mxGraph,
    mxCodec,
    mxUtils,
    mxCompactTreeLayout
} = require('mxgraph')({
    // These are wrong but harmless at the moment.
    mxImageBasePath: "",
    mxBasePath: ""
});

exports.draw = function (data, conf) {
    const graph = createGraph(data, conf);
    return graphToHTML(graph);
}

function createGraph(data, conf) {
    // Creates the graph inside the given container
    const graph = new mxGraph(),
        style = conf.cell,
        root = graph.getDefaultParent();

    setLayout(graph, conf.layout);

    graph.getModel().beginUpdate();
    try {
        let nsVts = {},
            classVts = {},
            functionVts = {},
            edges = {};
        for (const d in data) {
            const ns = data[d];
            // create namespace stacks
            nsVts[ns.longname + '_stack'] = graph.insertVertex(root, ns.longname + '_stack', null, ...style.block.geo, style.block.stl);
            nsVts[ns.longname] = graph.insertVertex(nsVts[ns.longname + '_stack'], ns.longname, ns.longname, ...style.namespace.geo, style.namespace.stl);

            for (const c in ns.classes) {
                const cls = ns.classes[c];
                classVts[cls.longname] = graph.insertVertex(nsVts[ns.longname + '_stack'], cls.name, cls.name, ...style.class.geo, style.class.stl);
                edges[cls.longname + '_stack'] = graph.insertEdge(nsVts[ns.longname + '_stack'], null, '', nsVts[ns.longname], classVts[cls.longname], style.edge.stl);

                for (const f in cls.functions) {
                    const ft = cls.functions[f];
                    functionVts[ft.longname] = graph.insertVertex(nsVts[ns.longname + '_stack'], ft.name, ft.name, ...style.function.geo, style.function.stl);
                }
                for (const f in cls.functions) {
                    const ft = cls.functions[f];
                    edges[f.longname] = graph.insertEdge(nsVts[ns.longname + '_stack'], null, '', classVts[cls.longname], functionVts[ft.longname], style.edge.stl);
                }
            }
            // create connection of inheritance
            for (const c in ns.classes) {
                const cls = ns.classes[c];
                if (cls.augments) {
                    /**
                     * not stable. the augments field is an array
                     */
                    edges[cls.longname] = graph.insertEdge(nsVts[ns.longname + '_stack'], null, '', classVts[cls.longname], classVts[cls.memberof + '.' + cls.augments[0]], style.ed);
                }
            }
        }
    }
    finally {
        graph.getModel().endUpdate();
        return graph;
    }
}

function setLayout(graph, conf) {
    const stackLayout = new mxStackLayout(graph, false),
        treeLayout = new mxCompactTreeLayout(graph),
        layoutMgr = new mxLayoutManager(graph);

    for (const key in conf.mxStackLayout) {
        stackLayout[key] = conf.mxStackLayout[key];
    }
    for (const key in conf.mxCompactTreeLayout) {
        treeLayout[key] = conf.mxCompactTreeLayout[key];
    }
    layoutMgr.getLayout = function (cell) {
        if (!graph.getModel().isEdge(cell) && graph.getModel().getChildCount(cell) > 0 &&
            (graph.getModel().getParent(cell) == graph.getModel().getRoot())) {
            return stackLayout;
        }
        return treeLayout;
    };
}

function graphToXML(graph) {
    var encoder = new mxCodec();
    var result = encoder.encode(graph.getModel());
    return mxUtils.getXml(result);
}

function graphToHTML(graph) {
    const xml = graphToXML(graph);
    return getHtml2(xml, "Joy diagram");
}

function getHtml2(xml, title, redirect) {

    const EditorUi = {
        drawHost: 'https://www.draw.io'
    },
        js = EditorUi.drawHost + '/js/viewer.min.js',
        foldingEnabled = false;

    // Makes XHTML compatible
    if (redirect != null) {
        redirect = redirect.replace(/&/g, '&amp;');
    }
    const data = { highlight: '#0000ff', nav: foldingEnabled, resize: false, xml: xml, toolbar: '' },
        style = 'max-width:100%;border:1px solid transparent;';

    // creates html
    return `${(redirect == null) ? '<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=5,IE=9" ><![endif]-->\n' : ''}
        <!DOCTYPE html>\n<html
        ${(redirect != null) ? ' xmlns="http://www.w3.org/1999/xhtml">' : '>'}
        \n<head>\n
        ${(redirect == null) ? ((title != null) ? '<title>' + mxUtils.htmlEntities(title) + '</title>\n' : '') : '<title>Draw.io Diagram</title>\n'}
        ${(redirect != null) ? '<meta http-equiv="refresh" content="0;URL=\'' + redirect + '\'"/>\n' : ''}
        <meta charset="utf-8"/>\n</head>\n<body style="background-color:white">
        \n<div class="mxgraph" style="
        ${style}
        " data-mxgraph="
        ${mxUtils.htmlEntities(JSON.stringify(data))}
        "></div>\n
        ${(redirect == null) ? '<script type="text/javascript" src="' + js + '"></script>' :
            '<a style="position:absolute;top:50%;left:50%;margin-top:-128px;margin-left:-64px;" ' +
            'href="' + redirect + '" target="_blank"><img border="0" ' +
            'src="' + EditorUi.drawHost + '/images/drawlogo128.png"/></a>'}
        \n</body>\n</html>\n`;
}


