import SliderModel from "../../../../modules/snippets/slider/model";
import {Fill, Style, Stroke} from "ol/style.js";

const TimeSliderModel = Backbone.Model.extend({
    defaults: {
        attribute_prefix: "jahr_",
        isRunning: false,
        channel: Radio.channel("TimeSlider")
    },

    initialize: function () {
        this.listenTo(this.get("channel"), {
            "create": this.run
        });

        this.listenTo(Radio.channel("Dashboard"), {
            "destroyWidgetById": function (id) {
                if (id === "time-slider" && this.get("districtFeatures")) {
                    this.unStyleDistrictFeatures(this.get("districtFeatures"));
                }
            }
        });
    },

    /**
     * starts the tool
     * @param {string} title - title of the displayed features
     * @returns {void}
     */
    run: function (title) {
        // the used features
        this.setFeaturesByValueAndScope(title.trim(), Radio.request("SelectDistrict", "getScope"));
        // only continue if the related data is available
        if (this.get("features").length > 0) {
            // data for the graph
            this.setFeaturesProperties(this.get("features"));
            this.trigger("render");
            this.setSliderModel(this.get("features"), title);
        }
    },

    /**
     * sets the slider for the time slider
     * @param {ol.Feature[]} features - the used features
     * @param {string} title - title of the displayed features
     * @returns {void}
     */
    setSliderModel: function (features, title) {
        const sliderValues = this.getSliderValues(features, this.get("attribute_prefix")),
            sliderModel = new SliderModel({
                snippetType: "slider",
                values: sliderValues,
                type: "integer",
                preselectedValues: sliderValues[0],
                displayName: "",
                editableValueBox: false,
                withLabel: false
            });

        this.listenTo(sliderModel, {
            "valuesChanged": this.sliderCallback
        }, this);

        this.set("sliderModel", sliderModel);
        this.setMaxYAxisValue(this.get("featuresProperties"), this.get("attribute_prefix"), sliderValues);
        // for the init call
        this.sliderCallback(undefined, sliderValues[0]);
        this.trigger("renderSliderView", sliderModel, title);
        this.trigger("renderGraph", this.get("featuresProperties"), sliderValues[0], this.get("maxYAxisValue"));
    },

    /**
     * gets the values for the time slider
     * @param {ol.Feature[]} features - the used features
     * @param {string} attribute_prefix - time unit prefix
     * @returns {string[]} values of the given time unit
     */
    getSliderValues: function (features, attribute_prefix) {
        const values = [];

        features.forEach(function (feature) {
            Object.keys(feature.getProperties()).forEach(function (key) {
                if (key.includes(attribute_prefix)) {
                    const index = key.indexOf("_") + 1;

                    values.push(parseInt(key.substr(index), 10));
                }
            });
        });

        // get all unique values
        return [...new Set(values.sort())];
    },

    /**
     * callback function for the "valuesChanged" event in the slider model
     * calls the styling function for the features and triggers renderGraph to the view
     * @param {Backbone.Model} valueModel - the value model which is selected
     * @param {number} sliderValue - the current value of the slider
     * @returns {void}
     */
    sliderCallback: function (valueModel, sliderValue) {
        this.styleDistrictFeaturs(this.get("features"), this.get("attribute_prefix") + sliderValue, this.get("maxYAxisValue"));
        this.trigger("renderGraph", this.get("featuresProperties"), sliderValue, this.get("maxYAxisValue"));
    },

    /**
     * styles the equivalent district features (have a geometry) of the used features (have no geometry)
     * use the same style for the district features as well as the bar chart
     * @param {ol.Features[]} features - the used features
     * @param {string} attribute - style is depending on this attribute
     * @param {number} max - max value for the color scale
     * @returns {void}
     */
    styleDistrictFeaturs: function (features, attribute, max) {
        const districtFeatures = this.getDistrictFeaturesByScope(Radio.request("SelectDistrict", "getScope")),
            selector = Radio.request("SelectDistrict", "getSelector"),
            foundDistrictFeatures = [],
            colorScale = Radio.request("ColorScale", "getColorScaleByValues", [0, max]);

        features.forEach(function (feature) {
            // find the equivalent district feature -> to do for stadtteile
            const foundFeature = districtFeatures.find(function (districtFeature) {
                return feature.get(selector) === districtFeature.get(selector);
            });

            foundFeature.setStyle(new Style({
                fill: new Fill({
                    color: colorScale.scale(feature.getProperties()[attribute]).replace("rgb", "rgba").replace(")", ", 0.8)")
                })
            }));
            foundDistrictFeatures.push(foundFeature);
        });
        this.set("districtFeatures", foundDistrictFeatures);
    },

    /**
     * gives the district features the default style
     * @param {Object[]} features - all styled features
     * @returns {void}
     */
    unStyleDistrictFeatures: function (features) {
        features.forEach((feature) => {
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

    /**
     * gets the district features (which have a geometry) by scope
     * @param {string} scope - Statischtische Gebiete | Stadtteile
     * @returns {ol.Feature[]} district features
     */
    getDistrictFeaturesByScope: function (scope) {
        let districtLayer;

        if (scope === "Statistische Gebiete") {
            districtLayer = Radio.request("ModelList", "getModelByAttributes", {id: "6071"});
        }
        // Stadtteile
        else {
            districtLayer = Radio.request("ModelList", "getModelByAttributes", {id: "1694"});
        }
        return districtLayer.get("layer").getSource().getFeatures();
    },

    /**
     * starts the running of the time slider
     * @returns {void}
     */
    runningTimeSlider: function () {
        const sliderModel = this.get("sliderModel"),
            sliderModelValues = sliderModel.get("values"),
            sliderModelValue = sliderModel.get("valuesCollection").at(0).get("value");

        let indexOfValue = sliderModelValues.indexOf(sliderModelValue) + 1;

        // starts from beginning
        if (indexOfValue === sliderModelValues.length) {
            indexOfValue = 0;
            this.setIsRunning(false);
            sliderModel.get("valuesCollection").trigger("updateValue", sliderModelValues[indexOfValue]);
            this.trigger("setButtonToPlay");
        }

        if (this.get("isRunning")) {
            sliderModel.get("valuesCollection").trigger("updateValue", sliderModelValues[indexOfValue]);
            setTimeout(this.runningTimeSlider.bind(this), 1500);
        }
    },

    setIsRunning: function (value) {
        this.set("isRunning", value);
    },

    /**
     * sets the used features
     * @param {string} value - the selected value in the dropdown
     * @param {string} scope - statgebiet | stadttteil
     * @returns {void}
     */
    setFeaturesByValueAndScope: function (value, scope) {
        this.set("features", Radio.request("FeaturesLoader", "getDistrictsByValue", scope, value));
    },

    /**
     * collects the data for the graph, conforms to the features properties
     * @param {ol.Feature[]} features - the used features
     * @returns {void}
     */
    setFeaturesProperties: function (features) {
        const featuresProperties = [];

        features.forEach(function (feature) {
            featuresProperties.push(feature.getProperties());
        });
        this.set("featuresProperties", featuresProperties);
    },

    /**
     * sets the max value for the y-axis
     * @param {object[]} featuresProperties - data for graph
     * @param {string} prefix - time unit prefix
     * @param {number[]} sliderValues - values of the slider
     * @returns {void}
     */
    setMaxYAxisValue: function (featuresProperties, prefix, sliderValues) {
        // to do für prozente
        let maxValue = 0;

        sliderValues.forEach(function (value) {
            const maxValues = featuresProperties.map(function (data) {
                return parseInt(data[prefix + value], 10) || 0;
            });

            maxValue = Math.max(...maxValues, maxValue);
        });

        this.set("maxYAxisValue", maxValue);
    }
});

export default TimeSliderModel;
