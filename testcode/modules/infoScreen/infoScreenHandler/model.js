import Tool from "../../../../../modules/core/modelList/tool/model";

const InfoScreenHandler = Tool.extend(/** @lends InfoScreenHandler.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        id: "infoScreen",
        name: "Zweites Fenster öffnen",
        windowOpts: {},
        channel: Radio.channel("InfoScreen"),
        title: "",
        windowName: "",
        winOpts: {},
        infoScreenOpen: false
    }),

    /**
     * @class InfoScreenHandler
     * @extends Tool
     * @memberof InfoScreen
     * @constructs
     * @listens InfoScreen#RadioTriggerTriggerRemote
     * @listens InfoScreen#RadioRequestGetIsWindowOpen
     * @listens InfoScreen#RadioRequestGetIsInfoScreen
     * @listens window.onmessage
     */
    initialize () {
        this.superInitialize();

        this.listenTo(this.get("channel"), {
            "triggerRemote": this.triggerRemote
        }, this);

        this.get("channel").reply({
            "getIsWindowOpen": this.getIsWindowOpen,
            "getIsInfoScreen": function () {
                return false;
            }
        }, this);

        this.listenTo(this, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    this.castWindow();
                }
            },
            "change:infoScreenOpen": function (model, isOpen) {
                if (!isOpen) {
                    this.setIsActive(false);
                }
                else {
                    this.setIsWindowOpen(isOpen);
                }
            }
        });

        window.addEventListener("message", this.triggerFromRemote);
    },

    /**
     * opens the remote window with name "InfoScreen"
     * @returns {void}
     */
    castWindow () {
        this.window = window.open("./infoscreen.html", "InfoScreen");

        this.setIsWindowOpen(true);
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

        this.window.postMessage(msg);
    },

    /**
     * executes the Radio event received from the remote window
     * @param {*} msg the message event with the data attached
     * @fires Radio.trigger
     * @returns {void}
     */
    triggerFromRemote (msg) {
        if (msg.source.name === "InfoScreen") {
            const channel = msg.data.channel,
                event = msg.data.event,
                args = msg.data.args;

            Radio.trigger(channel, event, ...args);
        }
    },

    /**
     * getter for the InfoScreenState
     * @returns {boolean} the infoScreen Opening state
     */
    getIsWindowOpen () {
        return this.get("infoScreenOpen");
    },

    /**
     * setter fir the InfoScreenState, broadcasts the opening of the remote window to all other modules
     * @param {boolean} state isInfoScreenOpen?
     * @fires InfoScreen#RadioTriggerInfoScreenOpen
     * @returns {void}
     */
    setIsWindowOpen (state) {
        this.set("infoScreenOpen", state);
        if (this.get("infoScreenOpen")) {
            this.get("channel").trigger("infoScreenOpen");
        }
    }
});

export default InfoScreenHandler;
