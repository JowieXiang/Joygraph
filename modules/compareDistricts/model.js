import Tool from "../../../../modules/core/modelList/tool/model";
import {Fill, Stroke, Style} from "ol/style.js";

const CompareDistrictsModel = Tool.extend(/** @lends CompareDistrictsModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        comparableFeaturesNames: [],
        layerFilterList: "", // e.g [{layerId: "", filter: {key: [],...}},...]
        mapLayerName: "compare-district",
        selectedStyle: new Style({
            fill: new Fill({
                color: [8, 119, 95, 0.3]
            }),
            stroke: new Stroke({
                color: [8, 119, 95, 0.3],
                width: 3
            })
        }),
        refDistrict: null,
        selectorField: "verwaltungseinheit" //
    }),
    /**
     * @class CompareDistrictsModel
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts
     * @constructs
     * @property {string} layerFilterList all filter layers' data. e.g "[{layerId: "", filter: {key: [],...}},...]"
     * @property {Array} comparableFeaturesNames name of comparable districts
     * @property {Array} mapLayerName="compare-district" OpenLayers map layer containing comparable results
     * @property {ol.style} selectedStyle =new Style({fill: new Fill({color: [8, 119, 95, 0.3]}),stroke: new Stroke({color: [8, 119, 95, 0.3],width: 3})}),refDistrict: null}) highlighted style of selected districts
     * @property {Feature} refDistrict reference district feature
     * @property {String} selectorField="verwaltungseinheit" stadtile data is included in the same dataset with a verwaltungseinheit value as "stadtile"
     */
    initialize: function () {
        this.superInitialize();
    }
});

export default CompareDistrictsModel;
