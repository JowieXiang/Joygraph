import DropdownModel from "../../../../../modules/snippets/dropdown/model";

const DistrictSelectorModel = Backbone.Model.extend(/** @lends DistrictSelectorModel.prototype */{
    defaults: {
        districtNames: [], // all select options (vector layers in the map)
        selectedDistrict: "Leeren", // selected option
        dropDownModel: {},
        dropDownDisplayName: "Referenzgebiet"
    },

    /**
     * @class DistrictSelectorModel
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.DistrictSelector
     * @constructs
     * @property {Array} districtNames list of districtname options
     * @property {String} selectedDistrict="Leeren" selected districtname
     * @property {Object} dropDownModel dropdown menu model
     * @listens Tools.CompareDistricts#RadioTriggerCompareDistrictsSelectRefDistrict
     * @listens DropdownModel#ValuesChanged
     * @fires Tools.SelectDistrict#RadioRequestSelectDistrictGetSelector
     * @fires Tools.SelectDistrict#RadioRequestSelectDistrictGetSelectedDistricts
     * @fires Tools.SelectDistrict#RadioRequestSelectDistrictGetScope
     */
    initialize: function () {
        this.initializeDistrictNames();
    },
    initializeDistrictNames: function () {
        const selector = Radio.request("SelectDistrict", "getSelector");

        if (Radio.request("SelectDistrict", "getSelectedDistricts").length > 0) {
            const selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts"),
                districtNames = selectedDistricts.map(feature => feature.getProperties()[selector]);

            this.set("districtNames", districtNames);
            districtNames.unshift("Leeren");
            this.setDropDownModel(districtNames);
        }
        else {
            const scope = Radio.request("SelectDistrict", "getScope"),
                districts = Radio.request("ModelList", "getModelByAttributes", {name: scope}).get("layer").getSource().getFeatures(),
                districtNames = districts.map(district => district.getProperties()[selector]);

            this.set("districtNames", districtNames);
            districtNames.unshift("Leeren");
            this.setDropDownModel(districtNames);
        }
    },
    /**
      * sets the selection list for the time slider
      * @param {object[]} valueList - available values
      * @listens DropdownModel#ValuesChanged
      * @returns {void}
      */
    setDropDownModel: function (valueList) {
        const dropdownModel = new DropdownModel({
            name: "Thema",
            type: "string",
            values: valueList,
            snippetType: "dropdown",
            isMultiple: false,
            isGrouped: false,
            displayName: "Referenzgebiet",
            liveSearch: true
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.dropDownCallback
        }, this);
        this.set("dropDownModel", dropdownModel);
    },

    /**
     * updates values of dropdown model
     * @param {Array} valueList dropdown model valueList
     * @returns {void}
     */
    updateDropDownModel: function (valueList) {
        this.get("dropDownModel").set("values", valueList);
    },

    /**
     * callback function for the "valuesChanged" event in the dropdown model
     * sets the features based on the dropdown selection
     * @param {Backbone.Model} valueModel - the value model which was selected or deselected
     * @param {boolean} isSelected - flag if value model is selected or not
     * @listens Tools.CompareDistricts#RadioTriggerCompareDistrictsSelectRefDistrict
     * @returns {void}
     */
    dropDownCallback: function (valueModel, isSelected) {
        if (isSelected) {

            this.set("selectedDistrict", valueModel.get("value"));
            Radio.trigger("CompareDistricts", "selectRefDistrict");
        }
    }
});

export default DistrictSelectorModel;
