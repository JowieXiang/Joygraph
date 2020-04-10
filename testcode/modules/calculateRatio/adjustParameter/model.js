import SnippetModel from "../../../../../modules/snippets/model";

const AdjustParameterModel = SnippetModel.extend(/** @lends AdjustParameterModel.prototype */{
    defaults: {
        layerName: "",
        layer: {},
        numericalValues: [],
        defaultOption: "Anzahl",
        selectedOption: [],
        initValue: 1.00,
        step: 0.05,
        infoText: "Der eingegebene Wert entspricht keinem offiziellen, rechtlich bindenden Schlüssel, sonder dient rein der explorativen Analyse"
    },

    /**
     * @class AdjustParameterModel
     * @extends SnippetModel
     * @memberof Tools.CalculateRatio.AdjustParameter
     * @constructs
     * @param {string} layerId ID of the layer to modify
     * @param {string} infoText info text to display on btn click
     */
    initialize: function (layerId, infoText) {
        const opts = this.getProperties(layerId);

        this.superInitialize();
        this.set({
            "layerName": opts.layerName,
            "layerId": layerId,
            "layer": opts.layer,
            "numericalValues": opts.numericalValues,
            "defaultOption": opts.defaultOption,
            "selectedOption": [opts.defaultOption, 1.00],
            "infoText": infoText ? infoText : this.get("infoText"),
            "isModified": false
        });
    },

    /**
     * gets valid properties to select for layer from config or autodetect numerical values
     * @param {*} layerId ID of the layer to modify
     * @returns {object} modifier object for options
     */
    getProperties: function (layerId) {
        const layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId});
        let properties,
            propObj;

        if (typeof layer.get("numericalProperties") !== "undefined") {
            if (!layer.get("numericalProperties")) {
                properties = [];
            }
            else {
                properties = layer.get("numericalProperties").filter(prop => prop !== layer.get("defaultProperty"));
            }
        }
        else if (layer.get("layerSource").getFeatures()) {
            propObj = layer.get("layerSource").getFeatures()[0].getProperties();

            for (const prop in propObj) {
                if (isNaN(parseFloat(propObj[prop]))) {
                    delete propObj[prop];
                }
            }
            properties = _.allKeys(propObj);
        }

        return {
            layerName: layer.get("name"),
            layer: layer,
            defaultOption: layer.get("defaultProperty") || "Anzahl",
            numericalValues: properties
        };
    },

    /**
     * all numerical, modifiable properties on layer
     * @returns {string[]} list of numerical values
     */
    getNumericalValues: function () {
        return this.get("numericalValues");
    },

    /**
     * get the currently selected option
     * @returns {object} the selected option incl. modifiers
     */
    getSelectedOption: function () {
        return this.get("selectedOption");
    }
});

export default AdjustParameterModel;
