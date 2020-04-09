const InfoScreenModel = Backbone.Model.extend(/** @lends InfoScreenModel.prototype */{
    defaults: {
        id: "infoScreen",
        name: "CoSI Infoscreen",
        children: [],
        data: {},
        isInfoScreen: true,
        channel: Radio.channel("InfoScreen"),
        broadcasts: {}
    },

    /**
     * Constructs the infoScreen on the 2nd screen and manages communication with the main screen
     * @class InfoScreenModel
     * @extends Backbone.Model
     * @memberof InfoScreen
     * @constructs
     * @param {object} opts the init options taken from config
     * @listens window.onmessage
     * @listens window.onbeforeunload
     * @listens InfoScreen#RadioRequestGetIsInfoScreen
     * @listens InfoScreen#RadioTriggerTriggerRemote
     */
    initialize (opts) {
        for (const attr in opts) {
            this.set(attr, opts[attr]);
        }

        window.localStorage.setItem("infoScreenOpen", JSON.stringify(true));
        window.addEventListener("beforeunload", this.callClosed.bind(this), false);
        window.addEventListener("message", this.triggerFromRemote);

        this.initChildren(this.getChildren());

        this.get("channel").reply({
            "getIsInfoScreen": function () {
                return true;
            }
        });

        this.get("channel").on({
            "triggerRemote": this.triggerRemote
        });
    },

    /**
     * renders the child modules set up in config to the infoScreen
     * updates their properties based on localStorage
     * @param {Backbone.Model[]} children the preset children
     * @returns {void}
     */
    initChildren (children) {
        children.forEach(child => {
            if (!child.model.get("isActive")) {
                child.model.set("isActive", true);
            }
            else {
                child.render();
            }
        });

        setTimeout(() => {
            this.trigger("updateContent");
        }, 2000); // Fix later
    },

    /**
     * updates the children to render, triggered manually
     * @param {Backbone.Model[]} children the new children to render active
     * @returns {void}
     */
    updateWindow (children) {
        this.initChildren(children);
    },

    /**
     * send message to the remote window, triggering a Radio Call
     * @param {*} channel the channel to call
     * @param {*} event the event to trigger
     * @param {*} args the arguments array. An argument that is already an array (e.g. coord = [1234, 4321]) must be wrapped again
     * @fires window.postMessage
     * @returns {void}
     */
    triggerRemote (channel, event, args) {
        const msg = _.isObject(channel) ? channel : {
            channel,
            event,
            args
        };

        if (!Array.isArray(msg.args)) {
            msg.args = [msg.args];
        }

        window.opener.postMessage(msg);
    },

    /**
     * executes the Radio event received from the remote window
     * @param {*} msg the message event with the data attached
     * @fires Radio.trigger
     * @returns {void}
     */
    triggerFromRemote (msg) {
        if (msg.source.name === "TouchScreen") {
            const channel = msg.data.channel,
                event = msg.data.event,
                args = msg.data.args;

            Radio.trigger(channel, event, ...args);
        }
    },

    /**
     * onbeforeunload: set infoScreenOpen key in localStorage to false
     * @returns {void}
     */
    callClosed () {
        window.localStorage.setItem("infoScreenOpen", JSON.stringify(false));
    },

    /**
     * getter for returning all infoScreen modules
     * @returns {Backbone.Model[]} the children on the InfoScreen
     */
    getChildren () {
        return this.get("children");
    }
});

export default InfoScreenModel;
