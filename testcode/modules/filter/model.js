import WfsQueryModel from "./query/source/wfs";
import GeoJsonQueryModel from "./query/source/geojson";
import Tool from "../../../../modules/core/modelList/tool/model";

const FilterModel = Tool.extend(/** @lends FilterModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        isGeneric: false,
        isInitOpen: false,
        isVisible: false,
        saveToUrl: true,
        isVisibleInMenu: true,
        id: "filter",
        queryCollection: {},
        isActive: false,
        allowMultipleQueriesPerLayer: false,
        liveZoomToFeatures: true,
        sendToRemote: false,
        renderToSidebar: true,
        renderToWindow: false,
        glyphicon: "glyphicon-filter",
        uiStyle: "DEFAULT",
        uiWidth: "30%"
    }),

    /**
     * @class FilterModel
     * @description todo
     * @extends Tool
     * @memberOf Tools.Filter
     * @property {Boolean} isGeneric=false
     * @property {Boolean} isInitOpen=false
     * @property {Boolean} isVisible=false
     * @property {Boolean} saveToUrl=true
     * @property {Boolean} isVisibleInMenu=true
     * @property {Srting} id="filter"
     * @property {Object} queryCollection
     * @property {Boolean} isActive=false
     * @property {Boolean} allowMultipleQueriesPerLayer=false
     * @property {Boolean} liveZoomToFeatures=true
     * @property {Boolean} sendToRemote=false
     * @property {Boolean} renderToSidebar=true
     * @property {Boolean} renderToWindow=false
     * @property {String} glyphicon="glyphicon-filter"
     * @property {String} uiStyle="DEFAULT"
     * @property {String} uiWidth="30%"
     * @listens Tools.Filter#RadioTriggerFilterResetFilter
     * @listens FilterModel#RadioTriggerDeactivateAllModels
     * @listens FilterModel#RadioTriggerDeselectAllModels
     * @listens FilterModel#RadioTriggerFeatureIdsChanged
     * @listens FilterModel#RadioTriggerCloseFilter
     * @listens FilterModel#RadioTriggerChangeIsLayerVisible
     * @listens Layer#RadioTriggerVectorLayerFeaturesLoaded
     * @fires Core#RadioTriggerParametricURLUpdateQueryStringParam
     * @fires Core#RadioRequestParametricURLGetFilter
     * @fires Core#RadioRequestUtilGetUiStyle
     * @fires Layer#RadioTriggerVectorLayerFeaturesLoaded
     * @fires Core.ModelList#RadioTriggerModelListShowFeaturesById
     * @fires Core.ModelList#RadioTriggerModelListShowAllFeatures
     * @fires GFI#RadioTriggerGFISetIsVisible
     * @fires GFI#RadioRequestGFIGetVisibleTheme
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @constructs
     */
    initialize: function () {
        var channel = Radio.channel("Filter");

        this.superInitialize();
        this.listenTo(channel, {
            "resetFilter": this.resetFilter
        });
        channel.reply({
            "getIsInitialLoad": function () {
                return this.get("isInitialLoad");
            },
            "getFilterName": function (layerId) {
                var predefinedQuery = this.get("predefinedQueries").filter(function (query) {
                    return query.layerId === layerId;
                });

                return predefinedQuery[0].name;
            }
        }, this);
        this.set("uiStyle", Radio.request("Util", "getUiStyle"));
        this.set("queryCollection", new Backbone.Collection());
        this.listenTo(this.get("queryCollection"), {
            "deactivateAllModels": function (model) {
                this.deactivateOtherModels(model);
            },
            "deselectAllModels": this.deselectAllModels,
            "featureIdsChanged": function (featureIds, layerId) {
                this.updateMap();
                if (!this.get("queryCollection").models[0].get("isAutoRefreshing")) {
                    this.updateGFI(featureIds, layerId);
                }
                this.updateFilterObject();
            },
            "closeFilter": function () {
                this.setIsActive(false);
            },
            "change:isLayerVisible": this.checkVisibleQueries
        }, this);

        this.listenTo(Radio.channel("VectorLayer"), {
            "featuresLoaded": function (layerId) {
                // to-do erstmal prüfen ob layerId überhaupt relevant
                var predefinedQueries = this.get("predefinedQueries"),
                    queryCollection = this.get("queryCollection"),
                    filterModels;

                if (!this.isModelInQueryCollection(layerId, queryCollection)) {
                    filterModels = predefinedQueries.filter(function (query) {
                        return query.layerId === layerId;
                    });
                    _.each(filterModels, function (filterModel) {
                        this.createQuery(filterModel);
                    }, this);
                }
                // update query weil andere features
                else if (this.isModelInQueryCollection(layerId, queryCollection)) {
                    const oldQuery = queryCollection.findWhere({layerId: layerId.toString()}),
                        newQuery = predefinedQueries.find(function (query) {
                            return query.layerId === layerId;
                        });

                    queryCollection.remove(oldQuery);
                    this.createQuery(newQuery);
                }
                this.checkVisibleQueries();
            }
        }, this);
    },

    /**
     * resets filter
     * @param {ol.Feature} feature result feature from search
     * @returns {void}
     */
    resetFilter: function (feature) {
        if (feature && feature.getStyleFunction() === null) {
            this.deselectAllModels();
            this.deactivateAllModels();
            this.resetAllQueries();
            this.activateDefaultQuery();
        }
    },

    /**
     * activates default query
     * @returns {void}
     */
    activateDefaultQuery: function () {
        var defaultQuery = this.get("queryCollection").findWhere({isDefault: true});

        if (!_.isUndefined(defaultQuery)) {
            defaultQuery.setIsActive(true);
            defaultQuery.setIsSelected(true);
        }
        defaultQuery.runFilter();
    },

    /**
     * activates default query
     * @returns {void}
     */
    resetAllQueries: function () {
        _.each(this.get("queryCollection").models, function (model) {
            model.deselectAllValueModels();
        }, this);
    },

    /**
     * deselects all models
     * @returns {void}
     */
    deselectAllModels: function () {
        _.each(this.get("queryCollection").models, function (model) {
            model.setIsSelected(false);
        }, this);
    },

    /**
     * deactivate All Models
     * @returns {void}
     */
    deactivateAllModels: function () {
        _.each(this.get("queryCollection").models, function (model) {
            model.setIsActive(false);
        }, this);
    },

    /**
     * deactivate all models other than the selected
     * @param {Object} selectedModel selected model
     * @returns {void}
     */
    deactivateOtherModels: function (selectedModel) {
        if (!this.get("allowMultipleQueriesPerLayer")) {
            _.each(this.get("queryCollection").models, function (model) {
                if (!_.isUndefined(model) &&
                    selectedModel.cid !== model.cid &&
                    selectedModel.get("layerId") === model.get("layerId")) {
                    model.setIsActive(false);
                }
            }, this);
        }
    },

    /**
     * updates the Features shown on the Map
     * @fires Core.ModelList#RadioTriggerModelListShowFeaturesById
     * @fires Core.ModelList#RadioTriggerModelListShowAllFeatures
     * @return {void}
     */
    updateMap: function () {
        // if at least one query is selected zoomToFilteredFeatures, otherwise showAllFeatures
        var allFeatureIds;

        if (_.contains(this.get("queryCollection").pluck("isSelected"), true)) {
            allFeatureIds = this.groupFeatureIdsByLayer(this.get("queryCollection"));

            _.each(allFeatureIds, function (layerFeatures) {
                Radio.trigger("ModelList", "showFeaturesById", layerFeatures.layer, layerFeatures.ids);
            });
        }
        else {
            _.each(this.get("queryCollection").groupBy("layerId"), function (group, layerId) {
                Radio.trigger("ModelList", "showAllFeatures", layerId);
            });
        }
    },

    /**
     * updates GFI
     * @param {Array} featureIds target feature ids
     * @param {String} layerId target layer id
     * @fires GFI#RadioTriggerGFISetIsVisible
     * @fires GFI#RadioRequestGFIGetVisibleTheme
     * @returns {void}
     */
    updateGFI: function (featureIds, layerId) {
        var getVisibleTheme = Radio.request("GFI", "getVisibleTheme"),
            featureId;

        if (getVisibleTheme && getVisibleTheme.get("id") === layerId) {
            featureId = getVisibleTheme.get("feature").getId();

            if (!_.contains(featureIds, featureId)) {
                Radio.trigger("GFI", "setIsVisible", false);
            }
        }
    },

    /**
     * builds an array of object that reflects the current filter
     * @fires Core#RadioTriggerParametricURLUpdateQueryStringParam
     * @return {void}
     */
    updateFilterObject: function () {
        var filterObjects = [];

        this.get("queryCollection").forEach(function (query) {
            var ruleList = [];

            query.get("snippetCollection").forEach(function (snippet) {
                // searchInMapExtent is ignored
                if (snippet.getSelectedValues().values.length > 0 && snippet.get("type") !== "searchInMapExtent") {
                    ruleList.push(_.omit(snippet.getSelectedValues(), "type"));
                }
            });
            filterObjects.push({name: query.get("name"), isSelected: query.get("isSelected"), rules: ruleList});
        });
        if (this.get("saveToUrl")) {
            Radio.trigger("ParametricURL", "updateQueryStringParam", "filter", JSON.stringify(filterObjects));
        }
    },

    /**
     * collects the ids from of all features that match the filter, maps them to the layerids
     * @param  {Object[]} queries query objects
     * @listens Core.ModelList#RadioTriggerModelListShowAllFeatures
     * @return {Object} Map object mapping layers to featuresids
     */
    groupFeatureIdsByLayer: function (queries) {
        var allFeatureIds = [],
            featureIds;

        if (!_.isUndefined(queries)) {

            _.each(queries.groupBy("layerId"), function (group, layerId) {
                var isEveryQueryActive = _.every(group, function (model) {
                    return !model.get("isActive");
                });

                featureIds = this.collectFilteredIds(group);

                if (isEveryQueryActive) {
                    Radio.trigger("ModelList", "showAllFeatures", layerId);
                }
                else {
                    allFeatureIds.push({
                        layer: layerId,
                        ids: featureIds
                    });
                }
            }, this);
        }
        return allFeatureIds;
    },

    /**
     * collects all featureIds of a group of queries into a list of uniqueIds
     * @param  {Object[]} queryGroup group of queries
     * @return {String[]} unique list of all feature ids
     */
    collectFilteredIds: function (queryGroup) {
        var featureIdList = [];

        _.each(queryGroup, function (query) {
            if (query.get("isActive") === true) {
                _.each(query.get("featureIds"), function (featureId) {
                    featureIdList.push(featureId);
                });
            }
        });
        return _.unique(featureIdList);
    },

    /**
     * creates queryset
     * @param  {Object[]} queries group of queries
     * @fires Core#RadioRequestParametricURLGetFilter
     * @return {void}
     */
    createQueries: function (queries) {
        var queryObjects = Radio.request("ParametricURL", "getFilter"),
            queryObject,
            oneQuery;

        _.each(queries, function (query) {
            oneQuery = query;
            if (!_.isUndefined(queryObjects)) {
                queryObject = _.findWhere(queryObjects, {name: oneQuery.name});
                oneQuery = _.extend(oneQuery, queryObject);
            }
            this.createQuery(oneQuery);
        }, this);
    },

    /**
     * creates query
     * @param  {Object} model query model
     * @return {void}
     */
    createQuery: function (model) {
        var layer = Radio.request("ModelList", "getModelByAttributes", {id: model.layerId}),
            query;

        if (!_.isUndefined(layer) && layer.has("layer")) {
            query = this.getQueryByTyp(layer.get("typ"), model);
            if (!_.isNull(query)) {
                if (!_.isUndefined(this.get("allowMultipleQueriesPerLayer"))) {
                    _.extend(query.set("activateOnSelection", !this.get("allowMultipleQueriesPerLayer")));
                }
                if (!_.isUndefined(this.get("liveZoomToFeatures"))) {
                    query.set("liveZoomToFeatures", this.get("liveZoomToFeatures"));
                }
                if (!_.isUndefined(this.get("sendToRemote"))) {
                    query.set("sendToRemote", this.get("sendToRemote"));
                }
                if (!_.isUndefined(this.get("minScale"))) {
                    query.set("minScale", this.get("minScale"));
                }
                if (query.get("isSelected")) {
                    query.setIsDefault(true);
                    query.setIsActive(true);
                }
                this.get("queryCollection").add(query);
            }
        }
    },

    /**
     * creates query
     * @param  {String} layerTyp layer type. e.g. "WFS" or "GROUP"
     * @param  {Object} model query model
     * @return {void}
     */
    getQueryByTyp: function (layerTyp, model) {
        var query = null;

        if (layerTyp === "WFS" || layerTyp === "GROUP") {
            query = new WfsQueryModel(model);
        }
        else if (layerTyp === "GeoJSON") {
            query = new GeoJsonQueryModel(model);
        }
        return query;
    },

    /**
     * sets isActive
     * @param  {Boolean} value is active or not
     * @return {void}
     */
    setIsActive: function (value) {
        this.set("isActive", value);
    },

    /**
     * sets isActive
     * @fires GFI#RadioTriggerGFISetIsVisible
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @return {void}
     */
    closeGFI: function () {
        Radio.trigger("GFI", "setIsVisible", false);
        Radio.trigger("MapMarker", "hideMarker");
    },

    /**
     * removes the selected snippet when filter is closed
     * @return {void}
     */
    collapseOpenSnippet: function () {
        var selectedQuery = this.get("queryCollection").findWhere({isSelected: true}),
            snippetCollection,
            openSnippet;

        if (!_.isUndefined(selectedQuery)) {
            snippetCollection = selectedQuery.get("snippetCollection");
            openSnippet = snippetCollection.findWhere({isOpen: true});
            if (!_.isUndefined(openSnippet)) {
                openSnippet.setIsOpen(false);
            }
        }
    },

    /**
     * removes the selected snippet when filter is closed
     * @param {String} layerId target model's layer id
     * @param {Object[]} queryCollection all query models
     * @returns {Boolean} returns true or false
     */
    isModelInQueryCollection: function (layerId, queryCollection) {
        var searchQuery = queryCollection.findWhere({layerId: layerId.toString()});

        return !_.isUndefined(searchQuery);
    },

    /**
     * Sets the attributes isActive and isVisible to true for the first model of the passed array.
     * @param {Object[]} queryCollectionModels - configured models in filter
     * @returns {void}
     */
    activateLayer: function (queryCollectionModels) {
        if (queryCollectionModels.length) {
            queryCollectionModels[0].attributes.isActive = true;
            queryCollectionModels[0].attributes.isSelected = true;
        }
    },

    /**
     * checks whether only one query is visible. if so, this query is selected
     * @returns {void}
     */
    checkVisibleQueries: function () {
        const visibleQueries = this.get("queryCollection").where({isLayerVisible: true});

        if (visibleQueries.length === 1) {
            this.get("queryCollection").forEach(function (query) {
                query.setIsSelected(false);
            });
            visibleQueries[0].setIsSelected(true);
        }
    },

    /**
     * setter for isInitOpen
     * @param {Boolean} value isInitOpen
     * @returns {void}
     */
    setIsInitOpen: function (value) {
        this.set("isInitOpen", value);
    },

    /**
     * setter for deatailview
     * @param {Object} value detail view
     * @returns {void}
     */
    setDetailView: function (value) {
        this.set("detailView", value);
    }
});

export default FilterModel;
