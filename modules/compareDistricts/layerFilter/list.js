import LayerFilterModel from "./model";

var LayerFilterCollection = Backbone.Collection.extend(/** @lends LayerFilterCollection.prototype */{
    /**
     * @class LayerFilterCollection
     * @description list of layer filter models
     * @extends Backbone.Collection
     * @memberof Tools.CompareDistricts.LayerFilter
     * @constructs
     */
    model: LayerFilterModel
});

export default LayerFilterCollection;
