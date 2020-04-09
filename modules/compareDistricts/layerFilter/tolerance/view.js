import "./style.less";
import template from "text-loader!./template.html";

const ToleranceView = Backbone.View.extend(/** @lends ToleranceView.prototype */{

    /**
     * @class ToleranceView
     * @description tolerance inputs
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.LayerFilter.Tolerance
     * @constructs
     */
    events: {
        "change #lowerTolerance": function (evt) {
            this.setLowerTolerance(evt);
        },
        "change #upperTolerance": function (evt) {
            this.setUpperTolerance(evt);
        }
    },

    tagName: "div",
    className: "filter-value",
    template: _.template(template),

    /**
     * Render to DOM
     * @return {ToleranceView} returns this
     */
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },

    /**
     * sets lower tolerance
     * @param {Object} evt input event
     * @returns {void}
     */
    setLowerTolerance: function (evt) {
        this.model.set("lowerTolerance", evt.target.value);
    },

    /**
     * sets upper tolerance
     * @param {Object} evt input event
     * @returns {void}
     */
    setUpperTolerance: function (evt) {
        this.model.set("upperTolerance", evt.target.value);
    }
});

export default ToleranceView;
