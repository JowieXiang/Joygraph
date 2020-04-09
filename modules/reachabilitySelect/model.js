import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";

const SelectModel = Tool.extend(/** @lends SelectModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        dropDownModel: {},
        modes: ["Erreichbarkeit ab einem Referenzpunkt", "Erreichbarkeit im Gebiet"]
    }),

    /**
    * @class SelectModel
    * @extends Tool
    * @memberof Tools.Reachability
    * @constructs
    * @property {object} dropDownModel dropdown menu model
    * @property {Array} modes=["Erreichbarkeit ab einem Referenzpunkt", "Erreichbarkeit im Gebiet"] two modes of this function
    * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
    * @listens DropdownModel#ValuesChanged
    */
    initialize: function () {
        this.superInitialize();
    },
    /**
     * sets the dropdown menu for function selection. User can select between 'reachabilityInArea' and 'reachabilityFromPoint'.
     * @listens DropdownModel#ValuesChanged
     * @returns {void}
     */
    setDropDownModel: function () {
        const dropdownModel = new DropdownModel({
            name: "Thema",
            type: "string",
            values: this.get("modes"),
            snippetType: "dropdown",
            isMultiple: false,
            isGrouped: false,
            displayName: "",
            liveSearch: false,
            isDropup: false
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.functionSelected
        }, this);
        this.set("dropDownModel", dropdownModel);
    },

    /**
     * sets selected function active
     * @param {Object} valueModel dropdown menu valueModel
     * @param {boolean} isSelected if dropdown menu has selection
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    functionSelected: function (valueModel, isSelected) {
        Radio.request("ModelList", "getModelByAttributes", {name: valueModel.get("value")}).set("isActive", isSelected);
    }
});

export default SelectModel;
