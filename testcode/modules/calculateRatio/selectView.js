import Template from "text-loader!./selectTemplate.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";
import ResultView from "./resultView";
import InfoTemplate from "text-loader!./info.html";
import "./style.less";

const SelectView = Backbone.View.extend(/** @lends SelectView.prototype */{
    events: {
        "click #submit": "calculateRatios",
        "change #resolution-input": "setResolution",
        "click .tool-info #help": "showInfo",
        "click #clear": "clearResult",
        "click #help-resolution": "showInfoResolution"
    },

    /**
     * @class SelectView
     * @extends Backbone.View
     * @memberof Tools.CalculateRatio
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "renderResult": this.renderResult,
            "renderFacilityDropDown": this.renderFacilityDropDown,
            "renderResults": this.renderResult,
            "change:adjustParameterView": this.renderModifiers,
            "change:numerators": this.updateTexts,
            "change:denominators": this.updateTexts
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    id: "verhältnisse-berechnen-tool",
    template: _.template(Template),
    numDropdownView: {},
    denDropdownView: {},

    /**
     * render the selectView and append Dropdown Views
     * @param {Backbone.Model} model the model to render
     * @param {boolean} value the active state
     * @returns {Backbone.View} returns this
     */
    render: function (model, value) {
        const attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.denDropdownView = new SnippetDropdownView({model: this.model.get("denDropdownModel")});
            this.$el.find(".denDropdown").append(this.denDropdownView.render().el);
            this.renderFacilityDropDown();

            this.updateTexts();
            this.renderModifiers();

            if (this.resultView) {
                this.renderResult();
            }
        }

        return this;
    },

    /**
     * render the facility dropdown according to active layers
     * @returns {void}
     */
    renderFacilityDropDown: function () {
        this.$el.find(".numDropdown .dropdown-container").remove();
        this.numDropdownView = new SnippetDropdownView({model: this.model.get("numDropdownModel")});
        this.$el.find(".numDropdown").append(this.numDropdownView.render().el);
    },

    /**
     * render the result view
     * @returns {void}
     */
    renderResult: function () {
        this.$el.find(".result").html("");
        this.resultView = new ResultView({model: this.model});
        this.$el.find(".result").append(this.resultView.render(false).el);
    },

    /**
     * render the modifiers for each selected facility type
     * @returns {void}
     */
    renderModifiers: function () {
        if (this.model.get("adjustParameterView").model) {
            this.$el.find(".modifiers").html(this.model.get("adjustParameterView").render().el);
        }
    },

    /**
     * update all texts according to selected values
     * @returns {void}
     */
    updateTexts: function () {
        if (this.model.get("denominators").values.length === 0) {
            $("#resolution-input-container").addClass("hidden");
        }
        else {
            $("#resolution-input-container").removeClass("hidden").find("#den-name").text(this.model.get("denominators").values.join(", "));
            $(".denDropdown .filter-option").text(this.model.get("denominators").values[0]);
        }

        if (this.model.get("numDropdownModel").get("values").length > 0) {
            $("#facilities-info").hide();
        }
    },

    /**
     * trigger the calculation on model
     * @returns {void}
     */
    calculateRatios: function () {
        this.model.getRatiosForSelectedFeatures();
    },

    /**
     * set the resolution (facility / n * people) for the calculation
     * @param {*} evt the DOM event from the input field
     * @returns {void}
     */
    setResolution: function (evt) {
        if (!evt.target.value || evt.target.value === "0") {
            evt.target.value = 1;
        }

        this.model.set("resolution", parseInt(evt.target.value, 10));
    },

    /**
     * show the Infobox for the tool
     * @returns {void}
     */
    showInfo: function () {
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info",
            position: "center-center"
        });
    },

    /**
     * show the Infobox for the resolution setter
     * @returns {void}
     */
    showInfoResolution: function () {
        Radio.trigger("Alert", "alert", {
            text: "<h4>Maßstab:</h4>" +
                "<p>Legen Sie hier fest in welchem <strong>Maßstab</strong> die Versorgungsabdeckung ermittelt werden soll:<br />" +
                "So wird z.B. unter Umständen nur 1 Sportstätte für ca. 1000 EW benötigt. <br />" +
                "Bei einem Wert von 2 Sportstätten und 2500 EW im Gebiet ergäbe sich damit eine Abdeckung von 80%.</p>",
            kategorie: "alert-info"
        });
    },

    /**
     * delete result and polygon styles in map
     * @fires ColorCodeMap#RadioTriggerReset
     * @returns {void}
     */
    clearResult: function () {
        this.resultView.remove();
        this.model.resetResults();
        Radio.trigger("ColorCodeMap", "reset");
    }
});

export default SelectView;
