'use strict';
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();
const path = require('path');
const data = require('../src/parse');

/**
 * set up JsDOM environment
 */
global.window = dom.window;
global.document = window.document;
global.XMLSerializer = window.XMLSerializer
global.navigator = window.navigator;





/**
 * run mxGraph codes
 */
var viewerModulePath = "mxgraph";
const mxgraph = require(viewerModulePath)({
    // These are wrong but harmless at the moment.
    mxImageBasePath: "./src/images",
    mxBasePath: "./src"
});

const { mxGraphModel, mxStackLayout, mxSwimlaneManager, mxEdgeStyle, mxLayoutManager, mxPoint, mxRubberband, mxGraph, mxCodec, mxUtils, mxSwimlaneLayout, mxHierarchicalLayout, mxCompactTreeLayout, mxConstants, mxPerimeter } = mxgraph;

exports.createGraph = function () {

    // Creates the graph inside the given container
    var graph = new mxGraph();

    // Enables rubberband selection
    new mxRubberband(graph);

    var layout = new mxStackLayout(graph, false);
    layout.resizeParent = true;
    // 是否充满整个parent
    layout.fill = false;
    layout.wrap = 600;
    layout.spacing = 50;


    // Keeps the lanes and pools stacked
    var layoutMgr = new mxLayoutManager(graph);


    var hlayout = new mxHierarchicalLayout(graph);
    
    var model = graph.getModel();

    layoutMgr.getLayout = function (cell) {
        console.log(cell.id);
        // console.log(model.isEdge(cell));
        // console.log(graph.getModel().getChildCount(cell) > 0);
        // console.log(model.getParent(cell) == model.getRoot());


        if (!model.isEdge(cell) && graph.getModel().getChildCount(cell) > 0 &&
            (model.getParent(cell) == model.getRoot())) {

            return layout;
        }

        return new mxHierarchicalLayout(graph);
    };

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    var parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
        var block0 = graph.insertVertex(parent, 'block0', 'Hello,', 20, 20, 80, 30);
        var w1 = graph.insertVertex(block0, 'w1', 'World1', 200, 150, 80, 30);
        var w2 = graph.insertVertex(block0, 'w2', 'world2', 200, 150, 80, 30);
        var w3 = graph.insertVertex(block0, 'w3', 'world2', 200, 150, 80, 30);
        var e2 = graph.insertEdge(block0, 'e2', '', w1, w3);
        var e1 = graph.insertEdge(block0, 'e1', '', w1, w2);
        var block1 = graph.insertVertex(parent, 'block1', 'Hello,', 20, 20, 80, 30);
        var _w1 = graph.insertVertex(block1, '_w1', '1', 200, 150, 80, 30);
        var _w2 = graph.insertVertex(block1, '_w2', '2', 200, 150, 80, 30);
        var _w3 = graph.insertVertex(block1, '_w3', '3', 200, 150, 80, 30);
        var _e2 = graph.insertEdge(block1, '_e2', '', _w1, _w3);
        var _e1 = graph.insertEdge(block1, '_e1', '', _w1, _w2);

        var block2 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
        var __w1 = graph.insertVertex(block2, '__w1', '4', 200, 150, 80, 30);
        var __w2 = graph.insertVertex(block2, '__w2', '5', 200, 150, 80, 30);
        var __w3 = graph.insertVertex(block2, '__w3', '6', 200, 150, 80, 30);
        var __e2 = graph.insertEdge(block2, '__e2', '', __w1, __w3);
        var __e1 = graph.insertEdge(block2, '__e1', '', __w1, __w2);
        var __e3 = graph.insertEdge(parent, '__e3', '', w1, __w2);

        // var _hello = graph.insertVertex(parent, null, 'Hello,', 400, 20, 80, 30);
        // var _w1 = graph.insertVertex(_hello, null, 'World1', 400, 150, 80, 30);
        // var _w2 = graph.insertVertex(_hello, null, 'world2', 400, 150, 80, 30);
        // var _e1 = graph.insertEdge(_hello, null, '', _w1, _w2);

        // layout.execute(parent);

    }
    finally {
        // Updates the display
        graph.getModel().endUpdate();
        return graph;
    }


}

// exports.createGraph = function (data) {
//     let graph = new mxGraph();

//     var classStyle = new Object();
//     classStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
//     classStyle[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
//     classStyle[mxConstants.STYLE_ROUNDED] = true;
//     graph.getStylesheet().putCellStyle('rounded', classStyle);



