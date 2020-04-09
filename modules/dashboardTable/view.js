import Template from "text-loader!./template.html";
import TableTemplate from "text-loader!./tableTemplate.html";
import ContextActions from "text-loader!./contextActions.html";
import "./style.less";
import DropdownView from "../../../../modules/snippets/dropdown/view";
import ExportButtonView from "../../../../modules/snippets/exportButton/view";

const DashboardTableView = Backbone.View.extend(/** @lends DashboardTableView.prototype */ {
    events: {
        "click .district": "zoomToFeature",
        "pointerup tr.has-context": "contextMenuTable",
        "click .select-row": "checkboxSelectRow",
        "click .prop button.open": "toggleTimelineTable",
        "click thead button.open": "toggleGroup",
        "click .btn-reset": "resetDropDown",
        "click .toggle-col": "toggleCol",
        "click .move span": "moveCol"
    },

    /**
     * initialize the dashboardTableView
     * add utility buttons and dropdown menus
     * @class DashboardTableView
     * @extends Backbone.View
     * @memberof Tools.Dashboard
     * @constructs
     * @returns {void}
     */
    initialize: function () {
        this.exportButtonView = new ExportButtonView({model: this.model.get("exportButtonModel")});
        this.exportFilteredButtonView = new ExportButtonView({model: this.model.get("exportFilteredButtonModel")});
        this.filterDropdownView = new DropdownView({model: this.model.get("filterDropdownModel")});
        this.contextActionsEl = $(this.contextActions());
        this.updateRatioSelection();

        this.listenTo(this.model, {
            "isReady": this.render,
            "ratioValuesUpdated": this.updateRatioSelection,
            "filterUpdated": this.renderFilter
        });

        // workaround for IE
        this.listenTo(Radio.channel("Dashboard"), {
            "dashboardClose": this.storeEl
        });
    },
    id: "dashboard-table",
    className: "dashboard-table",
    model: {},
    exportButtonView: {},
    exportFilteredButtonView: {},
    filterDropdownView: {},
    template: _.template(Template),
    tableTemplate: _.template(TableTemplate),
    contextActions: _.template(ContextActions),
    contextActionsEl: {},
    elBackup: null,

    /**
     * @description renders the dashboardTable
     * appends it to the dashboard widgets if not exists, or updates it
     * delegates events to the widget
     * @returns {Backbone.View} returns this
     */
    render: async function () {
        var attr = this.model.toJSON();

        if (!Radio.request("InfoScreen", "getIsWindowOpen") || Radio.request("InfoScreen", "getIsInfoScreen")) {
            if (!Radio.request("Dashboard", "getWidgetById", "dashboard") && Radio.request("Dashboard", "dashboardOpen")) {
                this.$el.html(this.template(attr));
                this.$el.find(".filter-dropdown").html(this.filterDropdownView.render().$el);

                Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
                    id: "dashboard",
                    name: "Übersicht",
                    glyphicon: "glyphicon-stats",
                    append: false,
                    width: "100%",
                    noPrint: true
                });
            }
            // fill in the old element if exists on IE
            else if (window.detectMS() && window.detectMS() <= 11) {
                if (this.elBackup) {
                    this.$el.html(this.elBackup);
                }
            }

            this.$el.find(".table").html(this.tableTemplate(attr));
            this.renderExport();

            // reset the collapsed columns
            this.model.set("inactiveColumns", []);
        }

        this.delegateEvents();

        return this;
    },

    /**
     * renders the export button incl. EventListeners
     * @returns {void}
     */
    renderExport () {
        this.$el.find("#export-button").html(this.exportButtonView.render().el);
        this.$el.find("#export-button-filtered").html(this.exportFilteredButtonView.render().el);
    },

    /**
     * renders the filter Dropdown
     * @returns {void}
     */
    renderFilter () {
        this.filterDropdownView.render();
    },

    /**
     * updates the view with the currently selected attribute names from the table
     * @returns {$} JQuery-Selection
     */
    updateRatioSelection () {
        var selectionText = this.$el.find("span#row-selection");

        if (this.model.getAttrsForRatio().length === 0) {
            this.contextActionsEl.find("li#selection span.selected").empty();
            this.contextActionsEl.find("li.calculate").addClass("inactive");
            return selectionText.empty();
        }

        if (this.model.getAttrsForRatio().length >= 2) {
            this.contextActionsEl.find("li.calculate").removeClass("inactive");
        }

        this.contextActionsEl.find("li#selection span.selected").html("<br />(" + this.model.getAttrsForRatio().join(" / ") + ")");
        return selectionText.html(`<strong>Auswahl:</strong> ${this.model.getAttrsForRatio()[0] ? this.model.getAttrsForRatio()[0] + " (y)" : ""}${this.model.getAttrsForRatio()[1] ? " / " + this.model.getAttrsForRatio()[1] + " (x)" : ""}`);
    },

    /**
     * Triggers the zoomToDistrict method on the selectDistrict Module
     * @param {*} event the DOM event with the target name
     * @fires SelectDistrict#Radio.TriggerZoomToDistrict
     * @returns {void}
     */
    zoomToFeature (event) {
        const districtName = event.target.innerHTML;

        if (Radio.request("InfoScreen", "getIsInfoScreen")) {
            Radio.trigger("InfoScreen", "triggerRemote", "SelectDistrict", "zoomToDistrict", districtName);
        }
        else {
            Radio.trigger("SelectDistrict", "zoomToDistrict", districtName);
        }
    },

    /**
     * toggles the timelineTable for a dataset open/closed
     * @param {*} event the click event
     * @returns {void}
     */
    toggleTimelineTable: function (event) {
        event.stopPropagation();
        this.$(event.target).parent(".prop").parent("tr").toggleClass("open");
    },

    /**
     * toggles a table group open/closed
     * @param {*} event the click event
     * @returns {void}
     */
    toggleGroup: function (event) {
        event.stopPropagation();
        const group = this.$(event.target).closest("thead").attr("id");

        this.$el.find(`tbody#${group}`).toggleClass("open");
    },

    /**
     * toggles a table column open/closed
     * adds the column index to the inactiveColumns Array on model to exclude it from calculations
     * @param {*} event the click event
     * @returns {void}
     */
    toggleCol: function (event) {
        event.stopPropagation();

        const cellIndex = event.target.parentNode.cellIndex;

        if (this.model.get("inactiveColumns").includes(cellIndex - 2)) {
            this.model.set("inactiveColumns", this.model.get("inactiveColumns").filter(i => i !== cellIndex - 2));
        }
        else {
            this.model.get("inactiveColumns").push(cellIndex - 2);
        }

        this.$el.find("tr").each(function (index, row) {
            $(row.children[cellIndex]).toggleClass("minimized");
        });
    },

    /**
     * triggers the reordering of table columns by index and direction
     * @param {Event} event the click event
     * @returns {void}
     */
    moveCol: function (event) {
        const cellIndex = event.target.parentNode.parentNode.cellIndex - 2,
            direction = event.target.className.includes("move-left") ? 0 : 1;

        this.model.changeTableOrder(cellIndex, direction);
    },

    /**
     * adds the 'bs-placeholder' class to the dropdown,
     * sets the placeholder text and unstyle the district features
     * @returns {void}
     */
    resetDropDown: function () {
        this.model.get("filterDropdownModel").updateSelectedValues([]);
        this.$el.find(".filter-dropdown ul.dropdown-menu > li").removeClass("selected");
    },

    /**
     * sets the contextMenu HTML and handles actions
     * @param {*} event the mouseup event on the table
     * @fires ContextMenu#RadioTriggerSetActions
     * @returns {void}
     */
    contextMenuTable: function (event) {
        // return if the checkbox is clicked
        if (event.target.className === "select-row") {
            return;
        }
        const row = this.$(event.target).closest("tr"),
            contextActions = this.contextActionsEl;

        // only change selection on right click, if not more than one item is selected
        if (!(event.button === 2 && this.model.get("selectedAttrsForCharts").length > 1)) {
            this.selectRow(event, row);
        }

        // Create Bar Chart
        $(contextActions).find("li#barChart #input-year button").on("click", function () {
            this.model.createBarChart($(contextActions).find("li#barChart #input-year input").val());
        }.bind(this));

        // Create unscaled Line Chart
        $(contextActions).find("li#lineChart #unscaled").on("click", function () {
            this.model.createLineChart([row.find("th.prop").attr("id")], row.find("th.prop").text());
        }.bind(this));

        // Create scaled Line Chart
        $(contextActions).find("li#lineChart #scaled").on("click", function () {
            this.model.createLineChart([row.find("th.prop").attr("id")], row.find("th.prop").text(), true);
        }.bind(this));

        // Create Timeline
        $(contextActions).find("li#timeline").on("click", function () {
            Radio.trigger("Dashboard", "destroyWidgetById", "time-slider");
            Radio.trigger("TimeSlider", "create", row.find("th.prop").text());
        });

        // Delete Selection
        $(contextActions).find("li#delete-selection").on("click", function () {
            this.model.deleteAttrsForRatio();
        }.bind(this));

        // Create new ratio data
        // Add numerator
        $(contextActions).find("li#numerator").on("click", function () {
            this.model.addAttrForRatio(row.find("th.prop").attr("id"), 0);
        }.bind(this));

        // Add denominator
        $(contextActions).find("li#denominator").on("click", function () {
            this.model.addAttrForRatio(row.find("th.prop").attr("id"), 1);
        }.bind(this));

        // Create unscaled Correlation
        $(contextActions).find("li#correlation #unscaled").on("click", function () {
            this.model.createCorrelation(false);
            this.model.deleteAttrsForRatio();
        }.bind(this));

        // Create scaled Correlation
        $(contextActions).find("li#correlation #scaled").on("click", function () {
            this.model.createCorrelation(true);
            this.model.deleteAttrsForRatio();
        }.bind(this));

        // Create new Data Row
        $(contextActions).find("li#ratio").on("click", function () {
            this.model.createRatio();
            this.model.deleteAttrsForRatio();
        }.bind(this));

        Radio.trigger("ContextMenu", "setActions", contextActions, row.find("th.prop").text(), "glyphicon-stats");

        // Set the current year for all inputs
        $(contextActions).find("li#barChart #input-year input").val(new Date().getFullYear() - 1);
    },

    /**
     * sets the row selection, or adds a row to existing selection, depending on the event
     * @param {*} event the DOM event
     * @param {string} _row (optional) the already parsed row name
     * @returns {void}
     */
    selectRow (event, _row) {
        const row = _row || this.$(event.target).closest("tr"),
            value = row.find("th.prop").attr("id");

        // Add row to selection if ctrl-Key is pressed, or remove it, if already selected
        if (event.ctrlKey) {
            if (this.model.get("selectedAttrsForCharts").includes(value)) {
                this.model.set("selectedAttrsForCharts", this.model.get("selectedAttrsForCharts").filter(val => val !== value));
                row.removeClass("selected");
                row.find(".select-row input").get(0).checked = false;
            }
            else {
                this.model.get("selectedAttrsForCharts").push(value);
                row.addClass("selected");
                row.find(".select-row input").get(0).checked = true;
            }
        }
        else {
            this.model.set("selectedAttrsForCharts", [value]);
            row.parent("tbody").parent("table").find("tr").removeClass("selected");
            row.parent("tbody").parent("table").find(".select-row input").prop("checked", false);
            row.addClass("selected");
            row.find(".select-row input").get(0).checked = true;
        }
    },

    /**
     * handles the selection of rows through the checkbox, triggers selectRow
     * @param {*} event the click event
     * @returns {void}
     */
    checkboxSelectRow (event) {
        event.stopPropagation();
        event.preventDefault();

        event.ctrlKey = true;

        this.selectRow(event);
    },

    /**
     * workaround for IE, storing the Element for later use
     * @returns {void}
     */
    storeEl () {
        const isMs = window.detectMS();

        if (isMs && isMs <= 11) {
            this.elBackup = this.$el.html();
        }
    }
});

export default DashboardTableView;
