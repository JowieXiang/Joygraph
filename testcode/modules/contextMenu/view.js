import "./style.less";
import Template from "text-loader!./template.html";

const ContextMenuView = Backbone.View.extend(/** @lends ContextMenuView */ {
    events: {
        "click .close": "closeContextMenu",
        "click #actions": "closeContextMenu",
        "click #actions input": function (evt) {
            evt.stopPropagation();
        },
        "click #actions .info": function (evt) {
            evt.stopPropagation();
            Radio.trigger("Alert", "alert", {
                text: evt.target.getAttribute("title"),
                kategorie: "alert-info"
            });
        }
    },

    /**
     * initializes a right-click context menu that can be filled from any view
     * @class ContextMenuView
     * @extends Backbone.View
     * @memberof ContextMenu
     * @constructs
     * @listens ContextMenu#RadioTriggerAddContextMenu
     * @listens ContextMenu#RadioTriggerSetActions
     * @listens ContextMenu#RadioTriggerClose
     */
    initialize () {
        $(".masterportal-container").after(this.$el);

        this.channel = Radio.channel("ContextMenu");

        this.channel.on({
            "addContextMenu": this.addContextMenu,
            "setActions": this.setActions,
            "close": function () {
                this.$el.addClass("hidden");
                this.$el.find("#actions").empty();
            }
        }, this);

        window.oncontextmenu = (evt) => {
            evt.preventDefault();
            return false;
        };

        this.render();
    },
    template: _.template(Template),
    id: "context-menu",
    targets: [],
    model: {},
    channel: "",

    /**
     * renders the context menu
     * appends to body
     * @returns {Backbone.View} returns this
     */
    render () {
        this.$el.html(this.template());
        this.$el.addClass("hidden");
        return this;
    },

    /**
     * adds the context menu to any DOM element by EventListeners
     * @param {Element} element the DOM element
     * @returns {void}
     */
    addContextMenu (element) {
        element.addEventListener("mouseup", this.mouseButtonHandler.bind(this));
        element.addEventListener("touchstart", this.touchStart.bind(this));
        element.addEventListener("touchend", this.touchEnd.bind(this));
    },

    /**
     * sets the contextActions to show in the context menu
     * @param {*} element the HTML to show inside the contextMenu
     * @param {*} title="Aktionen" the title for the menu
     * @param {*} glyphicon="gylphicon-wrench" the icon for the menu
     * @returns {void}
     */
    setActions (element, title = "Aktionen", glyphicon = "glyphicon-wrench") {
        this.$el.find("#actions").html(element);
        this.$el.find("#name").html(title);
        this.$el.find("#glyphicon").attr("class", `glyphicon ${glyphicon}`);
    },

    /**
     * handles the mouseUp event to open / close the menu
     * @param {Event} evt the mouseEvent
     * @returns {void}
     */
    mouseButtonHandler (evt) {
        const button = evt.button;

        switch (button) {
            case 0:
                this.closeContextMenu(evt);
                break;
            case 2:
                this.openContextMenu(evt);
                break;
            default:
                break;
        }
    },

    /**
     * starts touch interaction, counts touch duration
     * @param {Event} evt the TouchEvent
     * @returns {void}
     */
    touchStart (evt) {
        this.touchCount = evt.touches.length;
        this.touchStartTime = Date.now();
    },

    /**
     * handles the TouchEnd event to open / close the menu
     * @param {Event} evt the TouchEvent
     * @returns {void}
     */
    touchEnd (evt) {
        if (this.touchCount <= 1 && evt.changedTouches[0].force < 0.01) {
            if (Date.now() > this.touchStartTime + 500) {
                evt.preventDefault();
                this.openContextMenu(evt);
            }
            else {
                this.closeContextMenu(evt.changedTouches[0]);
            }
        }
    },

    /**
     * opens the menu at pointer position
     * @param {Event} evt the pointerEvent
     * @returns {void}
     */
    openContextMenu (evt) {
        if (this.$el.find("#actions").html().trim()) {
            this.$el.removeClass("hidden");

            const _evt = evt.type === "touchend" ? evt.changedTouches[0] : evt;

            if (_evt.clientY + this.el.clientHeight < window.innerHeight) {
                this.$el.css({
                    "top": _evt.clientY,
                    "bottom": "auto"
                });
            }
            else {
                this.$el.css({
                    "top": "auto",
                    "bottom": window.innerHeight - _evt.clientY
                });
            }

            if (_evt.clientX + this.el.clientWidth < window.innerWidth) {
                this.$el.css({
                    "left": _evt.clientX,
                    "right": "auto"
                });
            }
            else {
                this.$el.css({
                    "left": "auto",
                    "right": window.innerWidth - _evt.clientX
                });
            }
        }
    },

    /**
     * closes the menu
     * @param {Event} evt the pointerEvent
     * @returns {void}
     */
    closeContextMenu (evt) {
        if (!$(evt.target).hasClass("has-sub-menu")) {
            this.$el.addClass("hidden");
            this.$el.find("#actions").empty();
        }
    }
});

export default ContextMenuView;
