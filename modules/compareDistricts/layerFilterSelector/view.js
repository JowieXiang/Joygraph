import "./style.less";
import template from "text-loader!./template.html";
// import Model from "./model";
import SnippetDropdownView from "../../../../../modules/snippets/dropdown/view";

const LayerFilterSelectorView = Backbone.View.extend(/** @lends LayerFilterSelectorView.prototype */{
    /**
     * @class LayerFilterSelectorView
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.LayerFilterSelector
     * @constructs
     */
    events: {
        "change select": "setSelectedLayer"
    },
    tagName: "div",
    template: _.template(template),

    /**
     * Render to DOM
     * @return {LayerFilterView} returns this
     */
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.find("#layer-selection").selectpicker("refresh");
        this.renderDropDownView(this.model.get("dropDownModel"));
        return this;
    },

    /**
     * render dropdown view
     * @param {Object} dropdownModel dropdown model
     * @returns {void}
     */
    renderDropDownView: function (dropdownModel) {
        const dropdownView = new SnippetDropdownView({model: dropdownModel}),
            dropdownObj = dropdownView.render().el;

        this.$el.append(dropdownObj);
        this.$el.find("#dropdown-container").addClass("form-control input-sm");
    },

    /**
     * sets selected layer
     * @param {Object} evt change select event
     * @returns {void}
     */
    setSelectedLayer: function (evt) {
        this.model.setSelectedLayer(evt.target.value);
    },

    /**
     * clears selectedLayer
     * @returns {void}
     */
    clearSelectedLayer: function () {
        this.model.set("selectedLayer", null);
    },

    /**
     * gets selectedLayer value
     * @returns {void}
     */
    getSelectedLayer: function () {
        return this.model.getSelectedLayer();
    },

    /**
     * gets layerOptions value
     * @returns {void}
     */
    getLayerOptions: function () {
        return this.model.getLayerOptions();
    },

    /**
     * sets layerOptions value
     * @param {Array} options layer options
     * @returns {void}
     */
    setLayerOptions: function (options) {
        this.model.setLayerOptions(options);
    },

    /**
     * resets dropdown model and view
     * @returns {void}
     */
    resetDropDown: function () {
        this.model.get("dropDownModel").deselectValueModels();
        this.model.get("dropDownModel").setDisplayName(this.model.get("dropDownDisplayName"));
        this.model.get("dropDownModel").trigger("render");
        this.model.set("selectedLayer", null);
    }
});

export default LayerFilterSelectorView;
