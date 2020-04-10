import ToleranceModel from "./model";

const ToleranceCollection = Backbone.Collection.extend(/** @lends ToleranceCollection.prototype */{
    /**
     * @class ToleranceCollection
     * @description list of tolerance models
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.LayerFilter.Tolerance
     * @constructs
     */
    model: ToleranceModel
});

export default ToleranceCollection;
