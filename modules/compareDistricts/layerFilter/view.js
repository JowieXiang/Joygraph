import "./style.less";
import template from "text-loader!./template.html";
import ToleranceCollection from "./tolerance/list";
import ToleranceModel from "./tolerance/model";
import ToleranceView from "./tolerance/view";


const LayerFilterView = Backbone.View.extend(/** @lends LayerFilterView.prototype */{
    events: {
        "click .close": "destroySelf",
        "change .reference-value-input": "updateRefInputValue"
    },

    /**
     * @class LayerFilterView
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.LayerFilter
     * @constructs
     * @fires DistrictSelector#RadioRequestDistrictSelectorGetSelectedDistrict
     * @fires Tools.Timeline#RadioRequestTimelineGetLatestFieldFromCollection
     * @fires FeaturesLoader#RadioRequestGetAllFeaturesByAttribute
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetSelector
     */
    initialize: function () {
        this.toleranceCollection = new ToleranceCollection();
        this.listenTo(this.toleranceCollection, {
            "change": function (model) {
                this.updateLayerFilter(model);
            }
        });
        this.listenTo(this.model, {
            "change:districtInfo": this.render
        });
    },

    tagName: "div",
    className: "",
    template: _.template(template),

    /**
     * Render to DOM
     * @return {LayerFilterView} returns this
     */
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.renderToleranceViews();
        return this;
    },

    /**
     * renders tolerance values
     * @returns {void}
     */
    renderToleranceViews: function () {
        const filterData = JSON.parse(this.model.get("filter"));

        _.each(Object.keys(filterData), filterKey => {
            const newToleranceModel = new ToleranceModel({
                    key: filterKey,
                    lowerTolerance: parseInt(filterData[filterKey][0], 10),
                    upperTolerance: parseInt(filterData[filterKey][1], 10)
                }),
                toleranceView = new ToleranceView({
                    model: newToleranceModel
                });

            this.toleranceCollection.add(newToleranceModel);
            this.$el.find("#" + filterKey + "-td").append(toleranceView.render().el);
        });
    },

    /**
     * destroys this layerFilter
     * @fires Tools.CompareDistricts#RadioTriggerCompareDistrictsCloseFilter
     * @returns {void}
     */
    destroySelf: function () {
        const newLayerInfo = this.model.get("layerInfo");

        newLayerInfo.layerName = newLayerInfo.layerName.replace(/ /g, "_");
        this.model.set("layerInfo", newLayerInfo);
        Radio.trigger("CompareDistricts", "closeFilter", this.model.get("layerInfo"));
        this.remove();
        this.model.destroy();
    },

    /**
     * updates value of the layerFilter
     * @param {Object} toleranceModel tolerance model containing upper and lower tolerance
     * @returns {void}
     */
    updateLayerFilter: function (toleranceModel) {
        const key = toleranceModel.get("key"),
            newFilter = JSON.parse(this.model.get("filter"));

        newFilter[key] = [toleranceModel.get("lowerTolerance"), toleranceModel.get("upperTolerance")];
        this.model.set("filter", JSON.stringify(newFilter));
    },

    /**
     * updates value of the layerFilter
     * @param {Object} e input event
     * @fires Tools.CompareDistricts#RadioTriggerCompareDistrictsChangeRefValue
     * @returns {void}
     */
    updateRefInputValue: function (e) {
        var key = $(e.currentTarget).attr("id");
        // deep copying districtInfo array
        const newInfo = _.map(this.model.get("districtInfo"), _.clone);

        e.preventDefault();
        _.each(newInfo, item => {
            if (item.key === key) {
                item.value = parseInt(e.target.value, 10);
            }
        });
        this.model.set("districtInfo", newInfo);
        Radio.trigger("CompareDistricts", "changeRefValue");
    }

});

export default LayerFilterView;
