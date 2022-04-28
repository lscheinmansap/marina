sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/vbm/Spot",
    "sap/ui/vbm/Circle",
    "sap/ui/vbm/Container",
    "sap/ui/vbm/Area",
    "sap/ui/vbm/Route",
    "sap/m/Image",
    "sap/m/Dialog",
	"sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/m/Slider",
    "sap/m/MessageToast",
    "sap/m/Switch",
    "sap/m/FlexBox",
    "marina/utils/fastAPI",
    "sap/m/MultiComboBox",
    "sap/ui/core/Item",
    "sap/ui/unified/MenuItem"

], function (Controller, JSONModel, Spot, Circle, Container, Area, Route, Image, Dialog, DialogType, Button, ButtonType, Text, Slider, MessageToast, Switch, FlexBox, fastAPI, MultiComboBox, Item,
    MenuItem) {
    "use strict";
    return Controller.extend("marina.controller.GeoMap", {

        onInit: function () {
            const currentMap = "currentMap"
            var oGeoMapA = this.getView().byId("geoMapA");
            var oGeoMapB = this.getView().byId("geoMapB");
            var url_reduced = "https://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/reduced.day/{LOD}/{X}/{Y}/256/png8?app_id=EDg91hW3LxiYy5m8rMtW&app_code=sPyvKymXGuEuEUM14nq3dw"
            var url_hybrid = "https://2.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/hybrid.day/{LOD}/{X}/{Y}/256/png8?app_id=EDg91hW3LxiYy5m8rMtW&app_code=sPyvKymXGuEuEUM14nq3dw"
            var url_terrain = "https://1.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/terrain.day/{LOD}/{X}/{Y}/256/png8?app_id=EDg91hW3LxiYy5m8rMtW&app_code=sPyvKymXGuEuEUM14nq3dw"
            sap.ui.getCore().setModel(new JSONModel({
                "currentPosition": "0.9;40.5;0",
                "currentZoom": "4",
                "currentMapId": this.getView().byId("geoMapA").sId,
                "selectedCategories": ['NA', 'GPE', 'LOC']
            }), currentMap)
            var oMapConfigA = {
                "MapProvider": [{
                "name": "HEREMAPS",
                "tileX": "256",
                "tileY": "256",
                "maxLOD": "20",
                "Source": [{
                    "id": "s1",
                    "url": url_reduced
                    }]
                }],
                "MapLayerStacks": [
                    {
                    "name": "DEFAULT",
                    "MapLayer": {
                    "name": "layer1",
                    "refMapProvider": "HEREMAPS",
                    "opacity": "1.0",
                    "colBkgnd": "RGB(255,255,255)"
                }
                }]
            };
            oGeoMapA.setMapConfiguration(oMapConfigA);
            oGeoMapA.setRefMapLayerStack("DEFAULT");
            var oMapConfigB = {
                "MapProvider": [{
                "name": "HEREMAPS",
                "type": "",
                "description": "",
                "tileX": "256",
                "tileY": "256",
                "maxLOD": "20",
                "copyright": "",
                "Source": [{
                    "id": "s2",
                    "url": url_hybrid
                    }]
                }],
                "MapLayerStacks": [
                    {
                    "name": "DEFAULT",
                    "MapLayer": {
                    "name": "layer1",
                    "refMapProvider": "HEREMAPS",
                    "opacity": "1.0",
                    "colBkgnd": "RGB(255,255,255)"
                }
                }]
            };
            oGeoMapB.setMapConfiguration(oMapConfigB);
            oGeoMapB.setRefMapLayerStack("DEFAULT");
            oGeoMapA.setInitialPosition(sap.ui.getCore().getModel(currentMap).getData().currentPosition)
            oGeoMapA.setInitialZoom(sap.ui.getCore().getModel(currentMap).getData().currentZoom)
            oGeoMapB.setInitialPosition(sap.ui.getCore().getModel(currentMap).getData().currentPosition)
            oGeoMapB.setInitialZoom(sap.ui.getCore().getModel(currentMap).getData().currentZoom)
            // Make each map's ID available to the general model
            sap.ui.getCore().setModel(new JSONModel({
                id: this.getView().getId(),
                sGeoMapAId: oGeoMapA.getId(),
                sGeoMapBId: oGeoMapB.getId(),
                sGeoMapSpotsIdA: this.byId("geoMapSpotsA").getId(),
                sGeoMapSpotsIdB: this.byId("geoMapSpotsB").getId(),
                sGeoMapContainersIdA: this.byId("geoMapContainersA").getId(),
                sGeoMapContainersIdB: this.byId("geoMapContainersB").getId(),
                sGeoMapAreasIdA: this.byId("geoMapAreasA").getId(),
                sGeoMapCirclesIdA: this.byId("geoMapCirclesA").getId(),
                sGeoMapCirclesIdB: this.byId("geoMapCirclesB").getId(),
                sGeoMapRoutesA: this.byId("geoRoutesA").getId(),
                locationsIndex: {},
                geometriesIndex: {},
                geoSearchIndex: {},
                searchShapeString: "",
                hazardShapeString: "",
                wayPoints: [],
                routes: [],
                shapeEditor: "search"
            }), "advancedMapConfig")
            this.geoSearchModel = new JSONModel();
            this.geoSearchModel.loadData(sap.ui.require.toUrl("marina/model/workbenchVariables.json"))
        },

        onSelectionChange: function (oEvent){
            var selection = oEvent.getSource().getSelectedItem().mProperties.icon
            if(selection === 'sap-icon://search'){
                sap.ui.getCore().getModel("advancedMapConfig").getData().shapeEditor = "search"
                sap.ui.getCore().getModel("advancedMapConfig").getData().searchShapeString = ""
            } else if(selection === 'sap-icon://warning2') {
                sap.ui.getCore().getModel("advancedMapConfig").getData().shapeEditor = "hazard"
                sap.ui.getCore().getModel("advancedMapConfig").getData().hazardShapeString = ""
            } else if(selection === 'sap-icon://map-3'){
                sap.ui.getCore().getModel("advancedMapConfig").getData().shapeEditor = "waypoints"
            }
        },

        setSearchShape: function(lon_lat){
            var newSearchString = sap.ui.getCore().getModel("advancedMapConfig").getData().searchShapeString + lon_lat,
                searchAreas = this.byId("geoSearchShapesA")
            if(sap.ui.getCore().getModel("advancedMapConfig").getData().searchShapeString === ""){
                searchAreas.addItem(new Area({
                    click: this.onClickSearchArea,
                    contextMenu: this.onclickSearchContext,
                    color: "rgba(92;186;230;0.6)",
                    colorBorder: "rgba(118,118,118,0.6)",
                    position: newSearchString
                }))
            } else {
                searchAreas.getItems()[searchAreas.getItems().length - 1].setPosition(newSearchString)
            }
            if(searchAreas.getItems().length > 3){
                console.log(searchAreas.getItems().length)
            }
            sap.ui.getCore().getModel("advancedMapConfig").getData().searchShapeString = newSearchString
        },

        setHazardShape: function(lon_lat){
            var newHazardString = sap.ui.getCore().getModel("advancedMapConfig").getData().hazardShapeString + lon_lat,
                hazardAreas = this.byId("geoHazardShapesA")
            if(sap.ui.getCore().getModel("advancedMapConfig").getData().hazardShapeString === ""){
                hazardAreas.addItem(new Area({
                    click: this.onClickSearchArea,
                    contextMenu: this.onclickSearchContext,
                    color: "rgba(255;174;33;0.6)",
                    colorBorder: "rgba(82,52,0,0.6)",
                    position: newHazardString
                }))
            } else {
                hazardAreas.getItems()[hazardAreas.getItems().length - 1].setPosition(newHazardString)
            }
            sap.ui.getCore().getModel("advancedMapConfig").getData().hazardShapeString = newHazardString
        },

        setWayPoint: function (lon_lat){
            sap.ui.getCore().getModel("advancedMapConfig").getData().wayPoints.push(lon_lat)
            var wayPoint = new Spot({
                alignment: 0,
                position: lon_lat,
                text: sap.ui.getCore().getModel("advancedMapConfig").getData().wayPoints.length,
                contentColor: "rgb(255,255,255)",
                contextMenu: this.onClickWayPoint
            })
            this.byId("geoWayPointsA").addItem(wayPoint)
            if(sap.ui.getCore().getModel("advancedMapConfig").getData().wayPoints.length > 1){
                this.getShortestPathBetweenPoints()
            }
        },

        getShortestPathBetweenPoints: function (){
            var points = sap.ui.getCore().getModel("advancedMapConfig").getData().wayPoints,
                aPoints = []
            points.forEach(function (oPos){
                aPoints.push(
                    String(oPos.split(';')[0]) + ';' + String(oPos.split(';')[1])
                )
            })
            //API call with list
            fastAPI.getShortestPathBetweenPoints(aPoints.join(','))
            .then((results) =>{
                MessageToast.show(results.message)
                if(results.paths.length > 0){
                    var oRoutes = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapRoutesA),
                        aRoutes = sap.ui.getCore().getModel("advancedMapConfig").getData().routes
                    results.paths.forEach(function (sRoute) {
                        if(!aRoutes.includes(sRoute.key)){
                            aRoutes.push(sRoute.key)
                            oRoutes.addItem(new Route({
                                key: sRoute.key,
                                position: sRoute.geometry,
                                color: "rgba(92,186,230,1.0)",
                                colorBorder: "rgb(255,255,255)"

                            }))
                        }
                    })


                }
            })
        },

        onClickWayPoint: function (oEvent){
            var oMenu = oEvent.getParameter("menu")
            oMenu.addItem(
                new MenuItem({
                    text: "Delete",
                    select: sap.ui.controller("marina.controller.GeoMap").onClickDeleteWayPoint,
                    customData: [
                        new sap.ui.core.CustomData({
                            key: "spotsObject",
                            value: oEvent.getSource().getParent().getId()
                        }),
                        new sap.ui.core.CustomData({
                            key: "spotId",
                            value: oEvent.getSource().getId()
                        }),
                    ]
                })
            )
            oEvent.getSource().openContextMenu(oMenu)
        },

        onClickDeleteWayPoint: function (oEvent){
            /**
             * Remove a way point and in doing so, reset the model storing the points and renumber the remaining way points and the paths between them.
             */
            // Set the variables
            var oWayPoints = sap.ui.getCore().byId(oEvent.getSource().getCustomData()[0].getValue()),
                oWayPoint = sap.ui.getCore().byId(oEvent.getSource().getCustomData()[1].getValue()),
                aWayPoints = sap.ui.getCore().getModel("advancedMapConfig").getData().wayPoints,
                sPosToRemove = oWayPoint.getPosition(),
                newPositions = [],
                iCount = 1
            // Remove the point 
            oWayPoints.removeItem(oWayPoint)
            // Reset the count of the remaining points
            oWayPoints.getItems().forEach(function (oPos){
                oPos.setText(iCount)
                iCount = iCount + 1
            })
            // Reset the model
            aWayPoints.forEach(function (sPos){
                if(sPos !== sPosToRemove){
                    newPositions.push(sPos)
                }
            })
            sap.ui.getCore().getModel("advancedMapConfig").getData().wayPoints = newPositions
        },

        onMapClick: function (oEvent){
            /***
             * Click on the map and depending on the context chosen from the legend list item selected in onSelectionChange, determine the operation on the map
             */
            var lon = Number((oEvent.getParameter('pos').split(";")[0])).toFixed(5),
                lat = Number((oEvent.getParameter('pos').split(";")[1])).toFixed(5),
                lon_lat = String(lon) + ";" + String(lat) + ";0;",
                shapeType = sap.ui.getCore().getModel("advancedMapConfig").getData().shapeEditor
            if(shapeType === 'search'){
                this.setSearchShape(lon_lat)
            } else if(shapeType === 'hazard') {
                this.setHazardShape(lon_lat)
            } else if(shapeType === 'waypoints'){
                this.setWayPoint(lon_lat)
            }
        },

        onClickSearchArea: function (oEvent){
            console.log(oEvent)

        },

        onclickSearchContext: function (oEvent){
            console.log(oEvent)

        },


        createMap: function (mapType) {
            var url_reduced = "https://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/reduced.day/{LOD}/{X}/{Y}/256/png8?app_id=EDg91hW3LxiYy5m8rMtW&app_code=sPyvKymXGuEuEUM14nq3dw"
            var url_hybrid = "https://2.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/hybrid.day/{LOD}/{X}/{Y}/256/png8?app_id=EDg91hW3LxiYy5m8rMtW&app_code=sPyvKymXGuEuEUM14nq3dw"
            var url_terrain = "https://1.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/terrain.day/{LOD}/{X}/{Y}/256/png8?app_id=EDg91hW3LxiYy5m8rMtW&app_code=sPyvKymXGuEuEUM14nq3dw"
            var url = url_hybrid
            if(mapType === "reduced") {
                url = url_reduced
            } else if(mapType === "terrain"){
                url = url_terrain
            }
            var oMapConfig = {
                "MapProvider": [{
                "name": "HEREMAPS",
                "type": "",
                "description": "",
                "tileX": "256",
                "tileY": "256",
                "maxLOD": "20",
                "copyright": "",
                "Source": [{
                    "id": "s1",
                    "url": url
                    }]
                }],
                "MapLayerStacks": [
                    {
                    "name": "DEFAULT",
                    "MapLayer": {
                        "name": "layer1",
                        "refMapProvider": "HEREMAPS",
                        "opacity": "1.0",
                        "colBkgnd": "RGB(255,255,255)"
                        }
                    }
                ]
            };
            var geoMap = new sap.ui.vbm.GeoMap()
            geoMap.setMapConfiguration(oMapConfig)
            geoMap.setRefMapLayerStack("DEFAULT")
            geoMap.attachCenterChanged(this.onMapChange)
            return geoMap

        },

        onClickCircle: function (oEvent) {
            var key = oEvent.oSource.getKey()
            sap.ui.controller("marina.controller.NetworkGraph").zoomToNode(key)
        },

        onClickSpot: function (oEvent) {
            var key = oEvent.oSource.getKey()
            sap.ui.controller("marina.controller.NetworkGraph").zoomToNode(key)
        },

        onClickContainer: function (oEvent) {
            var key = oEvent.oSource.getKey()
            sap.ui.controller("marina.controller.NetworkGraph").zoomToNode(key)
        },

        goToPosition: function (sPosition) {

            sap.ui.getCore().byId(sap.ui.getCore().getModel("currentMap").getData().currentMapId).setCenterPosition(sPosition)
        },

        onMapChange: function (oEvent) {
            /**
             * Save the current map's zoom and position so it can be applied to the other map when content is changed
             */
            var currentMapId = sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapAId
            if(oEvent.getSource().sId.includes("geoMapB")){
                currentMapId = sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapBId
            }
            sap.ui.getCore().setModel(new JSONModel({
                "currentPosition": oEvent.getSource().getCenterPosition(),
                "currentZoom": oEvent.getSource().getZoomlevel(),
                "currentMapId": currentMapId,
                "selectedCategories": ['NA', 'GPE', 'LOC']
            }), "currentMap")
        },

        updateBasedOnGraphResults: function (locations, geometries) {
            /**
             * Expect a model of locations in Spot format that have positions and types. 
             * Update each of the maps' Spots aggregations with the new positions.
             * If there is an image, then create a container for it and add the container instead of the Spot
             * 
             */
            var aLocIndex = sap.ui.getCore().getModel("advancedMapConfig").getData().locationsIndex,
                gLocIndex = sap.ui.getCore().getModel("advancedMapConfig").getData().geometriesIndex
            var aSpots = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapSpotsIdA)
            var bSpots = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapSpotsIdB)
            var aConts = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapContainersIdA)
            var bConts = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapContainersIdB)
            var aAreas = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapAreasIdA)
            locations.forEach(function (item){
                if(!aLocIndex.hasOwnProperty(item.key)){
                    aLocIndex[item.key] = {mapA: 0, mapB: 0}
                    if(item.hasOwnProperty('image') && item.image !== undefined){
                        var aCont = new Container({
                            key: item.key,
                            position: item.position,
                            click: sap.ui.controller("marina.controller.GeoMap").onClickContainer,
                            item: new Image({
                                src: item.image,
                                width: "35px",
                            })
                        })
                        var bCont = new Container({
                            key: item.key,
                            position: item.position,
                            click: sap.ui.controller("marina.controller.GeoMap").onClickContainer,
                            item: new Image({
                                src: item.image,
                                width: "35px",
                            })
                        })
                        aConts.addItem(aCont)
                        bConts.addItem(bCont)
                        aLocIndex[item.key].mapA = aCont.sId
                        aLocIndex[item.key].mapB = bCont.sId
                    } else {
                        item.click = sap.ui.controller("marina.controller.GeoMap").onClickSpot
                        var aSpot = new Spot(item)
                        var bSpot = new Spot(item)
                        aSpots.addItem(aSpot)
                        bSpots.addItem(bSpot)
                        aLocIndex[item.key].mapA = aSpot.sId
                        aLocIndex[item.key].mapB = bSpot.sId
                    }
                }
                // Usability - Go to the last item added to the current map
                if(item !== undefined && item !== null){
                    sap.ui.getCore().byId(sap.ui.getCore().getModel("currentMap").getData().currentMapId).setCenterPosition(item.position)
                }
            })
            geometries.forEach(function (item){
                if(!gLocIndex.hasOwnProperty(item.key)){
                    gLocIndex[item.key] = {mapA: 0, mapB: 0}
                    var aArea = new Area(item)
                    var bArea = new Area(item)
                    aAreas.addItem(aArea)
                    
                }
            })
        },

        startGeoSearch: function (radius, lat, lon, resultType) {
            var oMap = this.getView().byId(sap.ui.getCore().getModel('currentMap').getData().currentMapId)
            oMap.setBusy(true)
            var sCatFilter = sap.ui.getCore().getModel('currentMap').getData().selectedCategories.join()
            fastAPI.getGeoSearch(radius, lat, lon, resultType, sCatFilter)
            .then((results) =>{
                MessageToast.show(results.message)
                var aCircles = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapCirclesIdA),
                    bCircles = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapCirclesIdB),
                    searchIndex = sap.ui.getCore().getModel("advancedMapConfig").getData().geoSearchIndex,
                    aLocIndex = sap.ui.getCore().getModel("advancedMapConfig").getData().locationsIndex
                results.locations.forEach(function (item){
                    if(!searchIndex.hasOwnProperty(item.key) && !aLocIndex.hasOwnProperty(item.key)){
                        item.click = sap.ui.controller("marina.controller.GeoMap").onClickCircle
                        var aCircle = new Circle(item)
                        var bCircle = new Circle(item)
                        aCircles.addItem(aCircle)
                        bCircles.addItem(bCircle)
                        searchIndex[item.key] = {
                            mapA: aCircle.sId, 
                            mapB: bCircle.sId
                        }
                        aLocIndex[item.key] = {
                            mapA: aCircle.sId, 
                            mapB: bCircle.sId
                        }
                    }
                })
                sap.ui.getCore().getModel('currentMap').getData().selectedCategories = ['NA', 'GPE', 'LOC']
                oMap.setBusy(false)
            })
        },

        onFilterSelectionChange: function (oEvent){
            sap.ui.getCore().getModel('currentMap').getData().selectedCategories = oEvent.getSource().getSelectedKeys()
        },

        onMapSearch: function (oEvent) {
            var geoCategoryMultiBox = new MultiComboBox({
                selectionChange: this.onFilterSelectionChange,
                maxWidth: "400px"
            })
            this.geoSearchModel.oData.locationTypes.forEach(function (item){
                geoCategoryMultiBox.addItem(new Item({
                    key: item.text, text: item.text
                }))
            })
            var lon = Number((oEvent.getParameter('pos').split(";")[0])).toFixed(5),
                lat = Number((oEvent.getParameter('pos').split(";")[1])).toFixed(5),
                km = 150

            this.geoSearchSlider = new Slider({
                min: 1, max: 1000, value: km,
                inputsAsTooltips: true, showAdvancedTooltip: true, showHandleTooltip: false
            })

            this.resultType = new Switch({
                state: true, customTextOn: "Yes", customTextOff: "No"})
            this.geoSearchDialog = new Dialog({
                type: DialogType.Message,
                title: "Geo Search: Range in KM",
                content: new FlexBox({direction: "Column", items: [
                    new Text({text: "Choose search radius in KM around Latitude: " + lat + " Longitude: " + lon}),
                    this.geoSearchSlider,
                    new Text({text: "Include connectivity statistics:"}),
                    this.resultType,
                    new Text({text: "Filter by geographic category"}),
                    geoCategoryMultiBox
                ]}),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: "Search",
                    press: function () {
                        this.startGeoSearch(this.geoSearchSlider.getValue(), lat, lon, this.resultType.getState());
                        this.geoSearchDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () {
                        this.geoSearchDialog.close();
                    }.bind(this)
                })
            })

            this.geoSearchDialog.open()

        },

        clearSpots: function () {
            // Remove the spots from the map and set the aggregation items to an empty array
            var mapa = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapSpotsIdA)
            var mapb = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapSpotsIdB)
            mapa.removeAllItems()
            mapb.removeAllItems()
            mapa.mAggregations.items = []
            mapb.mAggregations.items = []
            var mapContA = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapContainersIdA)
            var mapContB = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapContainersIdB)
            mapContA.removeAllItems()
            mapContB.removeAllItems()
            mapContA.mAggregations.items = []
            mapContB.mAggregations.items = []
            var mapCircA = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapCirclesIdA)
            var mapCircB = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapCirclesIdB)
            mapCircA.removeAllItems()
            mapCircB.removeAllItems()
            mapCircA.mAggregations.items = []
            mapCircB.mAggregations.items = []
            var mapAreas = sap.ui.getCore().byId(sap.ui.getCore().getModel("advancedMapConfig").getData().sGeoMapAreasIdA)
            mapAreas.removeAllItems()
            mapAreas.mAggregations.items = []
            sap.ui.getCore().getModel("advancedMapConfig").getData().locationsIndex = {}
            sap.ui.getCore().getModel("advancedMapConfig").getData().geometriesIndex = {}
            sap.ui.getCore().getModel("advancedMapConfig").getData().geoSearchIndex = {}
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().locations = []
            sap.ui.getCore().getModel("GRAPH_MODEL").getData().geometries = []
        }   
    })
});