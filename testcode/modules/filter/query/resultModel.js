const ResultModel = Backbone.Model.extend(/** @lends ResultModel.prototype */{

    defaults: {
        layerId: "",
        featureIds: []
    }
    /**
     * @class ResultModel
     * @extends Backbone.View
     * @memberof Tools.Filter.Query
     * @constructs
     * @property {String} layerId layer id
     * @property {Array} featureIds id of features
     */
});

export default ResultModel;
