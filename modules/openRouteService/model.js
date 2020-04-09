const openRouteService = Backbone.Model.extend(/** @lends openRouteService.prototype */{
    defaults: {
        baseUrl: "https://api.openrouteservice.org/v2/isochrones/",
        accessKey: "5b3ce3597851110001cf6248043991d7b17346a38c8d50822087a2c0"
    },
    /**
     * @class openRouteService
     * @extends Backbone.Model
     * @memberof OpenRouteService
     * @constructs
     * @property {String} baseUrl="https://api.openrouteservice.org/v2/isochrones/" OpenRouteService isochrones service base url
     * @property {String} accessKey="5b3ce3597851110001cf6248043991d7b17346a38c8d50822087a2c0" OpenRouteService access key (temporary)
     * @listens OpenRouteService#RadioRequestOpenRouteServiceRequestIsochrones

     */
    initialize: function () {
        this.channel = Radio.channel("OpenRoute");
        this.channel.reply({
            "requestIsochrones": this.requestIsochrones
        }, this);
    },
    /**
     * send request to get Isochrone geoJSON
     * @param {String} pathType type of transportation
     * @param {Array} coordinates coordinates of origins
     * @param {String} rangeType  type of range ("time" or "distance")
     * @param {Array} rangeArray array of time range values
     * @returns {void}
     */
    requestIsochrones: function (pathType, coordinates, rangeType, rangeArray) {
        var that = this;

        return new Promise(function (resolve, reject) {
            // console.log(rangeType);
            // const body = '{"locations":[[9.9937,53.5511],[9.9937,53.5511]],"range":[300,200]}',
            const queryBody = `{"locations":${JSON.stringify(coordinates)},"range_type":"${rangeType}", "range":${JSON.stringify(rangeArray)}}`,
                url = that.get("baseUrl") + pathType.trim();
            var xhr = new XMLHttpRequest();

            // console.log("query: ", queryBody);
            xhr.open("POST", url);
            xhr.setRequestHeader("Accept", "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", that.get("accessKey"));
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                }
                else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send(queryBody);
        });
    }
});

export default openRouteService;
