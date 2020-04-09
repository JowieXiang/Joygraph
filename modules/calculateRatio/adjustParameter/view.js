import AdjustParameterModel from "./model";
import Template from "text-loader!./template.html";
import "bootstrap-select";
import "./style.less";

const AdjustParameterView = Backbone.View.extend(/** @lends AdjustParameterView.prototype */{
    events: {
        "change #parameter-select": "setModifier",
        "change #modifier-input": "setModifier",
        "change #operator-input": "setModifier",
        "click #help": "showInfo",
        "click #toggle-modifier": "toggleModifier"
    },

    /**
     * @class AdjustParameterView
     * @extends Backbone.View
     * @memberof Tools.CalculateRatio.AdjustParameter
     * @constructs
     * @param {string} layerId ID of the layer to modify
     * @param {string} infoText info text to display on btn click
     */
    initialize: function (layerId, infoText = null) {
        if (layerId) {
            this.model = new AdjustParameterModel(layerId, infoText);
        }
    },
    model: {},
    template: _.template(Template),
    className: "parameter-control-container",

    /**
     * renders the modifier view
     * @returns {Backbone.View} returns this
     */
    render: function () {
        var attrs = this.model.toJSON();

        attrs.isMS = window.detectMS();

        this.$el.html(this.template(attrs));
        this.delegateEvents();

        return this;
    },

    /**
     * toggle modifier on/off
     * @returns {void}
     */
    toggleModifier: function () {
        this.$el.find(".modifier").toggleClass("hidden");
        this.model.set("isModified", !this.model.get("isModified"));
    },

    /**
     * set modifier when an input field is changed
     * @returns {void}
     */
    setModifier: function () {
        const inputValue = parseFloat(this.$el.find("#modifier-input").val().replace(/[ ]*,[ ]*|[ ]+/g, ".")),
            modValue = this.$el.find("#operator").val() === "/" ? 1 / inputValue : inputValue;

        this.model.set("selectedOption", [
            this.$el.find("#parameter-select").val(),
            modValue
        ]);
    },

    /**
     * show info on btn click
     * @returns {void}
     */
    showInfo: function () {
        Radio.trigger("Alert", "alert", {
            text: `${this.model.get("infoText")}`,
            kategorie: "alert-info"
        });
    }
});

export default AdjustParameterView;
