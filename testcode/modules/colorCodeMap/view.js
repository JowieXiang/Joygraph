import "./style.less";
import template from "text-loader!./template.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";
import InfoTemplate from "text-loader!./info.html";

const ColorCodeMapView = Backbone.View.extend(/** @lends ColorCodeMapView.prototype */{
    events: {
        "click .btn-reset": function () {
            this.reset();
        },
        "click .btn-prev-next": "prevNext",
        "click #legend-help": "showHelp"
    },
    /**
     * @class ColorCodeMapView
     * @extends Backbone.Model
     * @memberof ColorCodeMap
     * @constructs
     */
    initialize: function () {
        this.listenTo(this.model, {
            "resetView": this.reset,
            "setLegend": this.setLegend,
            "change:dropDownModel": this.renderDropDownView
        });

        this.listenTo(Radio.channel("SelectDistrict"), {
            "selectionChanged": this.checkDistrictSelection
        });

        this.render();
    },
    template: _.template(template),
    render: function () {
        $(".masterportal-container").append(this.$el.html(this.template()));
        this.renderDropDownView(this.model.get("dropDownModel"));
        this.$el.find("button").prop("disabled", true);
        this.setLengendEmpty();
        return this;
    },
    renderDropDownView: function (dropdownModel) {
        const dropdownView = new SnippetDropdownView({model: dropdownModel});

        this.$el.find(".color-code").prepend(dropdownView.render().el);
    },

    setLengendEmpty: function () {
        this.$el.find("#color-code-legend").empty();
        for (let i = 0; i < 5; i++) {
            this.$el.find("#color-code-legend").append(`
            <li style="display:inline;">
                <svg width="20" height="20">
                    <circle cx="10" cy="10" r="10" style="fill:rgb(255, 255, 255);stroke-width: .5; stroke: #E3E3E3;" />
                </svg>
                    <span style="font-size: 20px;">  - </span>
            </li>
            `);
        }
    },
    setLegend: function (data) {
        this.$el.find("#color-code-legend").empty();
        if (data !== null) {
            for (let i = 0; i < data.values.length; i++) {
                this.$el.find("#color-code-legend").append(`
                <li style="display:inline;">
                    <svg width="20" height="20">
                        <circle cx="10" cy="10" r="10" style="fill:${data.colors[i]};stroke-width: .5; stroke: #E3E3E3; opacity: 0.8" />
                    </svg>
                        <span style="font-size: 20px;">${Number.isInteger(data.values[i]) ? data.values[i].toLocaleString("de-DE") : data.values[i].toLocaleString("de-DE")}</span>
                </li>
                `);
            }
        }
    },
    prevNext: function (evt) {
        const options = this.$el.find(".selectpicker option"),
            direction = $(evt.target).attr("title") === "next" ? 1 : -1,
            currentIndex = this.$el.find(".selectpicker").get(0).selectedIndex;
        let newIndex = currentIndex + direction === 0 ? currentIndex + direction * 2 : currentIndex + direction;

        if (newIndex >= options.length) {
            newIndex = 1;
        }
        else if (newIndex <= 0) {
            newIndex = options.length - 1;
        }

        options.prop("selected", false);
        options.get(newIndex).setAttribute("selected", true);
        this.setDropdownValues(newIndex, options.get(newIndex).value);
    },
    setDropdownValues: function (index, value) {
        this.$el.find(".selectpicker").get(0).selectedIndex = index;
        this.$el.find(".dropdown-toggle span.filter-option").text(value);
        this.model.get("dropDownModel").updateSelectedValues(value);
    },

    /**
     * adds the 'bs-placeholder' class to the dropdown,
     * sets the placeholder text
     * @returns {void}
     */
    reset: function () {
        this.$el.find(".dropdown-toggle").addClass("bs-placeholder");
        this.setDropdownValues(0, "Statistische Daten anzeigen");
        this.setLengendEmpty();
        if (this.model.get("districtFeatures").length === 0) {
            this.$el.find("button").prop("disabled", true);
        }
        else {
            this.model.unStyleDistrictFeatures(this.model.get("districtFeatures"));
        }
    },

    checkDistrictSelection: function (extent) {
        if (extent.length > 0) {
            this.$el.find("button").prop("disabled", false);
        }
        else {
            this.$el.find("button").prop("disabled", true);
        }
    },
    showHelp: function () {
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info",
            position: "top-center"
        });
    }
});

export default ColorCodeMapView;
