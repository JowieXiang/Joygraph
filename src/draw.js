'use strict';
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();
const path = require('path');
const data = require('../src/parse');

global.window = dom.window;
global.document = window.document;
global.XMLSerializer = window.XMLSerializer
global.navigator = window.navigator;

var viewerModulePath = "mxgraph";
const mxgraph = require(viewerModulePath)({
    // These are wrong but harmless at the moment.
    mxImageBasePath: "./src/images",
    mxBasePath: "./src"
});

const { mxRubberband, mxGraph, mxCodec, mxUtils } = mxgraph;

const helloWorldGraph = makeHelloWorld();
console.log(graphToHTML(helloWorldGraph));

function makeHelloWorld() {
    var graph = new mxGraph();
    new mxRubberband(graph);
    var parent = graph.getDefaultParent();

    graph.getModel().beginUpdate();
    try {
        var v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 400, 30);
        var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 120, 30);
        var e1 = graph.insertEdge(parent, null, '', v1, v2);
    }
    finally {
        graph.getModel().endUpdate();
    }
    return graph;
}

// 用mxUtils解析graph.getModel() -> Model是graph object的一部分
function graphToXML(graph) {
    var encoder = new mxCodec();
    var result = encoder.encode(graph.getModel());
    return mxUtils.getXml(result);
}

function graphToHTML(graph) {
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