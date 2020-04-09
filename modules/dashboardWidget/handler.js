import DashboardWidgetView from "./view";
import {selection} from "d3-selection";

const DashboardWidgetHandler = Backbone.Model.extend(/** @lends DashboardWidgetHandler */{
    defaults: {
        children: [],
        channel: "",
        ids: [],
        rawDashboardWidget: {}
    },

    /**
     * @class DashboardWidgetHandler
     * @extends Backbone.Model
     * @memberof Tools.Dashboard
     * @constructs
     * @param {object} attrs the attributes set in tools.js
     * @listens Dashboard#RadioTriggerAppend
     * @listens Dashboard#RadioTriggerDestroyWidgetById
     * @listens Dashboard#RadioTriggerDestroyWidgetsByAttributes
     * @listens Dashboard#RadioRequestGetChildren
     * @listens Dashboard#RadioRequestWidgetById
     */
    initialize (attrs = {}) {
        const channel = Radio.channel("Dashboard");

        this.set("channel", channel);
        this.initDefaults(attrs);

        channel.on({
            "append": this.append,
            "destroyWidgetById": this.destroyWidgetById,
            "destroyWidgetsByAttributes": this.destroyWidgetsByAttributes
        }, this);

        channel.reply({
            "getChildren": this.getChildren,
            "getWidgetById": this.getWidgetById
        }, this);

        this.listenTo(this, {
            "change:rawDashboardWidget": function () {
                const newWidget = this.get("rawDashboardWidget");

                this.append(newWidget.child, newWidget.parent, newWidget.opts, true);
            }
        });
    },

    /**
     * sets the class properties by given attrs
     * @param {object} attrs the attributes specified in tools.js
     * @returns {void}
     */
    initDefaults (attrs) {
        for (const attr in attrs) {
            this.set(attr, attrs[attr]);
        }
    },

    /**
     * @description appends a new widget to the dashboard
     * @param {Backbone.View | object | string} child the child object to append
     * @param {string} parent the container-selector to append to, defaults to ".info-screen-children"
     * @param {object} opts appending options (optional)
     * @param {boolean} cullButtons remove buttons when appending html to InfoScreen, defaults to false (optional)
     * @returns {void}
     */
    append (child, parent = ".info-screen-children", opts, cullButtons = false) {
        var _child = child;
        const _opts = opts ? this.assignId(opts) : this.assignId({});

        // send Widget to InfoScreen if infoScreenOpen
        if (Radio.request("InfoScreen", "getIsWindowOpen")) {
            window.localStorage.setItem("rawDashboardWidget", JSON.stringify({
                child: this.convertChildToHtml(_child),
                parent,
                opts
            }));
        }

        // remove Buttons on transfer via localStorage
        if (cullButtons) {
            _child = $(_child);
            _child.find("button").remove();
        }

        this.getChildren().push(new DashboardWidgetView(_child, parent, _opts));
        this.pushId(_opts.id);
    },

    /**
     * assigns an automatic ID to the new widget, if not provided, or increments it if exists
     * @param {object} opts the original appending options
     * @returns {object} the options object
     */
    assignId (opts) {
        if (opts.id && typeof opts.id === "string") {
            opts.id = opts.id.trim();
        }
        if (this.get("ids").includes(opts.id) || !opts.id) {
            opts.id = Math.max(this.get("ids").filter(id => !isNaN(id))) + 1;
        }
        return opts;
    },

    /**
     * removes a widget from the dashboard by ID
     * @param {string} id the ID of the widget to remove
     * @returns {void}
     */
    destroyWidgetById (id) {
        this.set("children", this.getChildren().filter(v => {
            if (v.attrs.id === id) {
                v.remove();
                this.removeId(id);
                return false;
            }
            return true;
        }, this));
    },

    /**
     * removes widgets from the dashboard by specific attributes
     * @param {object} attrs the attributes to filter the widgets by
     * @returns {void}
     */
    destroyWidgetsByAttributes (attrs) {
        this.set("children", this.getChildren.filter(v => {
            for (const prop in attrs) {
                if (v.attrs[prop] === attrs[prop]) {
                    v.remove();
                    this.removeId(v.attrs.id);
                    return false;
                }
            }
            return true;
        }, this));
    },

    /**
     * returns the active widgets
     * @returns {Backbone.View[]} the active widget views
     */
    getChildren () {
        return this.get("children");
    },

    /**
     * returns a widget by ID
     * @param {string} id the ID of the widget to return
     * @returns {Backbone.View} the view of the retrieved widget
     */
    getWidgetById (id) {
        return this.getChildren().find(v => v.attrs.id === id);
    },

    /**
     * returns widgets that share given attributes
     * @param {object} attrs the attributes to filter by
     * @returns {Backbone.View[]} the views of the matching widgets
     */
    getChildrenByAttributes (attrs) {
        return this.getChildren().filter(v => {
            let match = true;

            for (const prop in attrs) {
                if (v[prop] !== attrs[prop]) {
                    match = false;
                    break;
                }
            }
            return match;
        });
    },

    /**
     * returns widgets by IDs
     * @param {string[]} ids the IDs of the widgets to return
     * @returns {Backbone.View[]} the views of the retrieved widgets
     */
    getChildrenByIds (ids) {
        return this.getChildren().filter(v => ids.includes(v.attrs.id));
    },

    /**
     * get the IDs Array of all widgets
     * @returns {string[]} the IDs array
     */
    getIds () {
        return this.get("ids");
    },

    /**
     * adds an ID to the IDs array
     * @param {string} id the ID to push
     * @returns {void}
     */
    pushId (id) {
        this.getIds().push(id);
    },

    /**
     * removes an ID from the IDs array
     * @param {string} id the ID to remove
     * @returns {void}
     */
    removeId (id) {
        this.set("ids", this.getIds().filter(_id => _id !== id));
    },

    /**
     * converts a given child-object to plain HTML
     * @param {Backbone.View | $ | d3.selection} child the child to convert
     * @returns {string} the plain HTML-string
     */
    convertChildToHtml (child) {
        if (child instanceof Backbone.View) {
            return this.content.render().el;
        }
        else if (child instanceof $) {
            return child.html();
        }
        else if (child instanceof selection) {
            return child.node();
        }

        return child;
    }
});

export default DashboardWidgetHandler;
