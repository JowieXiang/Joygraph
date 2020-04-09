/**
 * @description Polyfills to cover for lacks in older/weaker browsers
 * @returns {void}
 */
export function addPolyfills () {
    if (!HTMLCanvasElement.prototype.toBlob) {
        /* eslint-disable consistent-this */
        Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
            value: function (callback, type, quality) {
                var canvas = this;

                setTimeout(function () {
                    var binStr = atob(canvas.toDataURL(type, quality).split(",")[1]),
                        len = binStr.length,
                        arr = new Uint8Array(len);

                    for (let i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }

                    callback(new Blob([arr], {type: type || "image/png"}));
                });
            }
        });
        /* eslint-enable consistent-this */
    }
    if (!Array.prototype.flat) {
        // todo - add depth argument
        Object.defineProperty(Array.prototype, "flat", {
            value: function () {
                if (this.length === 0) {
                    return this;
                }
                return this.reduce(function (res, item) {
                    return Array.isArray(item) ? [...res, ...item.flat()] : [...res, item];
                }, []);
            }
        });
    }

    // todo - swap not neighboring values
    Object.defineProperty(Array.prototype, "swap", {
        value: function (i, j) {
            var itemLow = this[i],
                itemHigh = this[j],
                arrLow = i > 0 ? this.slice(0, i) : [],
                arrHigh = j < this.length - 1 ? this.slice(j + 1) : [];

            try {
                if (Math.abs(i - j) !== 1) {
                    throw new RangeError("The indices to swap must me neighbors");
                }
                return [...arrLow, itemHigh, itemLow, ...arrHigh];
            }
            catch (e) {
                return console.error(e);
            }
        }
    });

    /**
    * detect IE & Edge
    * @returns {number | boolean} version of IE or false, if browser is not Internet Explorer
    */
    window.detectMS = function () {
        var ua = window.navigator.userAgent,
            msie = ua.indexOf("MSIE "),
            trident = ua.indexOf("Trident/"),
            edge = ua.indexOf("Edge/");

        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
        }

        if (trident > 0) {
            // IE 11 => return version number
            return parseInt(ua.substring(ua.indexOf("rv:") + 3, ua.indexOf(".", ua.indexOf("rv:"))), 10);
        }

        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
        }

        // other browser
        return false;
    };

    /**
     * identify the browser name and return string
     * @returns {string} the browser name
     */
    window.identifyBrowser = function () {
        var browser,
            userAg = navigator.userAgent;

        if (userAg.indexOf("Firefox") > -1) {
            browser = "firefox";
            // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
        }
        else if (userAg.indexOf("Opera") > -1 || userAg.indexOf("OPR") > -1) {
            browser = "opera";
            // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
        }
        else if (userAg.indexOf("Trident") > -1) {
            browser = "IE";
            // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
        }
        else if (userAg.indexOf("Edge") > -1) {
            browser = "edge";
            // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
        }
        else if (userAg.indexOf("Chrome") > -1) {
            browser = "chrome";
            // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
        }
        else if (userAg.indexOf("Safari") > -1) {
            browser = "safari";
            // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
        }
        else {
            browser = "unknown";
        }

        return browser;
    };

}

