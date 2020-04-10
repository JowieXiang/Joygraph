import DropdownModel from "../../../../modules/snippets/dropdown/model";
import {Fill, Stroke, Style, Text} from "ol/style.js";

const LayerModel = Backbone.Model.extend(/** @lends LayerModel.prototype */{
    /**
     * @class LayerModel
     * @extends Backbone.Model
     * @memberof ColorCodeMap
     * @constructs
     * @property {object} dropDownModel ToDo
     * @property {Array} statisticsFeatures ToDo
     * @property {Array} districtFeatures ToDo
     */
    defaults: {
        dropDownModel: undefined,
        // the statistics features that have no geometry (Bevölkerung, Haushalte, Arbeitslose, ...)
        statisticsFeatures: [],
        // the district features with geometry (Stadtteil | Statistisches Gebiet)
        districtFeatures: []
    },
    initialize: function () {
        this.listenTo(Radio.channel("SelectDistrict"), {
            "reset": function () {
                this.reset();
                this.trigger("resetView");
            },
            "selectionChanged": function (districts) {
                this.setDropDownModel(Radio.request("FeaturesLoader", "getAllValuesByScope", Radio.request("SelectDistrict", "getSelector")));
                this.set("districtFeatures", districts);
            }
        });
        this.listenTo(Radio.channel("ColorCodeMap"), {
            "reset": function () {
                this.trigger("resetView");
            }
        });

        // load list initially for statgebiet and rerender on scope change
        this.setDropDownModel(Radio.request("FeaturesLoader", "getAllValuesByScope", "statgebiet"));
    },

    /**
     * sets the selection list for the time slider
     * @param {object[]} valueList - available values
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
            displayName: "Statistische Daten anzeigen",
            liveSearch: true,
            isDropup: true
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.dropDownCallback
        }, this);

        this.set("dropDownModel", dropdownModel);
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
            const scope = Radio.request("SelectDistrict", "getScope"),
                // the selected value in the dropdown
                value = valueModel.get("value"),
                statisticsFeatures = Radio.request("FeaturesLoader", "getDistrictsByValue", scope, value);

            this.setStatisticsFeatures(statisticsFeatures);
            this.styleDistrictFeatures(this.get("statisticsFeatures"), this.getLastYearAttribute(statisticsFeatures[0].getProperties()));
        }
    },

    // updateColorCodeMap: function () {
    //     const value = this.get("dropDownModel").getSelectedValues().values[0];

    //     if (value) {
    //         const scope = Radio.request("SelectDistrict", "getScope"),
    //             statisticsFeatures = Radio.request("FeaturesLoader", "getDistrictsByValue", scope, value);

    //         this.setStatisticsFeatures(statisticsFeatures);
    //         this.styleDistrictFeatures(statisticsFeatures, this.getLastYearAttribute(statisticsFeatures[0].getProperties()));
    //     }
    // },

    /**
     * finds the attribute key for the last avaiable year
     * @param {object} featureProperties - properties of a statistics feature
     * @returns {string} attribute key
     */
    getLastYearAttribute: function (featureProperties) {
        let lastYear = 0,
            attribute;

        Object.keys(featureProperties).forEach(key => {
            if (key.search("jahr_") !== -1) {
                const year = parseInt(key.split("_")[1], 10);

                if (year > lastYear) {
                    lastYear = year;
                    attribute = key;
                }
            }
        });

        return attribute;
    },

    /**
     * styles the equivalent district features (have a geometry) of the statistics features (have no geometry)
     * @param {ol.Features[]} features - the statistics features
     * @param {string} attribute - style is depending on this attribute
     * @returns {void}
     */
    styleDistrictFeatures: function (features, attribute) {
        const districtFeatures = Radio.request("SelectDistrict", "getSelectedDistricts"),
            selector = Radio.request("SelectDistrict", "getSelector"),
            foundDistrictFeatures = [],
            values = features.map(feature => feature.getProperties()[attribute]),
            colorScale = Radio.request("ColorScale", "getColorScaleByValues", values, "interpolateBlues");

        features.forEach(function (feature) {
            // find the equivalent district feature -> to do for stadtteile
            const foundFeature = districtFeatures.find(function (districtFeature) {
                return feature.get(selector) === districtFeature.get(selector);
            });

            foundFeature.setStyle(new Style({
                fill: new Fill({
                    color: this.getRgbArray(colorScale.scale(feature.getProperties()[attribute]), 0.8)
                }),
                stroke: new Stroke({
                    color: this.getRgbArray(colorScale.scale(feature.getProperties()[attribute])),
                    width: 3
                }),
                text: new Text({
                    font: "16px Calibri,sans-serif",
                    fill: new Fill({
                        color: [0, 0, 0]
                    }),
                    stroke: new Stroke({
                        color: [255, 255, 255],
                        width: 3
                    }),
                    text: feature.getProperties()[attribute] ? parseFloat(feature.getProperties()[attribute]).toLocaleString("de-DE") : "Keine Daten"
                })
            }));
            foundFeature.set("styleId", feature.getProperties()[attribute] ? parseInt(feature.getProperties()[attribute], 10) : "Keine Daten");
            foundDistrictFeatures.push(foundFeature);
        }, this);

        this.trigger("setLegend", colorScale.legend);
        this.set("districtFeatures", foundDistrictFeatures);
    },

    /**
     * gives the district features the default style
     * @param {Object[]} features - all styled district features
     * @returns {void}
     */
    unStyleDistrictFeatures: function (features) {
        features.forEach((feature) => {
            feature.unset("styleId");
            feature.setStyle(new Style({
                fill: new Fill({
                    color: "rgba(255, 255, 255, 0)"
                }),
                stroke: new Stroke({
                    color: "#3399CC",
                    width: 5
                })
            }));
        });
    },

    reset: function () {
        this.setStatisticsFeatures([]);
        this.set("districtFeatures", []);
    },

    /**
     * sets the statistics features
     * @param {ol.Feature[]} value - features
     * @returns {void}
     */
    setStatisticsFeatures: function (value) {
        this.set("statisticsFeatures", value);
    },

    /**
     * gets a color represented as a short array [red, green, blue, alpha]
     * @param {string} color - rgb string
     * @param {number} alpha - alpha value
     * @returns {array} an array of rgb(a) values
     */
    getRgbArray: function (color, alpha) {
        let rgb = [];

        rgb = color.match(/([0-9]+\.?[0-9]*)/g);

        // Ensure all values in rgb are decimal numbers, not strings.
        for (let i = 0; i < rgb.length; i++) {
            rgb[i] = parseInt(rgb[i], 10);
        }

        if (alpha) {
            rgb.push(alpha);
        }

        return rgb;
    }

});

export default LayerModel;