//     new mxRubberband(graph);
//     var layout = new mxSwimlaneLayout(graph);
//     layout.resizeParent = true;
//     // layout.parentBorder = 1;
//     // layout.moveParent = true;
//     layout.disableEdgeStyle = true;
//     // var first = new mxHierarchicalLayout(graph);
//     // var layout = new mxCompositeLayout(graph, [second, first], second);
//     var parent = graph.getDefaultParent();
//     graph.getModel().beginUpdate();
//     let classVts = {},
//         functionVts = {},
//         edges = {};
//     try {
//         /**
//          * generate all vertices
//          */
//         for (const c in data) {
//             // create class vertices
//             // classVts[data[c].name] = graph.insertVertex(parent, null, data[c].name, 20 + c * 200, 20, 120, 30);
//             classVts[data[c].name] = graph.insertVertex(parent, data[c].name, data[c].name, 0, 0, 120, 30, ';strokeWidth=0;fillColor=blue;textColor=white');

//             // console.log(data[c]);
//             let fs = data[c].functions;
//             for (const f in fs) {
//                 console.log(fs[f].name, f);
//                 // create function vertices
//                 if (!functionVts[fs[f].name])
//                     // functionVts[fs[f].name] = graph.insertVertex(parent, null, fs[f].name, 20 + f * 200, 100+100*c, 120, 30);
//                     functionVts[fs[f].name] = graph.insertVertex(classVts[data[c].name], null, fs[f].name, 0, 0, 120, 30);
//                 // connect function with class
//                 edges[`${data[c].name}_${fs[f].name}`] = graph.insertEdge(classVts[data[c].name], null, '', classVts[fs[f].memberof], functionVts[fs[f].name]);
//             }
//         }

//         for (const c in data) {
//             // connect inherited class
//             if (data[c].augments) {
//                 edges[`${data[c].name}_${data[c].augments}`] = graph.insertEdge(parent, null, '', classVts[data[c].name], classVts[data[c].augments]);
//             }
//         }
//         // var v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 400, 30);
//         // var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 120, 30);
//         // var e1 = graph.insertEdge(parent, null, '', v1, v2);
//         layout.execute(parent);

//     }
//     finally {
//         graph.getModel().endUpdate();
//     }
//     layout.execute(graph.getDefaultParent());

//     return graph;

// }


// 用mxUtils解析graph.getModel() -> Model是graph object的一部分
function graphToXML(graph) {
    var encoder = new mxCodec();
    var result = encoder.encode(graph.getModel());
    return mxUtils.getXml(result);
}

exports.graphToHTML = function (graph) {
    const xml = graphToXML(graph);
    return getHtml2(xml, "Hello World!");
}

// Extracted from https://github.com/jgraph/drawio/blob/master/src/main/webapp/js/diagramly/EditorUi.js#L1452
function getHtml2(xml, title, redirect) {

    const EditorUi = {
        drawHost: 'https://www.draw.io'
    }

    var js = EditorUi.drawHost + '/js/viewer.min.js';
    var foldingEnabled = false;

    // Makes XHTML compatible
    if (redirect != null) {
        redirect = redirect.replace(/&/g, '&amp;');
    }

    var data = { highlight: '#0000ff', nav: foldingEnabled, resize: false, xml: xml, toolbar: '' };

    var style = 'max-width:100%;border:1px solid transparent;';


    // 生成完整的html
    return ((redirect == null) ? '<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=5,IE=9" ><![endif]-->\n' : '')
        +
        '<!DOCTYPE html>\n<html'
        +
        ((redirect != null) ? ' xmlns="http://www.w3.org/1999/xhtml">' : '>')
        +
        '\n<head>\n'
        +
        ((redirect == null) ? ((title != null) ? '<title>' + mxUtils.htmlEntities(title) + '</title>\n' : '') : '<title>Draw.io Diagram</title>\n')
        +
        ((redirect != null) ? '<meta http-equiv="refresh" content="0;URL=\'' + redirect + '\'"/>\n' : '')
        +
        '<meta charset="utf-8"/>\n</head>\n<body>'
        +
        '\n<div class="mxgraph" style="' + style + '" data-mxgraph="' + mxUtils.htmlEntities(JSON.stringify(data)) + '"></div>\n' +
        ((redirect == null) ? '<script type="text/javascript" src="' + js + '"></script>' :
            '<a style="position:absolute;top:50%;left:50%;margin-top:-128px;margin-left:-64px;" ' +
            'href="' + redirect + '" target="_blank"><img border="0" ' +
            'src="' + EditorUi.drawHost + '/images/drawlogo128.png"/></a>')
        +
        '\n</body>\n</html>\n';
}


