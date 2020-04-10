const bboxSettorModel = Backbone.Model.extend(/** @lends bboxSettorModel.prototype */{
    defaults: {
    },
    /**
     * @class bboxSettorModel
     * @extends Backbone.Model
     * @memberof BboxSettor
     * @constructs
     */
    initialize: function () {
        const channel = Radio.channel("BboxSettor");

        channel.on({
            "setBboxGeometryToLayer": this.setBboxGeometryToLayer
        }, this);
    },
    /**
     * sets the bbox geometry for targeted raw layers or exisiting vector layers
     * @param {Array} itemList - list of target raw layers
     * @param {GeometryCollection} bboxGeometry - target geometry to be set as bbox
     * @returns {void}
     */
    setBboxGeometryToLayer: function (itemList, bboxGeometry) {
        const modelList = Radio.request("ModelList", "getCollection");

        itemList.forEach(function (item) {
            const model = modelList.get(item.id);

            // layer already exists in the model list
            if (model) {
                model.set("bboxGeometry", bboxGeometry);
                // updates layers that have already been loaded
                if (model.has("layer")) {
                    model.updateSource();
                }
            }
            // for layers that are not yet in the model list
            else {
                item.bboxGeometry = bboxGeometry;
            }
        }, this);
    }

});

export default bboxSettorModel;
