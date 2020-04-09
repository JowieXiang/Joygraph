import Template from "text-loader!./template.html";
import InfoTemplate from "text-loader!./info.html";
import "./style.less";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";

const SelectDistrictView = Backbone.View.extend(/** @lends SelectDistrictView.prototype */{
    events: {
        "click button#Submit": "checkIfSelected",
        "click button#Reset": "reset",
        "click button#Help": "showHelp",
        "click button#Draw": "toggleDrawSelection",
        "change input#buffer": "setBuffer"
    },

    /**
     * @class SelectDistrictView
     * @extends Backbone.View
     * @memberof Tools.SelectDistrict
     * @constructs
     * @listens Tools.SelectDistrict#ChangeIsActive
     */
    initialize: function () {
        this.scopeDropdownView = new SnippetDropdownView({
            model: this.model.get("scopeDropdownModel")
        });

        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    template: _.template(Template),

    /**
     * renders this tool into the tool window
     * @param {Backbone.model} model - select district model
     * @param {boolean} value - flag for this tool if it is active
     * @return {Backbone.View} this view
     */
    render: function (model, value) {
        var attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));

            this.$el.find(".dropdown").append(this.scopeDropdownView.render().el);
        }
        return this;
    },

    /**
     * checks if districts are selected. if not a reminder is displayed.
     * @returns {void}
     */
    checkIfSelected: function () {
        if (this.model.get("selectedDistricts").length === 0) {
            Radio.trigger("Alert", "alert", {
                text: "<strong>Warnung: Sie haben noch keine Gebiete ausgewählt. Es werden keine Datensätze geladen.</strong> <br /> Sie können trotzdem Fachdaten-Ebenen für die gesamte Stadt anzeigen lassen und Gebiete nach Parametern ermitteln.",
                kategorie: "alert-warning"
            });
        }
        this.model.toggleIsActive();
    },

    /**
     * calls the toggleDrawSelection function in the model
     * @returns {void}
     */
    toggleDrawSelection: function () {
        this.model.toggleDrawSelection();
    },

    /**
     * calls the resetSelectedDistricts function in the model
     * @returns {void}
     */
    reset () {
        this.model.resetSelectedDistricts();
    },

    /**
     * shows the help for this tool
     * @returns {void}
     */
    showHelp: function () {
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info"
        });
    },

    /**
     * sets a buffer around the districts
     * @param {jQuery.Event} evt - change event on input#buffer
     * @returns {void}
     */
    setBuffer: function (evt) {
        this.model.set("buffer", parseInt(evt.target.value, 10));
    }
});

export default SelectDistrictView;
