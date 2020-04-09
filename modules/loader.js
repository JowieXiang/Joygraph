import {tools, general} from "./tools";
import {addPolyfills} from "./polyfills";

import ColorCodeMapView from "./colorCodeMap/view";
import DashboardView from "./dashboard/view";
import DashboardTableView from "./dashboardTable/view";
import ContextMenuView from "./contextMenu/view";
import SelectDistrictView from "./selectDistrict/view";
import SaveSelectionCosiView from "./saveSelection/view";
import InfoScreenView from "./infoScreen/view";
import TimeSliderView from "./timeSlider/view";
import CalculateRatioView from "./calculateRatio/selectView";
import ReachabilityFromPointView from "./reachabilityFromPoint/view";
import ReachabilityInAreaView from "./reachabilityInArea/view";
import PrintView from "../../../modules/tools/print/view";
import GraphModel from "./graph_v2/model";
import ReachabilitySelectView from "./reachabilitySelect/view";
import {storageListener, updateFromStorage, setupStorage} from "./storage";
import CompareDistrictsView from "./compareDistricts/view";
import RefocusView from "./controls/refocus/view";
import FilterView from "./filter/view";

import "../cosi.style.less";

/**
 * Handles the loading of CoSI custom modules and methodes, incl. some global functions and polyfills
 * @returns {void}
 * @todo refine / refactor CoSI custom structure -> possibly migrate away from Backbone.js, integrate CoSI through and more adaptable frontend within the Masterportal
 */
function initializeCosi () {
    var infoScreenOpen = JSON.parse(window.localStorage.getItem("infoScreenOpen"));

    addPolyfills();

    // check if browser is IE or Edge for InfoScreen to assign localStorage to opener
    // to do
    if (window.detectMS() && window.location.pathname.includes("infoscreen.html")) {
        // ..
    }

    const dashboard = new DashboardView({model: general.dashboard});

    new DashboardTableView({model: general.dashboardTable});
    new ContextMenuView();
    new GraphModel();
    new TimeSliderView();

    // Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(general));
    Object.values(general).forEach(function (gen) {
        Radio.trigger("ModelList", "replaceModelById", gen.get("id"), gen);
    });
    // Handle TouchScreen / InfoScreen Loading
    if (!window.location.pathname.includes("infoscreen.html")) {
        window.localStorage.clear();
        window.name = "TouchScreen";

        Object.values(tools).forEach(function (tool) {
            Radio.trigger("ModelList", "replaceModelById", tool.get("id"), tool);
        });
        // Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(tools));
        new FilterView({model: tools.filter});
        new CalculateRatioView({model: tools.calculateRatio});
        new ReachabilitySelectView({model: tools.reachabilitySelect});
        new ReachabilityFromPointView({model: tools.reachabilityFromPoint});
        new ReachabilityInAreaView({model: tools.reachabilityInArea});
        new ColorCodeMapView({model: tools.colorCodeMap});
        new SaveSelectionCosiView({model: tools.saveSelectionCosi});
        new SelectDistrictView({model: tools.selectDistrict});
        new PrintView({model: tools.print});
        new CompareDistrictsView({model: tools.compareDistricts});
        $(document).ready(function () {
            new RefocusView({el: addRowTR("refocus")});
        });

    }
    else {
        // load dashboard content into infoscreen window
        new InfoScreenView({
            title: "CoSI InfoScreen",
            children: [dashboard]
        });
    }

    setupStorage();

    storageListener([
        general.dashboard,
        general.dashboardTable,
        general.dashboardWidgetHandler,
        tools.infoScreenHandler
    ]);

    updateFromStorage([
        general.dashboardTable
    ]);

    if (!window.location.pathname.includes("infoscreen.html")) {
        window.localStorage.setItem("infoScreenOpen", JSON.stringify(infoScreenOpen));
        tools.selectDistrict.set("isActive", true);
    }

    Radio.trigger("General", "loaded");
    addInfoButtons();
    addZoomToCoordListener(".zoom-to-coord");
}


/**
 * kleiner Hack um Info Button für die Fachdaten anzeigen zu lassen
 * @returns {void}
 */
function addInfoButtons () {
    Backbone.Radio.on("ModelList", "updatedSelectedLayerList", function () {
        if (document.getElementById("Overlayer") !== null) {
            if (document.getElementById("Overlayer").hasChildNodes()) {
                const list = document.getElementById("Overlayer").getElementsByTagName("li");

                for (const item of list) {
                    if (item.children.length === 2 && item.style.paddingLeft === "5px") {
                        const node = document.createElement("SPAN");

                        node.className = "glyphicon glyphicon-info-sign pull-right";
                        node.addEventListener("click", function () {
                            Radio.trigger("Alert", "alert:remove");
                            Radio.trigger("Alert", "alert", `<ul><li><b>Fachdaten - Analyse / Simulation:</b> Die Fachdaten in dieser Gruppe können mit den COSI Analysewerkzeugen verwendet werden.</li><li>
                                                                <b>Fachdaten - Darstellung:</b> Die Fachdaten in dieser Gruppe werden in COSI nur dargestellt und können nicht mit den Analysewerkzeugen verwendet werden.</li></ul>`);
                        });
                        item.appendChild(node);
                    }
                }
            }
        }
    });
}

/**
 * Adds an div-container to the top-right container and places the id of the control to be rendered.
 * @param {String} id Id of control
 * @param {Boolean} showMobile Flag if control should also be shown in mobile mode
 * @returns {object} - JQueryObject of the generated element
 */
function addRowTR (id) {
    $(".controls-view").find(".control-view-top-right").append("<div class='row controls-row-right hidden-xs' id='" + id + "'></div>");
    return $(".controls-view").find(".control-view-top-right").children().last();
}

/**
 * adds an event listener to a class to trigger zoomToCoord ignorant to the view or model
 * triggers zoom to coord on the remote screen, when a certain class with attribute "coord" is clicked
 * @param {string} querySelector the querySelector to add the listener to
 * @returns {void}
 */
function addZoomToCoordListener (querySelector) {

    $(document).on("click", querySelector, (evt) => {
        const coord = evt.target.getAttribute("coord").split(",").map(val => parseFloat(val));

        if (Radio.request("InfoScreen", "getIsInfoScreen")) {
            Radio.trigger("InfoScreen", "triggerRemote", "MapMarker", "showMarker", [coord]);
            Radio.trigger("InfoScreen", "triggerRemote", "MapMarker", "setCenter", [coord]);
        }
        else {
            Radio.trigger("MapMarker", "showMarker", coord);
            Radio.trigger("MapView", "setCenter", coord);
        }
    });
}

export default initializeCosi;
