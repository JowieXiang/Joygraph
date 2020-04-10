import "./style.less";
import template from "text-loader!./template.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";

const SelectView = Backbone.View.extend(/** @lends SelectView.prototype */{
    /**
     * @class SelectView
     * @extends Backbone.View
     * @memberof Tools.Reachability
     * @constructs
     * @listens SelectModel#ChangeIsActive
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.render(model, value);
                }
            }
        });
    },
    template: _.template(template),
    /**
     * Render to DOM
     * @return {SelectView} returns this
     */
    render: function () {
        var attr = this.model.toJSON();

        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template(attr));
        this.renderDropDownView();
        return this;
    },
    /**
     * sets dropdown model and renders dropdown view
     * @returns {void}
     */
    renderDropDownView: function () {
        this.model.setDropDownModel();
        const dropdownView = new SnippetDropdownView({model: this.model.get("dropDownModel")});

        this.$el.find("#reachabilityAnalysis").append(dropdownView.render().el);
    }
});

export default SelectView;
