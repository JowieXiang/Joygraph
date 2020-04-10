import template from "text-loader!./template.html";
import Model from "./model";
import SnippetDropdownView from "../../../../../modules/snippets/dropdown/view";

const DistrictSelectorView = Backbone.View.extend(/** @lends DistrictSelectorView.prototype */{

    /**
     * @class DistrictSelectorView
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.DistrictSelector
     * @constructs
     * @listens Tools.CompareDistricts.DistrictSelector#RadioRequestDistrictSelectorGetSelectedDistrict
     */
    initialize: function () {
        const channel = Radio.channel("DistrictSelector");

        channel.reply({
            "getSelectedDistrict": this.getSelectedDistrict
        }, this);
    },
    tagName: "div",
    // className: "form-group col-sm-4",
    template: _.template(template),

    /**
     * Render to DOM
     * @return {ReachabilityFromPointView} returns this
     */
    render: function () {
        this.model = new Model();
        this.$el.html(this.template(this.model.toJSON()));
        // this.$el.find("#district-selector").selectpicker("refresh");
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
     * returns selected reference district
     * @returns {void}
     */
    getSelectedDistrict: function () {
        return this.model.get("selectedDistrict");
    },

    /**
     * resets dropdown model and view
     * @returns {void}
     */
    resetDropDown: function () {
        this.model.get("dropDownModel").deselectValueModels();
        this.model.get("dropDownModel").setDisplayName(this.model.get("dropDownDisplayName"));
        this.model.get("dropDownModel").trigger("render");
    }
});

export default DistrictSelectorView;
