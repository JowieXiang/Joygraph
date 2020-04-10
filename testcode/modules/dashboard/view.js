import Template from "text-loader!./template.html";
import InfoTemplate from "text-loader!./info.html";
import "./style.less";

const DashboardView = Backbone.View.extend(/** @lends DashboardView.prototype */{
    events: {
        "click .close": "close",
        "click #help": "showHelp",
        "click #reset-button": "resetWidgets"
    },

    /**
     * initializes the dashboards View, adds event listeners and handles the Dashboard on the InfoScreen
     * @class DashboardView
     * @extends Backbone.View
     * @memberof Tools.Dashboard
     * @constructs
     * @listens General#RadioTriggerLoaded
     */
    initialize: function () {
        // Export Button für das Dashboard wieder hinzufügen, sobald eine Lösung gefunden wurde
        // this.exportButtonView = new ExportButtonView({model: this.model.get("exportDashboardButton")});

        this.listenTo(this.model, {
            "change:isActive": function (model, isActive) {
                if (isActive & !this.model.get("infoScreenOpen")) {
                    if (Radio.request("InfoScreen", "getIsInfoScreen")) {
                        if (Radio.request("SelectDistrict", "getSelectedDistricts").length === 0) {
                            Radio.trigger("Alert", "alert", {
                                text: "<strong>Warnung: Sie haben noch keine Gebiete ausgewählt.</strong>" +
                                    "<br />Daher werden im Dashboard keine statistischen Daten angezeigt. Sie können dennoch Ergebnisse aus anderen Werkzeugen im Dashboard anzeigen lassen.",
                                kategorie: "alert-warning",
                                position: "top-center"
                            });
                        }
                    }
                    this.render();
                }
                else {
                    this.$el.remove();
                    Radio.trigger("Sidebar", "toggle", false);
                }
            }
        });

        if (this.model.get("isActive") === true) {
            this.render();
        }

        this.listenTo(Radio.channel("General"), {
            "loaded": function () {
                if (Radio.request("InfoScreen", "getIsInfoScreen")) {
                    setTimeout(() => {
                        Radio.request("Dashboard", "getChildren").forEach(widget => {
                            widget.render();
                        });
                    }, 2000);
                }
            }
        }, this);

        this.listenTo(Radio.channel("Sidebar"), "updated", this.checkSidebarState);
    },
    id: "dashboard-view",
    className: "dashboard",
    model: {},
    exportButtonView: {},
    filterDropdownView: {},
    template: _.template(Template),
    isDragging: false,
    startX: 0,

    /**
     * append the dashboard to the Sidebar
     * @fires Dashboard#RadioTriggerDashboardOpen
     * @returns {Backbone.View} returns this
     */
    render: async function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        // Export Button für das Dashboard wieder hinzufügen, sobald eine Lösung gefunden wurde
        // this.$el.find("#print-button").html(this.exportButtonView.render().el);

        Radio.trigger("Sidebar", "append", this.$el, true);
        Radio.trigger("Sidebar", "toggle", true, this.model.get("width"));

        Radio.request("Dashboard", "getChildren").forEach(widget => {
            widget.render();
        });

        this.delegateEvents();
        Radio.trigger("Dashboard", "dashboardOpen");

        return this;
    },

    /**
     * closes the Dashboard / Sidebar
     * @returns {void}
     */
    close: function () {
        this.model.setIsActive(false);
        Radio.trigger("ModelList", "toggleDefaultTool");
    },

    /**
     * opens the help window
     * @fires Alert#RadioTriggerAlert
     * @returns {void}
     */
    showHelp: function () {
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info",
            position: "center-center"
        });
    },

    /**
     * removes all widgets on the dashboard apart from the table
     * @fires Dashboard#RadioRequestGetChildren
     * @returns {void}
     */
    resetWidgets () {
        Radio.request("Dashboard", "getChildren").forEach(widget => {
            if (widget.getId() !== "dashboard") {
                widget.removeWidget();
            }
        });
    },

    /**
     * checks if another module is opened to the sidebar
     * @param {string} className the element className active on sidebar
     * @returns {void}
     */
    checkSidebarState: function (className) {
        if (this.className !== className) {
            this.close();
        }
    }
});

export default DashboardView;
