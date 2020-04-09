import resultTemplate from "text-loader!./resultTemplate.html";
import "./style.less";

const ResultView = Backbone.View.extend(/** @lends ResultView.prototype */{
    /**
     * @class ResultView
     * @extends Backbone.View
     * @memberof Tools.Filter.Query
     * @constructs
     */
    events: {
        "click #show-in-dashboard": "showInDashboard"
    },
    className: "result-view",
    template: _.template(resultTemplate),
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.delegateEvents();
        return this;
    },

    /**
     * shows compare results in Dashboard
     * @fires Dashboard#RadioTriggerDashboardDestroyWidgetById
     * @fires Dashboard#RadioTriggerDashboardAppend
     * @return {void}
     */
    showInDashboard: function () {
        const resultsClone = this.$el.find("#results").clone();

        Radio.trigger("Dashboard", "destroyWidgetById", "filter");
        Radio.trigger("Dashboard", "append", resultsClone, "#dashboard-containers", {
            id: "filter",
            name: "Filter",
            glyphicon: "glyphicon-filter",
            scalable: true
        });
    }
});

export default ResultView;
