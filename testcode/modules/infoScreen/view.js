import Template from "text-loader!./template.html";
import InfoScreenModel from "./model";
import "./style.less";

const InfoScreenView = Backbone.View.extend(/** @lends InfoScreenView.prototype */{
    events: {
        "click #title": "renderContent"
    },
    /**
     * Creates the InfoScreenView and initializes the model
     * @class InfoScreenView
     * @extends Backbone.View
     * @memberof InfoScreen
     * @constructs
     * @param {object} opts the infoScreen Options
     */
    initialize (opts) {
        this.model = new InfoScreenModel(opts);

        this.render();

        this.listenTo(this.model, {
            "updateContent": function () {
                this.renderContent();
            }
        }, this);
    },
    model: {},
    contentContainer: {},
    template: _.template(Template),

    /**
     * renders the InfoScreen, instead of the map and sets the container for its children
     * @returns {Backbone.View} returns this
     */
    render () {
        var attr = this.model.toJSON();

        this.setElement(document.getElementById("info-screen"));
        this.$el.html(this.template(attr));

        this.contentContainer = this.$el.find(".info-screen-children");

        return this;
    },

    /**
     * renders all child views modules set in config to the InfoScreen
     * @returns {void}
     */
    renderContent () {
        this.contentContainer.empty();
        this.model.getChildren().forEach(child => {
            this.renderChild(child);
        });
    },

    /**
     * appends a View to the InfoScreen
     * @param {Backbone.View} child the view to append
     * @returns {void}
     */
    renderChild (child) {
        this.contentContainer.append(child.$el);
    }
});

export default InfoScreenView;
