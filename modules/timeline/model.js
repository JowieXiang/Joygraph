import Tool from "../../../../modules/core/modelList/tool/model";

const Timeline = Tool.extend({
    defaults: {
        properties: {},
        timelineSignifier: "kategorie",
        timelinePrefix: "jahr_"
    },
    initialize () {
        const channel = Radio.channel("Timeline");

        channel.reply({
            "createTimelineTable": function (inputTable) {
                return this.convertTable(inputTable);
            },
            "getLatestValue": function (input) {
                return this.getLatestValue(input);
            },
            "getLatestFieldFromProperties": function (input) {
                return this.getLatestField(input);
            },
            "getLatestFieldFromCollection": function (input) {
                return this.getLatestFieldFromCollection(input);
            },
            "fillUpTimelineGaps": function (inputTable, outputType = "Object") {
                return this.fillUpTimelineGaps(inputTable, outputType);
            }
        }, this);
    },
    convertTable (inputTable) {
        const timelineTable = inputTable;

        timelineTable.forEach((col) => {
            let newPropertyKey;

            for (const prop in col) {
                if (prop.includes(this.getSignifier())) {
                    newPropertyKey = col[prop];
                    col[newPropertyKey] = {};

                    delete col[prop];
                }
                if (prop.includes(this.getPrefix()) && typeof newPropertyKey !== "undefined") {
                    const year = prop.replace(this.getPrefix(), "").slice(0, 4);

                    col[newPropertyKey][year] = col[prop];

                    delete col[prop];
                }
            }
        });

        return timelineTable;
    },

    getLatestValue (feature) {
        const properties = feature.getProperties ? feature.getProperties() : feature,
            selector = this.getLatestField(properties);

        return properties[selector];
    },

    getLatestFieldFromCollection (collection) {
        let latestField;

        for (let i = 0; i < collection.length; i++) {
            latestField = this.getLatestField(collection[i], latestField);
            if (latestField instanceof Array) {
                latestField = latestField[0];
                break;
            }
        }

        return latestField;
    },

    /**
     * @description returns the selector for the latest entry in properties
     * @param {*} feature the feature to test, works also if a properties-object is provided
     * @param {string} currentLatestField the current latest field (optional)
     * @returns {string} the selector
     */
    getLatestField (feature, currentLatestField) {
        const properties = feature.getProperties ? feature.getProperties() : feature;
        let latestYear = currentLatestField ? parseFloat(currentLatestField.replace(this.getPrefix(), "")) : 0,
            selector = currentLatestField;

        // find latest year
        for (const prop in properties) {
            if (prop.includes(this.getPrefix())) {
                if (parseFloat(prop.replace(this.getPrefix(), "")) > latestYear) {
                    latestYear = parseFloat(prop.replace(this.getPrefix(), ""));
                    selector = prop;
                }
            }
            // Break if the found date is from last year
            // return true as 2nd value if the latest possible year is reached for collection to break the loop
            if (latestYear === new Date().getFullYear() - 1) {
                return currentLatestField ? [selector, true] : selector;
            }
        }

        return selector;
    },

    /**
     * fills missing values in table columns by year
     * @param {*} inputTable the original table
     * @param {*} outputType="Object" output type, "Object" or "Array"
     * @returns {Object} the result Object or Object[]
     */
    fillUpTimelineGaps (inputTable, outputType = "Object") {
        inputTable.reduce((props, col) => {
            return [...props, ...Object.keys(col)].reduce((unique, prop) => {
                return unique.includes(prop) ? unique : [...unique, prop];
            });
        }, [])
            .forEach((prop) => {
                const checkPropType = this.checkPropType(prop, inputTable);

                if (checkPropType === "object") {
                    const range = inputTable
                        .map(col => col[prop])
                        .map(timeline => timeline ? Object.keys(timeline) : [])
                        .reduce((allYears, yearsOfCol) => [...allYears, ...yearsOfCol], [])
                        .reduce((years, year) => {
                            years[year] = "-";
                            return years;
                        }, {});

                    inputTable.forEach(col => {
                        if (col[prop] instanceof Object || !col[prop]) {
                            col[prop] = outputType === "Array" ? _.pairs({...range, ...col[prop]}).reverse() : {...range, ...col[prop]};
                        }
                    });
                }
            });

        return inputTable;
    },

    /**
     * recursively checks the property type in each column, returns "object" if at least 1 column is an object, i.e. has nested values
     * @param {*} prop the property to check
     * @param {*} table the dataset to check in
     * @param {*} startIndex=0 the index at which to start the loop
     * @returns {String} the property data type
     */
    checkPropType (prop, table, startIndex = 0) {
        return typeof table[startIndex][prop] === "object" || startIndex === table.length - 1 ?
            typeof table[startIndex][prop] :
            this.checkPropType(prop, table, startIndex + 1);
    },
    getSignifier () {
        return this.get("timelineSignifier");
    },
    getPrefix () {
        return this.get("timelinePrefix");
    }
});

export default Timeline;
