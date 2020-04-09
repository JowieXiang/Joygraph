import DropdownModel from "../../../../../modules/snippets/dropdown/model";
import {getLayerList, getLayerWhere} from "masterportalAPI/src/rawLayerList";

const LayerFilterSelectorModel = Backbone.Model.extend(/** @lends LayerFilterSelectorModel.prototype */{
    defaults: {
        layerOptions: [], // all select options (vector layers in the map) e.g. [{layerName:"",layerId:""},...]
        selectedLayer: null, // selected option e.g. {layerName:"",layerId:""}
        urls: {
            "statgebiet": "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test",
            "stadtteile": "https://geodienste.hamburg.de/Test_HH_WFS_hamburg_statistik_stadtteile"
        },
        dropDownModel: {},
        dropDownDisplayName: "Auswahl statistische Daten"
    },

    /**
     * @class LayerFilterSelectorModel
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.LayerFilterSelector
     * @constructs
     * @property {Array} layerOptions list of layer filter options
     * @property {string} selectedDistrict="Leeren" selected districtname
     * @property {object} urls={"statgebiet": "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test", "stadtteile": ""} mapping of district scopes and urls
     * @property {object} dropDownModel dropdown menu model
     * @property {String} dropDownDisplayName="Auswahl statistische Daten"
     * @fires FeaturesLoader#RadioRequestFeaturesLoaderGetAllValuesByScope
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetSelector
     * @listens DropdownModel#ValuesChanged
     */
    initialize: function () {
        const currentSelector = Radio.request("SelectDistrict", "getSelector"),
            layers = getLayerList().filter(function (layer) {
                return layer.url === this.get("urls")[currentSelector];
            }, this),
            layerOptions = layers.map(layer => {
                return {
                    "layerName": layer.name, "layerId": layer.id
                };
            });

        this.setLayerOptions(layerOptions);
        this.setDropDownModel(Radio.request("FeaturesLoader", "getAllValuesByScope", currentSelector));
        this.listenTo(Radio.channel("FeaturesLoader"), {
            "districtsLoaded": function () {
                this.updateDropDownModel(Radio.request("FeaturesLoader", "getAllValuesByScope", currentSelector));
            }
        }, this);
    },

    /**
      * sets the selection list for the layer filters
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
            isGrouped: true,
            displayName: this.get("dropDownDisplayName"),
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
     * @returns {void}
     */
    dropDownCallback: function (valueModel, isSelected) {
        if (isSelected) {
            this.setSelectedLayer(valueModel.get("value"));
        }
    },

    /**
     * sets selectedLayer value (not stable)
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetScope
     * @param {String} value selected option
     * @returns {void}
     */
    setSelectedLayer: function (value) {
        /**
         * This is not stable. better add fields in the mapping.json to avoid hard-coding!
         */
        const mappingObj = this.get("dropDownModel").attributes.values.filter(item => item.value === value)[0],
            layerModel = Radio.request("SelectDistrict", "getScope") === "Stadtteile" ?
                getLayerWhere({featureType: "v_hh_stadtteil_" + mappingObj.category.toLowerCase()}) :
                getLayerWhere({featureType: "v_hh_statistik_" + mappingObj.category.toLowerCase()});

        this.set("selectedLayer", {layerName: layerModel.name, layerId: layerModel.id, layerText: mappingObj});
    },

    /**
     * sets layerOptions value
     * @param {Array} value array of options
     * @returns {void}
     */
    setLayerOptions: function (value) {
        this.set("layerOptions", value);
    },

    /**
     * gets selectedLayer value
     * @returns {void}
     */
    getSelectedLayer: function () {
        return this.get("selectedLayer");
    },

    /**
     * gets layerOptions value
     * @returns {void}
     */
    getLayerOptions: function () {
        return this.get("layerOptions");
    }
});

export default LayerFilterSelectorModel;
