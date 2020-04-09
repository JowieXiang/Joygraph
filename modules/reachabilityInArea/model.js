import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";
import * as Proj from "ol/proj.js";
import * as Extent from "ol/extent";

const ReachabilityInAreaModel = Tool.extend(/** @lends ReachabilityInAreaModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        coordinates: [],
        pathType: "",
        rangeType: "",
        range: 0,
        steps: 3, // step of subIsochrones
        isochroneFeatures: [], // isochrone features
        dropDownModel: {},
        mapLayerName: "reachability-in-area",
        featureType: "Erreichbarkeit im Gebiet" // used for targeting the features within the layer
    }),
    /**
    * @class ReachabilityInAreaModel
    * @extends Tool
    * @memberof Tools.Reachability.ReachabilityInArea
    * @constructs
    * @property {Array} coordinates origin coordinates (in "EPSG:4326")
    * @property {string} pathType type of transportation
    * @property {string} rangeType type of range ("time" or "distance")
    * @property {number} range time of traveling (in seconds)
    * @property {number} steps how many times to subdivide the time of traveling
    * @property {Array} isochroneFeatures calculation results as openlayer features
    * @property {object} dropDownModel dropdown menu model
    * @property {Array} mapLayerName="reachability-in-area" name of the openlayers layer that contains the result features
    * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
    * @listens DropdownModel#ValuesChanged
    */
    initialize: function () {
        this.superInitialize();
    },
    /**
     * sets selected facility layer
     * @listens DropdownModel#ValuesChanged
     * @returns {void}
     */
    setDropDownModel: function () {
        const dropdownModel = new DropdownModel({
            name: "FacilityType",
            type: "string",
            values: this.get("facilityNames"),
            snippetType: "dropdown",
            isMultiple: false,
            displayName: "Einrichtungstyp",
            liveSearch: true,
            steps: 3,
            facilityNames: []
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.setCoordinates
        }, this);
        this.set("dropDownModel", dropdownModel);
    },
    /**
     * update selected facility coordinates values
     * @param {Backbone.Model} valueModel - the value model which was selected or deselected
     * @param {boolean} isSelected - flag if value model is selected or not
     * @returns {void}
     */
    setCoordinates: function (valueModel, isSelected) {
        if (isSelected) {
            const selectedLayerModel = Radio.request("ModelList", "getModelByAttributes", {name: valueModel.get("value")});

            if (selectedLayerModel) {
                let coordinates = [];
                const features = selectedLayerModel.get("layer").getSource().getFeatures().filter(f => typeof f.style_ === "object" || f.style_ === null);

                _.each(features, (feature) => {
                    const geometry = feature.getGeometry();

                    if (geometry.getType() === "Point") {
                        coordinates.push(geometry.getCoordinates().splice(0, 2));
                    }
                    else {
                        coordinates.push(Extent.getCenter(geometry.getExtent()));
                    }
                });
                coordinates = coordinates.map(coord => Proj.transform(coord, "EPSG:25832", "EPSG:4326"));
                this.set("coordinates", coordinates);
            }
        }
    }

});

export default ReachabilityInAreaModel;
