import Template from "text-loader!./templateSimpleView.html";
import "./style.less";

const QuerySimpleView = Backbone.View.extend(/** @lends QuerySimpleView.prototype */{
    /**
     * @class QuerySimpleView
     * @extends Backbone.View
     * @memberof Tools.Filter.Query
     * @constructs
     */
    events: {
        "click": "selectModel"
    },
    initialize: function () {
        this.listenToOnce(this.model, {
            "change:isSelected": function (model, value) {
                if (value) {
                    this.model.setIsActive(value);
                    this.model.get("btnIsActive").setIsSelected(value);
                }
            }
        });
        this.listenTo(this.model, {
            "change:isSelected": function () {
                this.render();
            },
            "change:isLayerVisible": this.render
        });
    },
    template: _.template(Template),
    className: "simple-view",

    /**
     * Zeichnet die SimpleView (Filter-Header) für die Query
     * @returns {void}
     */
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },

    selectModel: function () {
        this.model.selectThis();
    }
});

export default QuerySimpleView;
