const ToleranceModel = Backbone.Model.extend(/** @lends ToleranceModel.prototype */{
    /**
     * @class ToleranceModel
     * @description upper and lower tolerance of a layer filter
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.LayerFilter.Tolerance
     * @constructs
     * @property {number} lowerTolerance=0 lower tolerance
     * @property {number} upperTolerance=0 upper tolerance
     * @property {string} key field key
     */
    defaults: {
        lowerTolerance: 0,
        upperTolerance: 0,
        key: null
    }
});

export default ToleranceModel;
