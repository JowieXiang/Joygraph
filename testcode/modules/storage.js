/**
 * @description setting up the storage listener for CoSI
 * @returns {void}
 */
export function setupStorage () {
    window.addEventListener("storage", function (evt) {
        Radio.trigger("Storage", "updated", evt.key);
    }, false);
}

/**
 * @description add a storage listener that updates properties on the model onStorage
 * @param {Backbone.Model[]} models listening models
 * @returns {void}
 */
export function storageListener (models) {
    var _models = models.length ? models : [models];

    _models.forEach(model => {
        if (model instanceof Backbone.Model) {
            model.listenTo(Radio.channel("Storage"), {
                "updated": function (key) {

                    if (model.defaults.hasOwnProperty(key)) {
                        model.set(key, parseItem(key));
                    }
                }
            }, model);
        }
    });
}

/**
 * @description updates the defaults of any model by localStorage
 * @param {*} models the models to update
 * @returns {void}
 */
export function updateFromStorage (models) {
    var _models = models.length ? models : [models];

    _models.forEach(model => {
        for (const key in model.defaults) {
            if (window.localStorage.getItem(key)) {
                model.set(key, parseItem(key));
                // console.log(model.get(key), model);
            }
        }
    });
}

/**
 * parses an item from localStorage
 * @param {string} key the key of the storage entry
 * @returns {*} the parsed val
 */
function parseItem (key) {
    let item;

    try {
        item = JSON.parse(window.localStorage.getItem(key));
    }
    catch (e) {
        item = window.localStorage.getItem(key);
    }

    return item;
}

export default storageListener;
