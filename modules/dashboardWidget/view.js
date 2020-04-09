import Template from "text-loader!./template.html";
import {selection} from "d3-selection";
import "./style.less";

const DashboardWidgetView = Backbone.View.extend(/** @lends DashboardWidgetView */{
    events: {
        "click .dashboard-widget-close": "removeWidget",
        "click .win-control.open": "toggleOpen",
        "click .tool-name": "widgetInfo",
        "mousedown .drag": "resizeStart",
        "mousedown .header": "moveMouse",
        "pointerdown .win-control.open": function (evt) {
            evt.stopPropagation();
        }
    },

    /**
     * initialize a new dashboard widget view
     * @class DashboardWidgetView
     * @extends Backbone.View
     * @memberof Tools.Dashboard
     * @constructs
     * @param {Backbone.View | $ | d3.selection | string} content the content to render
     * @param {string} parent the container to append to
     * @param {*} opts options (optional)
     * @returns {void}
     */
    initialize (content, parent, opts = {}) {
        const attrs = opts;

        this.parent = parent;
        this.content = content;
        this.attrs = {
            id: attrs.id ? attrs.id : "view",
            name: attrs.name ? attrs.name : "Daten",
            glyphicon: attrs.glyphicon ? attrs.glyphicon : "glyphicon-info-sign",
            append: attrs.append !== undefined ? attrs.append : true,
            width: attrs.width ? attrs.width : "auto    ",
            height: attrs.height ? attrs.height : "auto",
            scalable: attrs.scalable ? attrs.scalable : false,
            focusOnInit: attrs.focus || false,
            noPrint: attrs.noPrint || false
        };

        this.render();
    },
    minimized: false,
    resizing: false,
    moving: false,
    dragStartXY: [],
    parent: "",
    content: {},
    attrs: {},
    template: _.template(Template),

    /**
     * renders the new widget to the parent
     * interprets type of provided content and adds event listeners
     * @fires ContextMenu#RadioTriggerAddContextMenu
     * @returns {Backbone.View} returns this
     */
    render () {
        const addScroll = typeof this.attrs.focusOnInit === "number" ? this.attrs.focusOnInit : 0;

        this.initializeDOMElement();
        this.$el.append(this.template(this.attrs));

        if (this.content instanceof Backbone.View) {
            this.renderView();
        }
        else if (this.content instanceof $) {
            this.render$el();
        }
        else if (typeof this.content === "string") {
            this.renderHtml();
        }
        else if (this.content instanceof selection) {
            this.renderD3();
        }

        if (this.attrs.width === "full") {
            this.attrs.width = ($(this.parent).width() - 50) + "px";
        }
        if (this.attrs.height === "full") {
            this.attrs.height = ($(this.parent).height() - 50) + "px";
        }

        this.el.style.width = this.attrs.width || "auto";
        this.el.style.height = this.attrs.height || "auto";
        this.initWidth = parseFloat(this.el.style.width.replace("px", ""));
        this.setSvgScale();

        window.addEventListener("mouseup", this.dragEnd.bind(this));
        window.addEventListener("mousemove", this.drag.bind(this));

        Radio.trigger("ContextMenu", "addContextMenu", this.el);

        if (this.attrs.focusOnInit) {
            this.findScrollableParent($(this.parent)).scrollTop(this.el.offsetTop + addScroll);
        }

        return this;
    },

    /**
     * sets parent DOM-Element for the widget
     * by given selector
     * @returns {Backbone.View} returns this
     */
    initializeDOMElement () {
        const widget = document.createElement("div");

        widget.className = this.attrs.noPrint ? "dashboard-widget noprint" : "dashboard-widget";
        widget.id = this.attrs.id;
        // check to prepend or append the widget
        if (this.attrs.append) {
            $(this.parent).append($(widget));
        }
        else {
            $(this.parent).prepend($(widget));
        }
        this.setElement(widget);

        return this;
    },

    /**
     * handler for content type Backbone.View
     * @returns {void}
     */
    renderView () {
        this.content.setElement(this.$el.find("#content").get(0));
        this.content.render();
    },

    /**
     * handler for content type $ Jquery Object
     * @returns {void}
     */
    render$el () {
        this.$el.find("#content").append(this.content);
    },

    /**
     * handler for content type plain HTML
     * @returns {void}
     */
    renderHtml () {
        this.$el.find("#content").html(this.content);
    },

    /**
     * handler for content type d3.selection
     * @returns {void}
     */
    renderD3 () {
        this.$el.find("#content").html(this.content.node());
    },

    /**
     * toggles Widget open/closed
     * @param {*} evt the click event
     * @returns {void}
     */
    toggleOpen (evt) {
        evt.stopPropagation();
        this.$el.toggleClass("minimized");
        this.minimized = !this.minimized;

        if (this.minimized) {
            this.el.style.height = this.$el.find(".header").outerHeight() + 20 + "px";
        }
        else {
            this.el.style.height = isNaN(this.attrs.height) ? this.attrs.height : this.attrs.height + "px";
        }
    },

    /**
     * removes the widget from the dashboard
     * @fires Dashboard#RadioTriggerDestroyWidgetById
     * @returns {void}
     */
    removeWidget () {
        Radio.trigger("Dashboard", "destroyWidgetById", this.attrs.id);
    },

    /**
     * handles mouse event to move the widget's position
     * @param {*} evt the mouse event
     * @returns {void}
     */
    moveMouse (evt) {
        if (evt.button === 0) {
            this.moveStart(evt);
        }
    },

    /**
     * handles the initial event input for moving the widget's position
     * @param {*} evt the event
     * @returns {void}
     */
    moveStart (evt) {
        evt.preventDefault();
        if (evt.target.tagName !== "BUTTON") {
            this.$el.addClass("dragging");

            const _evt = evt.type === "touchstart" ? evt.touches[0] : evt;

            this.$el.find(".widget-shadow").css({
                top: _evt.clientY + "px",
                left: _evt.clientX + "px",
                width: this.el.clientWidth + "px",
                height: this.el.clientHeight + "px"
            }).addClass("dragging");

            this.moving = true;
        }
    },

    /**
     * handles the initial event input for resizing the widget
     * @param {*} evt the event
     * @returns {void}
     */
    resizeStart (evt) {
        if (evt.button === 0) {
            evt.preventDefault();
            this.dragStartXY = [evt.clientX, evt.clientY];
            this.$el.addClass("dragging");

            this.resizing = true;
        }
    },

    /**
     * handles the release of touch / mouse on move / resize
     * @param {*} evt the DOM event
     * @returns {void}
     */
    dragEnd (evt) {
        if (this.moving) {
            evt.preventDefault();
            this.$el.find(".widget-shadow").removeClass("dragging");

            const widgets = document.querySelectorAll(".dashboard-widget"),
                newOrder = Array.from(widgets).sort((a, b) => {
                    var aPos = a === this.el ? [evt.clientX, evt.clientY] : [$(a).offset().left, $(a).offset().top],
                        bPos = b === this.el ? [evt.clientX, evt.clientY] : [$(b).offset().left, $(b).offset().top];

                    if (aPos[1] < bPos[1]) {
                        return -1;
                    }
                    if (aPos[0] < bPos[0]) {
                        return -1;
                    }
                    return 1;
                }, this);

            for (let i = 0; i < newOrder.length; i++) {
                newOrder[i].style.order = i;
            }
        }
        this.resizing = false;
        this.moving = false;
        this.$el.removeClass("dragging");
    },

    /**
     * updates the value on widget move / resize
     * @param {*} evt the DOM event
     * @returns {void}
     */
    drag (evt) {
        const _evt = evt.type === "touchmove" ? evt.changedTouches[0] : evt;

        if (this.resizing) {
            _evt.preventDefault();
            const dX = _evt.clientX - this.dragStartXY[0],
                dY = _evt.clientY - this.dragStartXY[1];

            this.attrs.width = this.el.clientWidth + dX;
            this.attrs.height = this.el.clientHeight + dY;

            this.el.style.width = this.attrs.width + "px";
            this.el.style.height = this.attrs.height + "px";

            this.dragStartXY = [_evt.clientX, _evt.clientY];
            this.setSvgScale();
        }
        if (this.moving) {
            this.$el.find(".widget-shadow").css({
                top: _evt.clientY + "px",
                left: _evt.clientX + "px"
            });
        }
    },

    /**
     * gets the widget's ID
     * @returns {string} ID
     */
    getId () {
        return this.attrs.id;
    },

    /**
     * recursively travels up the DOM to find a parent element with scrollable height
     * @param {$} $el the widget's DOM element
     * @returns {$} the scrollable parent element
     */
    findScrollableParent ($el) {
        if ($el.css("overflow-y") === "auto" || $el.css("overflow-y") === "scroll") {
            return $el;
        }
        else if ($el === $(window)) {
            return $el;
        }
        return this.findScrollableParent($el.parent());
    },

    /**
     * sets an scale factor attribute to svgs for export purposes
     * workaround when scaling SVGS
     * @returns {void}
     */
    setSvgScale () {
        if (this.attrs.width !== "auto") {
            const svg = this.el.querySelector("svg"),
                currentWidth = isNaN(this.attrs.width) ? parseFloat(this.el.style.width.replace("px", "")) : this.attrs.width;

            if (svg) {
                svg.setAttribute("scale", currentWidth / this.initWidth);
            }
        }
    }
});

export default DashboardWidgetView;
